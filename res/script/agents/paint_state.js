class mouseState {

    constructor() {

		this.x0 = 0;
		this.y0 = 0;
		this.x = 0;
		this.y = 0;
		this.leftButton = false;
		this.rightButton = false;
	}

	updateXY( posOrig, pos ) {

		this.x0 = posOrig[ 0 ];
		this.y1 = posOrig[ 1 ];

		this.x = pos[ 0 ];
		this.y = pos[ 1 ];
	}

	resetButtons() {
		this.leftButton = false;
		this.rightButton = false;
	}

	updateLeftButton(  downState ) {
		this.resetButtons();
		this.leftButton = downState;
	}

	updateRightButton(  downState ) {
		this.resetButtons();
		this.rightButton = downState;
	}

	updateButton(  buttonid, downState ) {
		if( buttonid == 'left' ) {
			this.updateLeftButton( downState );
		}
		else if( buttonid == 'right' ) {
			this.updateRightButton( downState );
		}
	}

  anyButtons() {
		return this.leftButton || this.rightButton;
	}

}


class PaintMode {

  constructor() {
      this.name =  'normal';
      this.globalAlpha = 1;
      this.globalCompositeOperation = 'source-over';
  }

  select( type ) {
    if( type == "normal" ) {
      this.globalAlpha = 1;
      this.globalCompositeOperation = 'source-over';
    }
    else if( type == "color" ) {
      this.globalAlpha = 1;
      this.globalCompositeOperation = 'hue';
    }
    else if( type == "softcolor" ) {
      this.globalAlpha = .1;
      this.globalCompositeOperation = 'color';
    }
    else if( type == "lighten" ) {
      this.globalAlpha = 1;
      this.globalCompositeOperation = 'lighten';
    }
    else if( type == "darken" ) {
      this.globalAlpha = 1;
      this.globalCompositeOperation = 'darken';
    }
    else if( type == "transparency1%" ) {
      this.globalAlpha = .1;
      this.globalCompositeOperation = 'source-over';
    }
    else if( type == "transparency0.1%" ) {
      this.globalAlpha = .001;
      this.globalCompositeOperation = 'source-over';
    }
  }

  setContext( ctx ) {
    this.ctx = ctx;
  }

  use( ) {
    this.ctx.globalAlpha = this.globalAlpha;
    this.ctx.globalCompositeOperation = this.globalCompositeOperation;
  }

}

class PaintState {

    constructor( _SCRW, _SCRH, bus ) {

		this.mouseState = new mouseState();

		this.fgColor = new paintColor( 255,255,255  ,255 );
    this.fcColor = new paintColor( 255,255,255  ,255 );
		this.bgColor = new paintColor( 0,0,0,255 );

		this.paintCanvas = document.createElement('canvas');
		this.paintCanvas.id     = "PaintCanvas";

		this.paintCanvasBuffer = document.createElement('canvas');
		this.paintCanvasBuffer.id     = "PaintCanvasBuffer";

		this.drawFunctions = [];

    this.swapBufferCreated = false;
    this.swapBufferLock = false;
    this.paintCanvasScratchBuffer = null;
    this.stencilObject = { canvas: null, mode: 'lighten' };
    this.stencil = false;
    this.stencilModeDark = false;
    this.intersect = false;

		this.size( _SCRW, _SCRH, "init" );
		this.paintContext = this.paintCanvas.getContext('2d', {
			  alpha: false,
			  //desynchronized: true
		});

		this.paintContextBuffer = this.paintCanvasBuffer.getContext('2d', {
			  alpha: false,
			  //desynchronized: true
		});



		this.paintContext.fillStyle = 'rgba(0,0,0,255)';
		this.paintContext.fillRect(0, 0, _SCRW, _SCRH);


		this.paintContext.imageSmoothingEnabled = false;
		this.paintContextBuffer.imageSmoothingEnabled = false;


    this.paintName = null;

		this.softroundBrush = [];
		this.roundBrush = [];
		this.sqrBrush = [];
    this.softroundBrushBG = [];
		this.roundBrushBG = [];
		this.sqrBrushBG = [];

		this.overlay = new PaintOverlay();

    this.tiles = false;
    this.tilesW = 30;
    this.tilesH = 25;

    this.imageBrush = null;
    this.imageBrushBG = null;

		this.delta = new DeltaCalculator();
    this.shapeFill = false;
    this.shapeFillMode = 'none';
    this.shapeWithBrush = true;
    this.bucketFillMode = 0;

		var i;
		for (i = 1; i <= 64; i += 1) {
			if( i == 1 ) {
				this.roundBrush[ i ] = new AutoBrush(  1,1, 'rect', this.fgColor );
				this.roundBrushBG[ i ] = new AutoBrush(  1,1, 'rect', this.bgColor );
			}
			else {
				this.roundBrush[ i ] = new AutoBrush(  i,i, 'oval', this.fgColor );
				this.roundBrushBG[ i ] = new AutoBrush(  i,i, 'oval', this.bgColor );
			}
		}

		for (i = 1; i <= 64; i += 1) {
			if( i == 1 ) {
				this.softroundBrush[ i ] = new AutoBrush(  1,1, 'rect', this.fgColor );
				this.softroundBrushBG[ i ] = new AutoBrush(  1,1, 'rect', this.bgColor );
			}
			else {
				this.softroundBrush[ i ] = new AutoBrush(  i,i, 'softoval', this.fgColor );
				this.softroundBrushBG[ i ] = new AutoBrush(  i,i, 'softoval', this.bgColor );
			}
		}


		for (i = 1; i <= 64; i += 1) {
			this.sqrBrush[ i ] = new AutoBrush(  i,i, 'rect', this.fgColor );
			this.sqrBrushBG[ i ] = new AutoBrush(  i,i, 'rect', this.bgColor );
		}

		this.brush = this.roundBrush[1];
		this.bgbrush = this.roundBrushBG[1];
    this.brush1Pix = new AutoBrush(  1,1, 'rect', this.fcColor );

		this.paintBGBRush = null;

		this.drawFunctions['simple'] = new simpleDF( this.paintContext, this.overlay );
		this.drawFunctions['solid'] = new solidDF( this.paintContext, this.overlay  );
    this.drawFunctions['spray'] = new sprayDF( this.paintContext, this.overlay  );
		this.drawFunctions['line'] = new lineDF( this.paintContext, this.overlay  );
		this.drawFunctions['rectangle'] = new rectangleDF( this.paintContext, this.overlay, false  );
		this.drawFunctions['oval'] = new ovalDF( this.paintContext, this.overlay, false  );
    this.drawFunctions['square'] = new rectangleDF( this.paintContext, this.overlay, true  );
		this.drawFunctions['circle'] = new ovalDF( this.paintContext, this.overlay, true  );
		this.drawFunctions['fill'] = new fillFunctionExt( this.paintContext , _SCRW, _SCRH, bus, this.overlay );
		this.drawFunctions['fill2'] = new fillFunction2( this.paintContext , _SCRW, _SCRH, bus, this.overlay );
		this.drawFunctions['grabbrush'] = new grabFunction( this.paintContext , this.overlay, _SCRW, _SCRH );
    this.drawFunctions['magicgrabbrush'] = new magicAreaFunction( this.paintContext , this.overlay, _SCRW, _SCRH, bus );
		this.drawFunctions['grabfillbrush'] = new grabFunction( this.paintContext , this.overlay, _SCRW, _SCRH );
    this.drawFunctions['selectpoint'] = new selectPointDF( this.paintContext );
		this.drawFunctions['picker'] = new picker( this.paintContext );

		this.setFunction( 'solid' );
		this.signalFunctionsOnSize( _SCRW, _SCRH );
		this.undoStack = new UndoStack();

    this.paintModeNormal = new PaintMode();
    this.paintModeNormal.setContext(this.paintContext);

    this.paintMode = new PaintMode();
    this.paintMode.setContext(this.paintContext);
	}

  functionNeedsTimer() {
      if( this.drawFunctionName == 'spray'  ) {
        return true;
      }
      return false;
  }


  createSwapBuffer() {
    this.paintCanvasScratchBuffer = document.createElement('canvas');
    this.paintCanvasScratchBuffer.id     = "PaintScratchCanvas";
    this.paintCanvasScratchBuffer.width = this.paintCanvas.width;
    this.paintCanvasScratchBuffer.height = this.paintCanvas.height;

    this.undoStackScratchBuffer = new UndoStack();

    this.paintContextScratchBuffer = this.paintCanvasScratchBuffer.getContext('2d', {
        alpha: false,
        //desynchronized: true
    });

    this.paintContextScratchBuffer.fillStyle = 'rgba(0,0,0,255)';
    this.paintContextScratchBuffer.fillRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
    this.paintContextScratchBuffer.imageSmoothingEnabled = false;

    this.swapBufferCreated = true;
  }

  swapBuffer() {

    if( this.swapBufferLock ) {
      throw( "!!Swap locked, due to ongoing painting operation" );
      return;
    }

    if( !this.swapBufferCreated ) {
      this.createSwapBuffer();
    }

    var tmpCtx =  this.paintContext;
    var tmpCvs =  this.paintCanvas;
    var tmpUndo = this.undoStack

    this.paintContext = this.paintContextScratchBuffer;
    this.paintCanvas = this.paintCanvasScratchBuffer;
    this.undoStack = this.undoStackScratchBuffer;

    this.paintContextScratchBuffer = tmpCtx;
    this.paintCanvasScratchBuffer = tmpCvs;
    this.undoStackScratchBuffer = tmpUndo;

    for (let [key, value] of Object.entries( this.drawFunctions )) {
       var fun = value;
       fun.setContext( this.paintContext );
    }

    this.PNTW = this.paintCanvas.width;
    this.PNTH = this.paintCanvas.height;

    this.signalFunctionsOnSize( this.PNTW, this.PNTH );

    if(
      this.paintCanvasBuffer.width != this.paintCanvas.width ||
      this.paintCanvasBuffer.height != this.paintCanvas.height
    )
    {
      this.paintCanvasBuffer.width = this.paintCanvas.width;
      this.paintCanvasBuffer.height = this.paintCanvas.height;
    }


    if( this.paintCanvasBuffer.height == 0 || this.paintCanvasBuffer.width == 0 ) {
      throw "Buffer size of 0 detected";
    }
    this.paintContextBuffer.drawImage( this.paintCanvas ,0,0 );

  }

  setSpraySize( size ) {
    this.drawFunctions['spray'].setSize( size );
  }

  setSprayIntensity( i ) {
    this.drawFunctions['spray'].setIntensity( i );
  }


  unsetDrawMode() {
      this.paintModeNormal.use();
  }

  setDrawMode() {
      this.paintMode.use();
  }

  selectDrawMode( x ) {
      this.paintMode.select( x );
  }

  setTileSize( w, h ) {
      this.tilesW = w;
      this.tilesH = h;
      this.restoreTiles();
  }

  setShapeFillMode( mode ) {
    this.shapeFill = (mode != "none");
    this.shapeFillMode = mode;
  }

  setBucketFillMode( mode ) {
    this.bucketFillMode = mode;
  }


  setShapeBrushFlag( flag ) {
    this.shapeWithBrush = flag;
  }

	size(  w, h, resizeOption )
	{

		this.PNTW = w;
		this.PNTH = h;

    if( this.overlay !== undefined ) {
      this.showTiles();
    }

		this.paintCanvasBuffer.width  = w;
		this.paintCanvasBuffer.height = h;
    if( this.paintCanvasBuffer.height == 0 || this.paintCanvasBuffer.width == 0 ) {
      throw "Buffer size of 0 detected";
    }


		if( resizeOption == 'init' ) {

			this.paintCanvas.width  = w;
			this.paintCanvas.height = h;

      //this.paintCanvasScratchBuffer.width = w;
      //this.paintCanvasScratchBuffer.height = w;

		}
    else if( resizeOption == 'clearforload' ) {

			this.paintCanvas.width  = w;
			this.paintCanvas.height = h;
		}
		else if( resizeOption == 'clip' ) {

			var tmpCanvas = document.createElement('canvas');
			tmpCanvas.width  = w;
			tmpCanvas.height = h;
			tmpCanvas.id     = "tmpPaintCanvas";
			var tmpContext = tmpCanvas.getContext('2d', {
				  alpha: false,
			});
			tmpContext.drawImage( this.paintCanvas ,0,0 );

			this.paintCanvas.width  = w;
			this.paintCanvas.height = h;

			this.paintContext.drawImage( tmpCanvas ,0,0 );
			this.paintContextBuffer.drawImage( tmpCanvas ,0,0 );

//      tmpContext.drawImage( this.paintContextScratchBuffer ,0,0 );

//			this.paintCanvasScratchBuffer.width  = w;
//			this.paintCanvasScratchBuffer.height = h;

//			this.paintContextScratchBuffer.drawImage( tmpCanvas ,0,0 );

			tmpCanvas = null;
			tmpContext = null;
		}
		else if( resizeOption == 'pixelresize' ) {

      var  icc = new ImageCanvasContext();

      icc.initWithCanvas( this.paintCanvas, this.paintContext);
      icc.pixelResize( w, h );

			this.paintContextBuffer.drawImage( this.paintCanvas ,0,0 );

      //icc = new ImageCanvasContext();
      //icc.initWithCanvas( this.paintCanvasScratchBuffer, this.paintContextScratchBuffer);
      //icc.pixelResize( w, h );

		}
    else if( resizeOption == 'resize') {

      var tmpCanvas = document.createElement('canvas');
      tmpCanvas.width  = w;
      tmpCanvas.height = h;
      tmpCanvas.id     = "tmpPaintCanvas";
      var tmpContext = tmpCanvas.getContext('2d', {
          alpha: false,
      });
      tmpContext.drawImage( this.paintCanvas ,0,0, w, h );

      this.paintCanvas.width  = w;
      this.paintCanvas.height = h;

      this.paintContext.drawImage( tmpCanvas ,0,0 );
      this.paintContextBuffer.drawImage( tmpCanvas ,0,0 );

      //tmpContext.drawImage( this.paintCanvasScratchBuffer ,0,0, w, h );

      //this.paintCanvasScratchBuffer.width  = w;
      //this.paintCanvasScratchBuffer.height = h;

      //this.paintContextScratchBuffer.drawImage( tmpCanvas ,0,0 );

      tmpCanvas = null;
      tmpContext = null;
    }

		this.signalFunctionsOnSize( w, h );
	}

	getUndoSize() {
		var size = this.undoStack.getSize();
		return size;
	}

	bufferForUndo() {
		console.log( "buffer paintcanvas for undo" );
    this.swapBufferLock = true;
		this.undoStack.bufferForUndo( this.getPaintBuffers() );
	}

	undo() {
		this.undoStack.undo( this.getPaintBuffers() );
	}

	getDelta( buffers ) {
		return this.delta.calculate( buffers );
	}

	redo() {
		this.undoStack.redo( this.getPaintBuffers(), { obj: this, method: "getDelta" } );
	}

	getPaintBuffers() {
		return {
				paintCanvas: this.paintCanvas,
				paintContext: this.paintContext,
				paintContextBuffer: this.paintContextBuffer,
				paintCanvasBuffer: this.paintCanvasBuffer

		};
	}

  abortDraw() {
    this.swapBufferLock = false;
  }

	saveUndoSmart( name ) {

		var buffers = this.getPaintBuffers();

		var deltaXY = this.delta.calculate( buffers );

    console.log( "undo delta=" + deltaXY);
    console.log( deltaXY );

    if( deltaXY == null ) {
      console.log("nothing added to undo");
      this.swapBufferLock = false;
      return;
    }

		this.undoStack.saveUndoSmart(
			buffers,
			deltaXY,
			name
		);

    this.swapBufferLock = false;

	}

	pickColor( x, y ) {

		var paintData = this.paintContext.getImageData( x, y, 1, 1).data;
		return paintData;

	}

	signalFunctionsOnSize( w, h ) {

		var x=1;
		var y = x;

		const keys = Object.keys( this.drawFunctions )

		for (var key of keys ) {

		  this.drawFunctions[ key ].setPaintingDimensions( w, h );

		}
	}


  restoreTiles() {
    if( this.tiles ) {
      this.overlay.clear();
      this.overlay.setTiles( this.tilesW, this.tilesH, this.PNTW, this.PNTH );
    }
  }


  flipIntersect() {
      this.intersect = !this.intersect;
      this.overlay.setIntersect( this.intersect );
  }

  flipStencil() {
    this.stencil = !this.stencil;

    this.showStencil();
  }

  flipStencilModeDark() {
    this.stencilModeDark = !this.stencilModeDark;

    if( this.stencilModeDark ) {
      this.stencilObject.mode = 'darken';
    }
    else {
      this.stencilObject.mode = 'lighten';
    }
  }


  showStencil() {

    this.stencilObject.canvas = null;
    if( this.stencil ) {
      this.stencilObject.canvas = this.paintCanvasScratchBuffer;
    }

  }

  flipTiles() {
    this.tiles = !this.tiles;

    this.showTiles();

  }

  showTiles() {

    this.overlay.clear();
    if( this.tiles ) {
      this.overlay.setTiles( this.tilesW, this.tilesH, this.PNTW, this.PNTH );
    }

  }

	clear() {


		this.paintContext.fillStyle = this.bgColor.getHTML(); //'#000000'
		this.paintContext.fillRect(0, 0, this.PNTW, this.PNTH);

	}

  importNeedsResize( img ) {

    if(img == null ) {
			return false;
		}
		else if(img.width == null ) {
			return false;
		}
		else if(img.width == 0 ) {
			return false;
		}
		else if(img.height == null ) {
			return false;
		}
		else if(img.height == 0 ) {
			return false;
		}

    var resize = false;
		if( img.width != this.PNTW || img.height != this.PNTH ) {
			resize = true;
		}
    return resize;
  }

	importImage( img, name, resize ) {


		var resize = false;
		if( img.width != this.PNTW || img.height != this.PNTH ) {
			resize = true;
			this.undoStack.clear();
		}

		this.clear();
		var context = this.paintContext;

		var oldval = context.imageSmoothingEnabled;

		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.msImageSmoothingEnabled = false;
		context.imageSmoothingEnabled = false;

		if(img == null ) {
			return false;
		}
		else if(img.width == null ) {
			return false;
		}
		else if(img.width == 0 ) {
			return false;
		}
		else if(img.height == null ) {
			return false;
		}
		else if(img.height == 0 ) {
			return false;
		}

		if( resize ) {
			this.size( img.width, img.height, 'clearforload' );
		}

		context.drawImage(img,0,0 );
    var  icc = new ImageCanvasContext();
		//icc.initWithCanvas( this.paintCanvas, this.paintContext);
    //icc.removeTransparency(); -> see http://jsfiddle.net/thirtydot/9SEMf/869/

		context.mozImageSmoothingEnabled = oldval;
		context.webkitImageSmoothingEnabled = oldval;
		context.msImageSmoothingEnabled = oldval;
		context.imageSmoothingEnabled = oldval;

    this.paintName = name;

		return true;
	}


  importBrush( img, name ) {


    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);

    var brush = new BareBrush( img.width, img.height, Math.floor(img.width/2), Math.floor(img.height/2), canvas );
    brush.setContext( context );
    brush.name = name;

	  this.brush = brush;

    if( this.brush.mode == "grab" ) {
    		this.bgbrush = this.brush.clone();
    		this.bgbrush.transform( "BGCOLORIZE", undefined, this.fgColor, this.bgColor );
    }

    this.imageBrush = this.brush;
    this.imageBrushBG = this.bgbrush;

    return true;
  }

	updateMouseXY( posOrig, pos ) {

		this.mouseState.updateXY( posOrig, pos );
	}

	updateButton(  id, downState ) {
		this.mouseState.updateButton ( id, downState );
	}

	updateFGColor(  r, g, b, a ) {

    this.fgColor.set( r, g, b, a);

    if( this.brush.colorable ) {
		    this.brush.render();
    }
    else if( this.brush.colorized ) {
      this.brush.transform( "COLORIZE", undefined, this.fgColor, this.bgColor );
    }
	}


  updateFillColor(  r, g, b, a ) {

    this.fcColor.set( r, g, b, a);
    this.brush1Pix.render();

	}

	updateBGColor(  r, g, b, a ) {

    this.bgColor.set( r, g, b, a);

    if( this.brush.colorable ) {
      this.bgbrush.render();
    }
    else if( this.brush.mutable ) {
      this.bgbrush = this.brush.clone();
      this.bgbrush.transform( "BGCOLORIZE", undefined, this.fgColor, this.bgColor );
    }

	}

  useImageBrush() {
    if( this.imageBrush != null ) {
      this.brush = this.imageBrush;
    }
    if( this.imageBrushBG != null ) {
      this.bgbrush = this.imageBrushBG;
    }
  }


  setImageBrushFromImageURLBrush( p ) {

    this.imageBrush = p;
    this.imageBrushBG = this.imageBrush.clone();;
    this.imageBrushBG.transform( "BGCOLORIZE", undefined, this.fgColor, this.bgColor );

  }


	setImageBrush( x1, y1, x2, y2 ) {

	  this.brush = new GrabBrush( x1, y1, x2, y2, this.paintCanvas, this.bgColor, null );

	  if( this.brush.mode == "grab" ) {
		this.bgbrush = this.brush.clone();
		this.bgbrush.transform( "BGCOLORIZE", undefined, this.fgColor, this.bgColor );
	  }

    this.imageBrush = this.brush;
    this.imageBrushBG = this.bgbrush;


	}


  setImageBrushFromArea( area ) {

    this.brush = new GrabBrush(
            area.sx0, area.sy0, area.sx1, area.sy1,
            this.paintCanvas, null, area );

    if( this.brush.mode == "grab" ) {
  		this.bgbrush = this.brush.clone();
  		this.bgbrush.transform( "BGCOLORIZE", undefined, this.fgColor, this.bgColor );
	  }

    this.imageBrush = this.brush;
    this.imageBrushBG = this.bgbrush;

  }

  doPictureTransformation( transformation ) {

    var pictureBrush = new BareBrush( this.PNTW, this.PNTH, 0, 0, this.paintCanvas );
    pictureBrush.setContext( this.paintContext );
    pictureBrush.transform(  transformation.tf, transformation.options , this.fgColor, this.bgColor );

    if( this.PNTW != this.paintCanvas.width  || this.PNTH != this.paintCanvas.height) {
      var w,h;
      w = this.paintCanvas.width;
      h = this.paintCanvas.height;

      this.PNTW = w;
      this.PNTH = h;

      this.paintCanvasBuffer.width  = w;
      this.paintCanvasBuffer.height = h;
      if( this.paintCanvasBuffer.height == 0 || this.paintCanvasBuffer.width == 0 ) {
        throw "Buffer size of 0 detected";
      }


      this.signalFunctionsOnSize( w, h );

      this.undoStack.clear();
      return true;
    }

    return false;
	}

	doBrushTransformation( transformation ) {

    console.log( "doBrushTransformation(mutable="+this.brush.mutable+")");
		if( this.brush.mutable ) {
			this.brush.transform(  transformation.tf , transformation.options, this.fgColor, this.bgColor );

		} else
    {
      this.brush = this.brush.clone();
      this.brush.transform(  transformation.tf, transformation.options , this.fgColor, this.bgColor );
      this.drawFunction.mouseMove( this  ); /* fake move of mouse (with 0 pixels), to update overlay*/
    }

    this.bgbrush = this.brush.clone();
    this.bgbrush.transform( "BGCOLORIZE", undefined, this.fgColor, this.bgColor );

    this.imageBrush = this.brush;
    this.imageBrushBG = this.bgbrush;
	}

	setPaintBGBrush( x1, y1, x2, y2 ) {

	  this.paintBGBRush = new GrabBrush( x1, y1, x2, y2, this.paintCanvas, null, null );

	}

	setDefaultBrush() {
		this.setBrush("rnd", 1);
	}

	setBrush(type, size) {

    console.log( "setbrush " + type + ", " + size);

	  var brush = this.brush;
	  var bgbrush = this.bgbrush;

	  if( type == "rnd" ) {
		if( size>=0 && size<=64 ) {
			brush = this.roundBrush[ size ];
			bgbrush = this.roundBrushBG[ size ];
		}
	  }
    else if( type == "softrnd" ) {
		if( size>=0 && size<=64 ) {
			brush = this.softroundBrush[ size ];
			bgbrush = this.softroundBrushBG[ size ];
		}
	  }
	  else if( type == "sqr" ) {
		if( size>=0 && size<=64 ) {
			brush = this.sqrBrush[ size ];
			bgbrush = this.sqrBrushBG[ size ];
		}
	  }

	  this.brush = brush;
	  this.brush.render();
	  this.bgbrush = bgbrush;
	  this.bgbrush.render();
	}

	getBrush() {
		return this.brush;
	}

	getBGBrush() {
		return this.bgbrush;
	}

	setFunctionParam( param ) {
		this.drawFunctionParam = param ;
	}

	setFunction( fname ) {

	  this.drawFunction = this.drawFunctions[ fname ];
	  this.drawFunctionName = fname ;

	}


  getFunctionName() {

    return this.drawFunctionName;

  }


}
