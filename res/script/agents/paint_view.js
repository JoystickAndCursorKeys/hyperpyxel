class PaintView  {

	getId() {
		return 'Paint';
	}

    constructor( _SCRW, _SCRH, _bgPattern, _viewprio ) {

		this.SCRW = _SCRW;
		this.SCRH = _SCRH;
		this.viewCanvas = document.createElement('canvas');
		this.viewCanvas.id     = "ZoomViewCanvas";

		this.initSize(  _SCRW, _SCRH );
		this.viewContext = this.viewCanvas.getContext('2d', {
			  alpha: false,
			  //desynchronized: true
		});

		this.viewContext.fillStyle = '#000000';
		this.viewContext.fillRect(0, 0, _SCRW, _SCRH);

		this.viewContext.imageSmoothingEnabled = false;

		this.viewPriority  = _viewprio;

		this.absMouse = [0,0];
		this.viewMouse = [0,0];

		this.initSetScale();
		this.intChangeViewCursor( 0, 0 );
		this.pntCanvasCoversView = true;

		this.bgPattern = _bgPattern;

		this.timers = 0;

		this.voffsetx = 0;
		this.voffsety = 0;

	}


	initSize(  w, h )
	{
		this.viewCanvas.width  = w;
		this.viewCanvas.height = h;

		this.H = h;
		this.W = w;

		this.paintH = h;
		this.paintW = w;

	}


	getZoomFactor() {
		return this.magnifyFactor;
	}

	setZoomFactor( x ) {
		this.magnifyFactor = x;

		this.viewResH = this.H / this.magnifyFactor;
		this.viewResW = this.W / this.magnifyFactor;

		this.validViewCursorRel();
	}


	changeZoomFactorRel( x ) {
		this.intChangeZoomFactorRel( x );

		this.viewResH = this.H / this.magnifyFactor;
		this.viewResW = this.W / this.magnifyFactor;

		this.validViewCursorRel();
	}

	initSetScale() {

		this.magnifyFactor = 1;
		this.viewResH = this.H / this.magnifyFactor;
		this.viewResW = this.W / this.magnifyFactor;

		this.validViewCursorRel();
	}

	intChangeZoomFactorRel( newMagFactor ) {

		if( newMagFactor > 0 ) {
			if( this.magnifyFactor < 1 ) {
				this.magnifyFactor = this.magnifyFactor * 2;
			}
			else {
				this.magnifyFactor += newMagFactor;

				if( this.magnifyFactor > 50 ) {
					this.magnifyFactor = 50;
					return;
				}
			}
		}
		else {
			if( this.magnifyFactor > 2) {
				this.magnifyFactor += newMagFactor;
			}
			else {
				this.magnifyFactor = this.magnifyFactor / 2;

				if( this.magnifyFactor < .125 ) {
					this.magnifyFactor = .125;
					return;
				}
			}
		}

	}

	changeScaleRel( newMagFactor ) {

		this.transformMouseCoords( this.absMouse ); /* update viewMouse */

		//var midx = this.viewResW / 2;
		console.log( " newMagFactor " + newMagFactor );

		console.log( " this.magnifyFactor " + this.magnifyFactor );

		this.intChangeZoomFactorRel( newMagFactor );

		console.log( " this.magnifyFactor " + this.magnifyFactor );

		this.viewResH = this.H / this.magnifyFactor;
		this.viewResW = this.W / this.magnifyFactor;

		var midx = ( this.W / 2 ) / this.magnifyFactor;
		var midy = ( this.H / 2 ) / this.magnifyFactor;

		var fx = this.absMouse[ 0 ];
		var fy = this.absMouse[ 1 ];

		var fsx = this.absMouse[ 0 ];
		var fsy = this.absMouse[ 1 ];

		var tmpx = fx / this.magnifyFactor;
		var tmpy = fy / this.magnifyFactor;

		var vx = fx - tmpx;
		var vy = fy - tmpy;

		console.log( "calc this.magnifyFactor:" + this.magnifyFactor );
		console.log( "calc fx:" + fx );
		console.log( "calc vx:" + vx );

		this.intChangeViewCursor( vx, vy );

	}

	changeViewCursor( viewCursorX, viewCursorY ) {

		this.vcursx = Math.floor( viewCursorX - (this.viewResW/2) );
		this.vcursy = Math.floor( viewCursorY - (this.viewResH/2) );

		this.validViewCursorRel();
	}

	intChangeViewCursor( viewCursorX, viewCursorY ) {

		this.vcursx = (viewCursorX);
		this.vcursy = (viewCursorY);

		this.validViewCursorRel();
	}

	changeViewCursorRel( viewCursorX, viewCursorY ) {

		this.vcursx += viewCursorX;
		this.vcursy += viewCursorY;

		console.log( "changeViewCursorRel " + this.vcursx + " , " + this.vcursy );

		this.validViewCursorRel();

	}

	validViewCursorRel(  ) {

		this.pntCanvasCoversView = true;

		if( this.vcursx < 0 ) { this.vcursx = 0; }
		if( this.vcursy < 0 ) { this.vcursy = 0; }

		if( this.vcursx > (this.paintW-this.viewResW )) { this.vcursx = (this.paintW-this.viewResW ); }
		if( this.vcursy > (this.paintH-this.viewResH )) { this.vcursy = (this.paintH-this.viewResH ); }

		var zoomedPaintingW = this.paintW * this.magnifyFactor;
		var zoomedPaintingH = this.paintH * this.magnifyFactor;

		this.voffsetx = 0;
		this.voffsety = 0;

		if( zoomedPaintingW < this.W ) {
			this.vcursx = 0;
			this.pntCanvasCoversView = false;
			this.pntCanvasCoversViewW = zoomedPaintingW;

			this.voffsetx = Math.round((this.W - zoomedPaintingW) / 2);

		}
		if( zoomedPaintingH < this.H ) {
			this.vcursy = 0;
			this.pntCanvasCoversView = false;
			this.pntCanvasCoversViewH = zoomedPaintingH;

			this.voffsety = Math.round((this.H - zoomedPaintingH) / 2);

		}

		console.log( "validViewCursorRel v(x,y)=" + this.vcursx + "," + this.vcursy +
									" paint(W,H)=" + this.paintW + "," + this.paintH +
									" viewRes(W,H)=" + this.viewResW + "," + this.viewResH
									);

	}

	transformMouseCoords ( xy ) {

		var x = xy[ 0 ] - this.voffsetx;
		var y = xy[ 1 ] - this.voffsety;
		var xy2 = [];

		var vxf = ( (( x  )/ this.magnifyFactor)   + this.vcursx );
		var vyf = ( (( y  )/ this.magnifyFactor)   + this.vcursy );

		xy2[ 0 ] = Math.floor( vxf );
		xy2[ 1 ] = Math.floor( vyf );

		this.absMouse = xy;
		this.viewMouse = xy2;

		return xy2;
	}



	timerUpdateView( _paintCanvas, _paintContext, _overlay, _stencilObject ) {

		_overlay.update();
		this.updateView( _paintCanvas, _paintContext, _overlay, _stencilObject );

	}

	resetView( _paintCanvas, _paintContext, _overlay, _stencilObject ) {

		console.log("RESET-----------------------------------------");
		this.paintH = _paintCanvas.height;
		this.paintW = _paintCanvas.width;
		this.magnifyFactor = 1;
		this.viewResH = this.H / this.magnifyFactor;
		this.viewResW = this.W / this.magnifyFactor;
		this.vcursx = 0;
		this.vcursy = 0;

		this.validViewCursorRel();

		this.updateView( _paintCanvas, _paintContext, _overlay, _stencilObject );
	}

	updateView( _paintCanvas, _paintContext, _overlay, _stencilObject ) {

		if( !this.pntCanvasCoversView || true) {

			for( var x=0;  x<this.SCRW ; x+=64 ) {
				for( var y=0; y<this.SCRH ; y+=64 ) {
					this.viewContext.drawImage( this.bgPattern , x, y);
				}
			}

			this.viewContext.fillStyle = '#000000';
			this.viewContext.fillRect( this.voffsetx, this.voffsety,    this.pntCanvasCoversViewW, this.pntCanvasCoversViewH );
		}
		else
		{
			this.viewContext.fillStyle = '#000000';
			this.viewContext.fillRect( this.voffsetx, this.voffsety,  this.SCRW, this.SCRH );
		}

		this.viewContext.drawImage( _paintCanvas,
				this.vcursx, this.vcursy,
				this.viewResW, this.viewResH,
				this.voffsetx, this.voffsety,
				this.W, this.H);

	  if( _stencilObject.canvas != null && _stencilObject.canvas != _paintCanvas) {
	  	var tmp = this.viewContext.globalAlpha;
			var tmp2 = this.viewContext.globalCompositeOperation;
			this.viewContext.globalAlpha = 0.7;
			this.viewContext.globalCompositeOperation = _stencilObject.mode;
			this.viewContext.drawImage( _stencilObject.canvas,
						this.vcursx, this.vcursy,
						this.viewResW, this.viewResH,
						this.voffsetx, this.voffsety,
						this.W, this.H);
	 		this.viewContext.globalAlpha = tmp;
			this.viewContext.globalCompositeOperation = tmp2;
 	 }

		_overlay.renderMagnified( this.viewContext, _paintContext,
				this.W, this.H,
				this.voffsetx, this.voffsety,
				this.vcursx, this.vcursy,
				this.magnifyFactor );

	}


	render( _context, _updateArea ) {

		var old = _context.imageSmoothingEnabled;
		_context.imageSmoothingEnabled = false;

		_context.drawImage( this.viewCanvas, 0, 0 );

		_context.imageSmoothingEnabled = old;

	}

	isVisible() {
		return true;
	}

	isMouseOver( pos ) {
		return true;
	}

	getViewPriority() {
		return this.viewPriority;
	}


}
