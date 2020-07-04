class PaintAgent  {

	getId() {
		return 'Paint';
	}

	getPaintContext() {
		console.log( "Paintcontext = " + this.state.paintContext );
		return this.state.paintContext;
	}

    constructor( _bus, _constants, _SCRW, _SCRH, _viewprio ) {

		this.bus = _bus;
		this.SCRW = _SCRW;
		this.SCRH = _SCRH;

		this.constants = _constants;

		this.zoomMove = 15;

		var viewBGImage = new Image();
		viewBGImage.src = 'res/img/bgpattern2.png';
		this.defaultPictureBrush = new ImageURLBrush( 'res/img/dummybrush.png',
				{ obj:this,  method: 'loadedDefaultBrush' } );

		console.log("Creating default brush");

		this.view = new PaintView( _SCRW, _SCRH, viewBGImage, _viewprio  );
		this.state = new PaintState( _SCRW, _SCRH, _bus ); //TODO remove bus

		this.state.paintName = _constants.initialImageName;

		this.brush = { show: false, simple: true };

		/* Self register */
		this.bus.register( this, [ "APPMOUSE", "APPKEYBOARD", "PAINT" ], this.getId() );

	}

	/* callback */
	loadedDefaultBrush() {

		console.log("Loaded default brush");
		this.state.setImageBrushFromImageURLBrush( this.defaultPictureBrush );

	}

	/* agent interface */

	/* Activate Browser events */
	activate() {



		console.log("activating loading of default brush");
		this.defaultPictureBrush.activateLoadingEvents();


		this.timer = null;

		this.resetUpdateTimer();

	}

	resetUpdateTimer() {

		if( this.timer != null ) {
			clearInterval( this.timer );
			this.timer = null;
		}

		var __this = this;
		var paintCanvas = this.state.paintCanvas;
		var paintContext = this.state.paintContext;
		var overlay = this.state.overlay;
		var stencilObject = this.state.stencilObject;

		this.timer = setInterval(
			function() {

				if( __this.state.mouseState.anyButtons() && __this.state.functionNeedsTimer() ) {
					__this.state.setDrawMode();
					var stat = __this.state.drawFunction.mouseMove( __this.state  );
					__this.state.unsetDrawMode();
				}

				__this.view.timerUpdateView( paintCanvas, paintContext, overlay, stencilObject );

				var sig = [];
				sig[0] = "SCREENUPDATER";
				sig[1] = "REFRESH";

				__this.bus.post( sig );

			}
			, 100
			);
	}

	/* Handle Browser events */
	handleEvent(evt) {
	  	/* Nothing Here, Input only from Agents, see handleInputSignal */
	}

	delayedEventFill()	{

		painted = this.state.drawFunction.mouseUp( this.state  );
	}


	/* App events */
	handleInputSignal( sig ) {

		var sig2 = [];

		if( sig[ 0 ] == 'APPMOUSE' ) {
			var pos2 = this.view.transformMouseCoords( sig.data.appPos );
			this.state.updateMouseXY( sig.data.appPos, pos2 );

			var painted = false;
			var overlay = false;

			switch( sig[ 1 ] ) {
				case 'ENTER':
					sig2[0] = "SCREENUPDATER";
					sig2[1] = "PAINTMOUSEPOINTER";
					sig2.data = undefined;
					this.bus.post( sig2 );



					if( !this.state.mouseState.anyButtons() ) {
							this.abortDraw();
					}
					else {
								this.saveUndoSmart( this.state.drawFunctionName );
					}

					this.state.mouseState.resetButtons();
					if( sig.data.buttonId == 'left' || sig.data.buttonId == 'right' ) {
						this.state.mouseState.updateButton( sig.data.buttonId , false )
					}


				break;
				case 'DOWN':
					this.state.updateButton( sig.data.buttonId , true );

					if( this.state.drawFunctionName == 'fill' || this.state.drawFunctionName == 'fill2' ) {

						sig2[0] = "SCREENUPDATER";
						sig2[1] = "BUSYMOUSEPOINTER";
						sig2.data = undefined;
						this.bus.post( sig2 );
					}
					else if( this.state.drawFunctionName == 'grabbrush' ) {

						sig2[0] = "SCREENUPDATER";
						sig2[1] = "GRABPOINTER";
						sig2.data = undefined;
						this.bus.post( sig2 );
					}
					else if( this.state.drawFunctionName == 'magicgrabbrush' ) {

						sig2[0] = "SCREENUPDATER";
						sig2[1] = "GRABPOINTER";
						sig2.data = undefined;
						this.bus.post( sig2 );
					}
					else if( this.state.drawFunctionName == 'grabfillbrush' ) {

						sig2[0] = "SCREENUPDATER";
						sig2[1] = "FILLPOINTER";
						sig2.data = undefined;
						this.bus.post( sig2 );
					}

					this.state.bufferForUndo();


					this.state.setDrawMode();
					var stat = this.state.drawFunction.mouseDown( this.state  );
					this.state.unsetDrawMode();

					painted = stat.painted;
					overlay = stat.overlay;
				break;
				case 'UP':
					this.state.updateButton( sig.data.buttonId , false );

					if( this.state.drawFunctionName == 'selectpoint' ) {

						var status = this.state.drawFunction.mouseUp( this.state  );
						var functionId = status.functionId;
						var functionData = status.functionData;

						painted = status.painted;

						if( functionId == 'ZOOMRELATIVE' ) {

							var rzf = 1;
							if( sig.data.buttonId == 'right') {
								rzf = -1;
							}
							this.view.changeZoomFactorRel( rzf );
							this.view.changeZoomFactorRel( rzf );
							this.view.changeZoomFactorRel( rzf );
							this.view.changeZoomFactorRel( rzf );
							this.view.changeZoomFactorRel( rzf );

							this.view.changeViewCursor( status.x, status.y );
							this.updateView();

							var sig = [];
							sig[0] = 'PANEL';
							sig[1] = 'ZOOMINFO';
							sig.data = this.view.getZoomFactor();

							this.bus.post( sig );

						}
						else if( functionId == 'ZOOMX' ) {

							this.view.setZoomFactor( functionData.zoomFactor );
							this.view.changeViewCursor( status.x, status.y );
							this.updateView();

							this.state.setFunction( functionData.prevFunction );

							var sig = [];
							sig[0] = 'PANEL';
							sig[1] = 'ZOOMINFO';
							sig.data = this.view.getZoomFactor();

							this.bus.post( sig );

							sig2[0] = "SCREENUPDATER";
							sig2[1] = "PAINTMOUSEPOINTER";
							sig2.data = undefined;
							this.bus.post( sig2 );

						}

						/*

						*/

					}
					else if( this.state.drawFunctionName == 'fill' || this.state.drawFunctionName == 'fill2' ) {

						painted = this.state.drawFunction.mouseUp( this.state  ).painted;


						sig2[0] = "SCREENUPDATER";
						sig2[1] = "FILLPOINTER";
						sig2.data = undefined;
						this.bus.post( sig2 );

						/*
						this.state.setFunction('simple');
						sig2[0] = "PANEL";
						sig2[1] = "PAINTMODE";
						sig2.data = "simple";

						this.bus.post( sig2 ); */
					}
					else if( this.state.drawFunctionName == 'grabbrush' ) {

						painted = this.state.drawFunction.mouseUp( this.state  ).painted;

						var xx1 = this.state.drawFunction.x1;
						var	yy1 = this.state.drawFunction.y1;
						var xx2 = this.state.drawFunction.x2;
						var	yy2 = this.state.drawFunction.y2;

						if( xx1 > xx2 ) {
						xx1 = this.state.drawFunction.x2;
						xx2 = this.state.drawFunction.x1;
						}

						if( yy1 > yy2 ) {
						yy1 = this.state.drawFunction.y2;
						yy2 = this.state.drawFunction.y1;
						}

						this.state.setImageBrush( xx1, yy1, xx2, yy2 );
						this.restoreOverlay();

						var sig = [];
						sig[0] = 'PANEL';
						sig[1] = 'BRUSHINFO';
						sig.data = {};
						sig.data.w = this.state.getBrush().w;
						sig.data.h = this.state.getBrush().h;
						sig.data.dynamicColor = this.state.getBrush().colorized ||
																					this.state.getBrush().colorable;
						this.bus.post( sig );

						this.state.setFunction('simple');
						sig2[0] = "PANEL";
						sig2[1] = "PAINTMODE";
						sig2.data = "simple";
						this.bus.post( sig2 );

						sig2[0] = "PANEL";
						sig2[1] = "BRUSHMODEGRAB";
						sig2.data = null;
						this.bus.post( sig2 );

						sig2[0] = "SCREENUPDATER";
						sig2[1] = "PAINTMOUSEPOINTER";
						sig2.data = undefined;
						this.bus.post( sig2 );

					}
					else if( this.state.drawFunctionName == 'magicgrabbrush' ) {

						var fstate = this.state.drawFunction.mouseUp( this.state  );
						painted = fstate.painted;

						this.state.setImageBrushFromArea( fstate.area );
						//this.state.overlay.clear();

						this.state.setFunction('simple');

						var sig = [];
						sig[0] = 'PANEL';
						sig[1] = 'BRUSHINFO';
						sig.data = {};
						sig.data.w = this.state.getBrush().w;
						sig.data.h = this.state.getBrush().h;
						sig.data.dynamicColor = this.state.getBrush().colorized ||
																					this.state.getBrush().colorable;
						this.bus.post( sig );

						sig2[0] = "PANEL";
						sig2[1] = "PAINTMODE";
						sig2.data = "simple";
						this.bus.post( sig2 );

						sig2[0] = "PANEL";
						sig2[1] = "BRUSHMODEGRAB";
						sig2.data = null;
						this.bus.post( sig2 );

						sig2[0] = "SCREENUPDATER";
						sig2[1] = "PAINTMOUSEPOINTER";
						sig2.data = undefined;
						this.bus.post( sig2 );

					}
					else if( this.state.drawFunctionName == 'grabfillbrush' ) {

						painted = this.state.drawFunction.mouseUp( this.state  ).painted;

						var xx1 = this.state.drawFunction.x1;
						var	yy1 = this.state.drawFunction.y1;
						var xx2 = this.state.drawFunction.x2;
						var	yy2 = this.state.drawFunction.y2;

						if( xx1 > xx2 ) {
						xx1 = this.state.drawFunction.x2;
						xx2 = this.state.drawFunction.x1;
						}

						if( yy1 > yy2 ) {
						yy1 = this.state.drawFunction.y2;
						yy2 = this.state.drawFunction.y1;
						}

						this.state.setPaintBGBrush( xx1, yy1, xx2, yy2 );

						this.restoreOverlay();

						this.state.setFunction('fill2');

						sig2[0] = "SCREENUPDATER";
						sig2[1] = "FILLPOINTER";
						sig2.data = undefined;
						this.bus.post( sig2 );

					}
					else if( this.state.drawFunctionName == 'picker' ) {

						var stat = this.state.drawFunction.mouseUp( this.state  );
						painted = stat.painted;

						if( stat.x != undefined && stat.y != undefined ) {

							var col = this.state.pickColor( stat.x, stat.y  );

							if( stat.color == 'fg' ) {
								if( this.state.drawFunctionParam == 'fg') {
									this.state.updateFGColor( col[0], col[1], col[2], 255 );
									sig2[0] = "PANEL";
									sig2[1] = "SETCOLOR";
									sig2.data = col;
									this.bus.post( sig2 );
								}
								else if( this.state.drawFunctionParam == 'fc') {
									this.state.updateFillColor( col[0], col[1], col[2], 255 );
									sig2[0] = "PANEL";
									sig2[1] = "SETFILLCOLOR";
									sig2.data = col;
									this.bus.post( sig2 );
								}
							}
							else if( stat.color == 'bg' ) {
								this.state.updateBGColor( col[0], col[1], col[2], 255 );
								sig2[0] = "PANEL";
								sig2[1] = "SETBGCOLOR";
								sig2.data = col;
								this.bus.post( sig2 );
							}

							this.state.setFunction('simple');


						}

						this.state.setFunction('simple');
						sig2[0] = "PANEL";
						sig2[1] = "PAINTMODE";
						sig2.data = "simple";
						this.bus.post( sig2 );

						sig2[0] = "SCREENUPDATER";
						sig2[1] = "PAINTMOUSEPOINTER";
						sig2.data = undefined;
						this.bus.post( sig2 );


					}
					else {

						this.state.setDrawMode();
						painted = this.state.drawFunction.mouseUp( this.state  ).painted;
						this.state.unsetDrawMode();
					}

					this.saveUndoSmart( this.state.drawFunctionName );

				break;
				case 'ENTER':
					this.state.updateLeftButton( false );
					painted = this.state.drawFunction.mouseUp( this.state  ).painted;
				break;
				case 'MOVE':

				 	this.state.setDrawMode();

					var stat = this.state.drawFunction.mouseMove( this.state  );

				 	this.state.unsetDrawMode();

					painted = stat.painted;
					overlay = stat.overlay;

					sig2[0] = "PANEL";
					sig2[1] = "COORDINFO";
					sig2.data = this.state.mouseState;
					this.bus.post( sig2 );

					this.state.overlay.setIntersectCoords(
					 		this.state.mouseState.x,
							this.state.mouseState.y,
							this.state.PNTW,
							this.state.PNTH
						);
					overlay = true;

				break;

				default:
				return;
			}

			if( painted || overlay ) {
					this.updateView();
			}
		}
		else if( sig[ 0 ] == 'APPKEYBOARD' ) {

			var zoomMove = this.zoomMove;

			switch( sig[ 1 ] ) {
				case '+':
					this.view.changeScaleRel( 1 );
					var sig = [];
					sig[0] = 'PANEL';
					sig[1] = 'ZOOMINFO';
					sig.data = this.view.getZoomFactor();

					this.bus.post( sig );

					this.updateView();

				break;
				case '-':
					this.view.changeScaleRel( -1 );

					var sig = [];
					sig[0] = 'PANEL';
					sig[1] = 'ZOOMINFO';
					sig.data = this.view.getZoomFactor();

					this.bus.post( sig );

					this.updateView();
				break;
				case 'arrowleft':
					this.view.changeViewCursorRel( -1 * zoomMove, 0 );
					this.updateView();
				break;
				case 'arrowright':
					this.view.changeViewCursorRel( 1 * zoomMove, 0 );
					this.updateView();
				break;
				case 'arrowup':
					this.view.changeViewCursorRel( 0, -1 * zoomMove);
					this.updateView();
				break;
				case 'arrowdown':
					this.view.changeViewCursorRel( 0, 1 * zoomMove );
					this.updateView();
				break;

				default:
				return;
			}
		}
		else if( sig[ 0 ] == 'PAINT' ) {
			switch( sig[ 1 ] ) {
				case 'SCRATCHBUFFER':
					this.state.swapBuffer();
					this.resetUpdateTimer();
					this.resetView();

					var sig = [];
					sig[0] = 'PANEL';
					sig[1] = 'DIMENSIONSINFO';
					sig.data = {};
					sig.data.w = this.state.PNTW;
					sig.data.h = this.state.PNTH;

					this.bus.post( sig );
					break;
				case 'SETTILESIZE':
					this.state.setTileSize( sig.data.tilesW, sig.data.tilesH );
					this.updateView();
					break;
				case 'HIDEBRUSH':
					this.state.overlay.clearBrush();
					this.updateView();
					break;
				case 'ZOOMRELATIVE':
					var prevFunction = this.state.getFunctionName();
					this.state.setFunction("selectpoint");
					this.state.drawFunction.setFunctionId('ZOOMRELATIVE');
					this.state.drawFunction.setFunctionData({ prevFunction: prevFunction });

					sig2[0] = "SCREENUPDATER";
					sig2[1] = "ZOOMPOINTER";
					sig2.data = undefined;
					this.bus.post( sig2 );

					break;
				case 'ZOOMX':

						if( sig.data != 1) {
							var prevFunction = this.state.getFunctionName();
							this.state.setFunction("selectpoint");
							this.state.drawFunction.setFunctionId('ZOOMX');
							this.state.drawFunction.setFunctionData({ prevFunction: prevFunction, zoomFactor: sig.data });

							sig2[0] = "SCREENUPDATER";
							sig2[1] = "ZOOMPOINTER";
							sig2.data = undefined;
							this.bus.post( sig2 );
						}
						else {
							this.view.setZoomFactor( 1 );
							this.view.changeViewCursor( 0,0 );
							this.updateView();

							var sig = [];
							sig[0] = 'PANEL';
							sig[1] = 'ZOOMINFO';
							sig.data = this.view.getZoomFactor();

							this.bus.post( sig );

						}
						break;
				case 'UNDO':
					this.state.undo();

					var sig = [];
					sig[0] = 'PANEL';
					sig[1] = 'UNDOINFO';
					sig.data = this.state.getUndoSize();

					break;
				case 'REDO':
					this.state.redo();
					break;
				case 'SETBRUSH':
					console.log( "Setting brush to " + sig.data.type +':'+ sig.data.size);
					this.state.setBrush( sig.data.type , sig.data.size );

					var sig = [];
					sig[0] = 'PANEL';
					sig[1] = 'BRUSHINFO';
					sig.data = {};
					sig.data.w = this.state.getBrush().w;
					sig.data.h = this.state.getBrush().h;
					sig.data.dynamicColor = this.state.getBrush().colorized ||
																				this.state.getBrush().colorable;
					this.bus.post( sig );

					break;
				case 'SETMODE':
						this.state.selectDrawMode( sig.data.mode );
						break;
				case 'SETSPRAYOPTIONS':
						this.state.setSpraySize( sig.data.size );
						break;
				case 'SETSPRAYOPTIONS2':
						this.state.setSprayIntensity( sig.data.intensity );
						break;
				case 'USEIMAGEBRUSH':
						this.state.useImageBrush();

						var sig = [];
						sig[0] = 'PANEL';
						sig[1] = 'BRUSHINFO';
						sig.data = {};
						sig.data.w = this.state.getBrush().w;
						sig.data.h = this.state.getBrush().h;
						sig.data.dynamicColor = this.state.getBrush().colorized ||
																					this.state.getBrush().colorable;
						this.bus.post( sig );

						break;
				case 'TRANSFORMBRUSH':
					console.log( "TRANSFORMBRUSH with " + sig.data );
					this.state.doBrushTransformation( sig.data  );

					var sig = [];
					sig[0] = 'PANEL';
					sig[1] = 'BRUSHINFO';
					sig.data = {};
					sig.data.w = this.state.getBrush().w;
					sig.data.h = this.state.getBrush().h;
					sig.data.dynamicColor = this.state.getBrush().colorized ||
																				this.state.getBrush().colorable;

					console.log('TRANSFORMBRUSH.BRUSHINFO sig.data.dynamicColor=' + sig.data.dynamicColor);
					console.log(this.state.getBrush());
					this.bus.post( sig );

					var sig2 = [];
					sig2[0] = 'PANEL';
					sig2[1] = 'SETPICTUREBRUSHMODE';
					sig2.data = {};
					this.bus.post( sig2 );

					break;
				case 'TRANSFORMPICTURE':
						console.log( "TRANSFORMPICTURE with " + sig.data );

						this.state.bufferForUndo();

						var resizeFlag =
							this.state.doPictureTransformation( sig.data  );

						if( !resizeFlag ) {
										this.saveUndoSmart('transformpicture');

						} else {

									var sig = [];
									sig[0] = 'PANEL';
									sig[1] = 'DIMENSIONSINFO';
									sig.data = {};
									sig.data.w = this.state.PNTW;
									sig.data.h = this.state.PNTH;

									this.bus.post( sig );
						}

						this.resetView();


						break;
				case 'SETBRUSHCOLOR':
					this.state.updateFGColor( sig.data.r , sig.data.g, sig.data.b, 255 );
					break;
				case 'SETBGCOLOR':
					this.state.updateBGColor( sig.data.r , sig.data.g, sig.data.b, 255 );
					break;
				case 'SETFILLCOLOR':
						this.state.updateFillColor( sig.data.r , sig.data.g, sig.data.b, 255 );
						break;
				case 'CLEAR':
					this.state.bufferForUndo();
					this.state.clear();
					this.saveUndoSmart('clear');
					this.updateView();
					break;
				case 'FLIPTILES':
					this.state.flipTiles();
					this.updateView();
					break;
				case 'FLIPSTENCIL':
					this.state.flipStencil();
					this.resetUpdateTimer();
					this.updateView();
					break;
				case 'FLIPINTERSECT':
					this.state.flipIntersect();
					this.updateView();
					break;
				case 'FLIPSTENCILMODEDARK':
					this.state.flipStencilModeDark();
					this.resetUpdateTimer();
					this.updateView();
					break;
				case 'UPDATEVIEW':
					this.updateView();
					break;
				case 'SETFUNCTION':
					this.state.setFunction( sig.data.name );
					this.state.setFunctionParam( sig.data.param );
					break;
				case 'IMPORTBRUSH':

						var ok = this.state.importBrush( sig.data.img, sig.data.name );

						break;
				case 'IMPORTIMAGE':

					var needsResize = this.state.importNeedsResize( sig.data.img );

					if( !needsResize ) {
						this.state.bufferForUndo();
					}

					var ok = this.state.importImage( sig.data.img, sig.data.name );

					if( ok ) {
						if( !needsResize ) {
								this.saveUndoSmart('load');
						} else {
							var sig = [];
							sig[0] = 'PANEL';
							sig[1] = 'DIMENSIONSINFO';
							sig.data = {};
							sig.data.w = this.state.PNTW;
							sig.data.h = this.state.PNTH;

							this.bus.post( sig );

						}

						var sig2 = [];
						sig2[0] = 'PANEL';
						sig2[1] = 'NAMEINFO';
						sig2.data = this.state.paintName;

						this.bus.post( sig2 );

						this.resetView();
					}
					break;
				case 'BRUSH2PIC':

					if( this.state.brush.mode != 'auto' ) {
						this.state.importImage( this.state.brush.getCanvas() );
						this.state.setDefaultBrush();
						this.resetView();

						var sig = [];
						sig[0] = 'PANEL';
						sig[1] = 'DIMENSIONSINFO';
						sig.data = {};
						sig.data.w = this.state.PNTW;
						sig.data.h = this.state.PNTH;

						this.bus.post( sig );

						var sig2 = [];
						sig2[0] = 'PANEL';
						sig2[1] = 'NAMEINFO';
						sig2.data = this.state.paintName;

						this.bus.post( sig2 );
					}
					break;
				case 'RESIZE':

					this.state.size( sig.data.w, sig.data.h, sig.data.resizeOption );
					this.resetView();

					var sig = [];
					sig[0] = 'PANEL';
					sig[1] = 'DIMENSIONSINFO';
					sig.data = {};
					sig.data.w = this.state.PNTW;
					sig.data.h = this.state.PNTH;

					this.bus.post( sig );

					break;
				case 'EXPORTIMAGE':
					var options = sig.data;
					var sig = [];
					sig[0] = 'EXPORT';
					sig[1] = 'SAVE';
					sig.data = {};
					sig.data.canvas = this.state.paintCanvas;
					sig.data.options = options;
					sig.data.name = this.state.paintName;;

					console.log("EXPORTIMAGE");
					console.log(sig.data);

					this.bus.post( sig );
					break;
				case "SETSHAPEFILLLINE":
					var options = sig.data;
					this.state.setShapeFillMode( options.fillMode );
					this.state.setShapeBrushFlag( options.brush );
			}
		}
	}


	abortDraw() {
		this.state.abortDraw();
	}


	restoreOverlay() {
		this.state.overlay.clear();
		this.state.restoreTiles()
	}

	saveUndoSmart( label ) {
		this.state.saveUndoSmart( label );

		var sig = [];
		sig[0] = 'PANEL';
		sig[1] = 'UNDOINFO';
		sig.data = this.state.getUndoSize();

		this.bus.post( sig );
	}

	/* view component interface */
	handleFocusSignal( sig ) {
		return false;
	}

	isVisible() {
		return this.view.isVisible();
	}

	isMouseOver( pos ) {
		return this.view.isMouseOver();
	}

	getViewPriority() {
		return this.view.getViewPriority();
	}

	updateView() {
		this.view.updateView( this.state.paintCanvas, this.state.paintContext, this.state.overlay, this.state.stencilObject );

		this.signalRefresh();

	}

	resetView() {
		this.view.resetView( this.state.paintCanvas, this.state.paintContext, this.state.overlay, this.state.stencilObject  );

		this.signalRefresh();
	}

	signalRefresh() {

		var sig = [];
		sig[0] = "SCREENUPDATER";
		sig[1] = "REFRESH";

		this.bus.post( sig );
	}

	render( _context, _updateArea ) {

		this.view.render( _context, _updateArea );
	}


}
