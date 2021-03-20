



class fillFunction2 extends DFTemplate {
	/* Uses now bitarray to hold fillarea shape, so more complex fills are possible */

    constructor( _paintContext, w, h, bus, _overlay ) {

    super( _paintContext );
		this.w = w;
		this.h = h;
		this.stack = [];
		this.bus = bus;
    this.overlay = _overlay;

		this.mousedown = false;

		this.counter = 0;
	}

	mouseDown( pState ) {

		this.mousedown = true;
		return { painted: false };
	}


	mouseMove( pState ) {
    return { painted: false };
	}


	mouseUp( pState ) {

		if( !this.mousedown ) {
			return { painted: false };
		}

		this.mousedown = false;

		var x = pState.mouseState.x;
		var y = pState.mouseState.y;

		//var rgbStart;
		var fillRgb = [];
		fillRgb[ 0 ] = pState.fcColor.r ;
		fillRgb[ 1 ] = pState.fcColor.g ;
		fillRgb[ 2 ] = pState.fcColor.b ;

		if( pState.paintBGBRush != null ) {
			this.doFill( x, y, fillRgb, pState.paintBGBRush );
		}


		return { painted: true };
	}



	doFill( _x, _y, _fillRgb, _brush ) {
		var x = _x;
		var y = _y;

		this.stack = [];
		var stack = this.stack;

		this.counter = 0;

		this.mask = new BitBuffer( this.w * this.h );
		this.pixelbuffer = this.paintContext.getImageData(0, 0, this.w, this.h);
		this.pixelbufferdata = this.pixelbuffer.data;

		this.fillRgb = _fillRgb;

		this.fillBgs = [];

		var bctx = _brush.getContext();

		for( var bx = 0; bx< _brush.w; bx++ ) {
			for( var by = 0; by< _brush.h; by++ ) {
				var bdata = bctx.getImageData(bx, by, 1, 1).data;

				var found = false;
				for( var i = 0; i< this.fillBgs.length; i++ ) {
					var current = this.fillBgs[ i ];
					if( current[0] == bdata[0] && current[1] == bdata[1] && current[2] == bdata[2] ) {
						found = true;
						continue;
					}
				}

				if( !found ) {
					this.fillBgs.push( bdata );
					//console.log( "add " + bdata[0] + "," + bdata[1] + "," + bdata[2] );
				}
			}
		}

		//TEST make less sensitive
		for( var i = 0; i< this.fillBgs.length; i++ ) {
			var current = this.fillBgs[ i ];
			current[ 0 ] = this.roundOffValue( current[ 0 ] );
			current[ 1 ] = this.roundOffValue( current[ 1 ] );
			current[ 2 ] = this.roundOffValue( current[ 2 ] );
		}

		this.tryPush({ x: x  , y: y });

		var wait = 0;
		var maxStack = 0;

		while( stack.length > 0 && stack.length < 5000000 && this.counter < 5000000) {

			wait ++;
			if( wait > 100000 ) {
				wait = 0;
			}

			if( wait == 0) {
				console.log("stack" + stack.length + " count" + this.counter);
				//this.doStackDump();
			}

			var el = stack.pop();

			if( wait == 0 ) {
				console.log("el " + el.x + ", " + el.y);
			}

			x = el.x;
			y = el.y;

			this.counter ++;

			this.setPixel( x, y, _fillRgb );
			this.mask.setBit( x + (y * this.w) , true);

			this.tryPush({ x: x+1  , y: y });
			this.tryPush({ x: x-1  , y: y });
			this.tryPush({ x: x  , y: y+1 });
			this.tryPush({ x: x  , y: y-1 });

		}

		this.paintContext.putImageData( this.pixelbuffer, 0, 0 );

		this.pixelbufferdata = null;
		this.pixelbuffer = null;
		this.mask = null;

		console.log( "ended " + stack.length + " / " + this.counter );
		console.log( "stack size was " + stack.length );
		console.log( "max stack size was " + maxStack );

	}

	roundOffValue( v ) {
		return Math.floor( v / 2 ) * 2;
	}

	tryPush( el ) {

		if( el.x < 0 || el.y < 0 ) {
			//console.log("skipstack "+ el.x + " , " + el.y );
			return;
		}
		else if( el.x >= this.w || el.y >= this.h  ) {
			//console.log("skipstack "+ el.x + " , " + el.y );
			return;
		}

		if( ! this.isColors( el.x, el.y, this.fillBgs ) ) {
			//console.log("skipstack wrong color "+ el.x + " , " + el.y );
			return;
		}

		if( this.mask.getBit( el.x + ( el.y * this.w ) ) ) {
			return;
		}

		this.stack.push( el );
	}

	doStackDump( ) {
		console.log( "StackDump==============================================" );
		for( var i=0; i<this.stack.length; i++ ) {
			console.log( "D:" + this.stack[ i ].x + "\t," + this.stack[ i ].y );
		}
	}

	setPixel( x,y,rgb) {

		var offset = (4 * x ) + ( 4 * y * this.w );
		//var pixel = this.pixelbufferdata[ offset ];

		this.pixelbufferdata[ offset + 0 ] = rgb[ 0 ];
		this.pixelbufferdata[ offset + 1 ] = rgb[ 1 ];
		this.pixelbufferdata[ offset + 2 ] = rgb[ 2 ];
		this.pixelbufferdata[ offset + 3 ] = 255;

	}

	isColors( x, y , bgColors ) {

		var offset = (4 * x ) + ( 4 * y * this.w );
		var pixels = this.pixelbufferdata;
		var pixel = [];

		pixel[ 0 ] = pixels[ offset + 0 ];
		pixel[ 1 ] = pixels[ offset + 1 ];
		pixel[ 2 ] = pixels[ offset + 2 ];

		pixel[ 0 ] = this.roundOffValue( pixel[ 0 ] );
		pixel[ 1 ] = this.roundOffValue( pixel[ 1 ] );
		pixel[ 2 ] = this.roundOffValue( pixel[ 2 ] );

		for ( var i = 0; i<bgColors.length; i++ ) {
			var current = bgColors[i];
			if( pixel[ 0] == current[0] && pixel[1] == current[1]  && pixel[2] == current[2]  ) {
				return true;
			}
		}
		return false;
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}


}


class fillFunctionExt extends DFTemplate {
	/* Uses now bitarray to hold fillarea shape, so more complex fills are possible */

    constructor( _paintContext, w, h, bus, _overlay ) {

    super( _paintContext );
		this.w = w;
		this.h = h;
		this.stack = [];
		this.bus = bus;
    this.overlay = _overlay;

		this.mousedown = false;
		this.buttonId = 'left';

		this.counter = 0;
	}


  getBrush( pState ) {
		var brush = pState.brush;
		if( pState.mouseState.rightButton ) {
			brush = pState.bgbrush;
		}
		return brush;
	}

/* TODO use this function
  getFillColor( pState ) {
    var color = pState.fcColor;
    if( pState.mouseState.rightButton ) {
      color = pState.bgColor;
    }
    return color.getHTML();
  }
*/

	mouseDown( pState ) {

		this.mousedown = true;

		this.buttonId = 'left';
		if( pState.mouseState.rightButton ) {
			this.buttonId = 'right';
		}


		return { painted: false };
	}


	mouseMove( pState ) {
    this.overlay.clearBrush();
    this.overlay.paintBrush( pState.brush1Pix, pState.mouseState.x, pState.mouseState.y );

    return { painted: false, overlay: true };

		return { painted: false };
	}


	mouseUp( pState ) {

		if( !this.mousedown ) {
			return { painted: false };
		}

		this.mousedown = false;

		var x = pState.mouseState.x;
		var y = pState.mouseState.y;

    this.bucketFillMode = pState.bucketFillMode;
    this.gradient = pState.colorGradient;

    console.log("bucketFillMode=" + this.bucketFillMode);
    console.log("("+x+","+y+")");

		//var rgbStart;
		var fillRgb = [];

		if( this.buttonId == 'left' ) {
			fillRgb[ 0 ] = pState.fcColor.r ;
			fillRgb[ 1 ] = pState.fcColor.g ;
			fillRgb[ 2 ] = pState.fcColor.b ;
		}
		else {
			fillRgb[ 0 ] = pState.bgColor.r ;
			fillRgb[ 1 ] = pState.bgColor.g ;
			fillRgb[ 2 ] = pState.bgColor.b ;
		}

    console.log( "fill pixels with color: ")
    console.log( fillRgb );
		this.doFill( x, y, fillRgb, this.getBrush( pState ) );
		return { painted: true };
	}



	doFill( _x, _y, _fillRgb, brush  ) {
		var x = _x;
		var y = _y;

		this.stack = [];
		var stack = this.stack;

		this.counter = 0;

		this.mask = new ImageMask( this.w, this.h );
		this.pixelbuffer = this.paintContext.getImageData(0, 0, this.w, this.h);
		this.pixelbufferdata = this.pixelbuffer.data;

		this.fillRgb = _fillRgb;

		this.fillBg = this.paintContext.getImageData(x, y, 1, 1).data;
    console.log( "fill pixels of color: ")
    console.log( this.fillBg );

		this.tryPush({ x: x  , y: y });

		var wait = 0;
		var maxStack = 0;

		while( stack.length > 0 && stack.length < 5000000 && this.counter < 5000000) {

			wait ++;
			if( wait > 50000 ) {
				wait = 0;
			}

			if( wait == 0) {
				console.log("stack" + stack.length + " count" + this.counter);
				//this.doStackDump();
			}

			var el = stack.pop();

			if( wait == 0 ) {
				console.log("el " + el.x + ", " + el.y);
			}

			x = el.x;
			y = el.y;

			this.counter ++;

			this.mask.setPixel( x, y );

			this.tryPush({ x: x+1  , y: y });
			this.tryPush({ x: x-1  , y: y });
			this.tryPush({ x: x  , y: y+1 });
			this.tryPush({ x: x  , y: y-1 });

		}

    var findBrushPixels = false;
    if( this.bucketFillMode != 0 ) {
      findBrushPixels = true;
    }

    var findColors = false;
    var xcolFact = 0;
    var ycolFact = 0;
    if( this.bucketFillMode == 3 || this.bucketFillMode == 4 || this.bucketFillMode == 5 ) {
      findColors = true;

      if( this.bucketFillMode == 3 ) {
        xcolFact = 1;
      }
      else if( this.bucketFillMode == 4 ) {
        ycolFact = 1;
      }
      else if( this.bucketFillMode == 5 ) {
        xcolFact = 1;
        ycolFact = 1;
      }
    }


    if( findBrushPixels ) {

      var brushW = brush.w;
      var brushH = brush.h;
      var brushContext = brush.getContext();
      if( brushContext == null ) {
        findBrushPixels = false;
        this.bucketFillMode  = null;
      }
      else {
        var brushIDVdata = brushContext.getImageData( 0, 0, brushW, brushH ).data;
        var brushRowsize = brushW  *4;

        this.mask.calculateVLines();
        this.mask.calculateHLines();
        var boundArea = this.mask.getArea();

        /* {
              minx: this.minx,
              miny: this.miny,
              maxx: this.maxx,
              maxy: this.maxy,
              h: (this.maxy - this.miny) + 1,
              w: (this.maxx - this.minx) + 1
            }
        */
      }

    }



    var xpercent;
    var ypercent;

    var list = this.mask.getPixelsAsList();
    var pixel = list.start();

    //
    this.mask.calculateVLines();
    this.mask.calculateHLines();
    var boundArea = this.mask.getArea();

    while( pixel ) {

      if( this.bucketFillMode == 1 ) {

        var xpercent = (pixel.x - boundArea.minx) / boundArea.w;
        var ypercent = (pixel.y - boundArea.miny) / boundArea.h;

      }
      else if( this.bucketFillMode == 2 ) {
        var xdims = this.mask.getLocalAreaXDims( pixel.x, pixel.y );
        var ydims = this.mask.getLocalAreaYDims( pixel.x, pixel.y );

        //var xpercent1 = Math.floor( xdims.percent * 5 * 1000 ) % 1000;
        //xpercent1 = xpercent1 / 1000;
        var xpercent= xdims.percent;

        //var ypercent1 = Math.floor( ydims.percent * 15 * 1000 ) % 1000;
        //ypercent1 = ypercent1 / 1000;
        var ypercent = ydims.percent;

      }

      if( findBrushPixels ) {
        var by = Math.floor( ypercent * (brushH-1) );
        var bx = Math.floor( xpercent * (brushW-1) );

        var brOffset = (by * brushRowsize) + bx * 4;

        _fillRgb[0] = brushIDVdata[brOffset + 0];
        _fillRgb[1] = brushIDVdata[brOffset + 1];
        _fillRgb[2] = brushIDVdata[brOffset + 2];
      }

      if( findColors ) {
        var xdims = this.mask.getLocalAreaXDims( pixel.x, pixel.y );
        var ydims = this.mask.getLocalAreaYDims( pixel.x, pixel.y );

        var xi = Math.floor( xdims.percent * (this.gradient.length) );
        var yi = Math.round( ydims.percent * (this.gradient.length) );

        _fillRgb[0] = this.gradient[ xi ].r * xcolFact + this.gradient[ yi ].r * ycolFact;
        _fillRgb[1] = this.gradient[ xi ].g * xcolFact + this.gradient[ yi ].g * ycolFact;
        _fillRgb[2] = this.gradient[ xi ].b * xcolFact + this.gradient[ yi ].b * ycolFact;

      }
      //console.log( h );
      this.setPixel( pixel.x, pixel.y, _fillRgb );

      pixel = list.next();
    }


		this.paintContext.putImageData( this.pixelbuffer, 0, 0 );


		this.pixelbufferdata = null;
		this.pixelbuffer = null;
		this.mask = null;

		console.log( "ended " + stack.length + " / " + this.counter );
		console.log( "stack size was " + stack.length );
		console.log( "max stack size was " + maxStack );

	}

	tryPush( el ) {

		if( el.x < 0 || el.y < 0 ) {
			//console.log("skipstack "+ el.x + " , " + el.y );
			return;
		}
		else if( el.x >= this.w || el.y >= this.h  ) {
			//console.log("skipstack "+ el.x + " , " + el.y );
			return;
		}

		if( ! this.isColor( el.x, el.y, this.fillBg ) ) {
			//console.log("skipstack wrong color "+ el.x + " , " + el.y );
			return;
		}

		if( this.mask.getPixel( el.x, el.y ) ) {
			return;
		}

		this.stack.push( el );
	}

	doStackDump( ) {
		console.log( "StackDump==============================================" );
		for( var i=0; i<this.stack.length; i++ ) {
			console.log( "D:" + this.stack[ i ].x + "\t," + this.stack[ i ].y );
		}
	}

	setPixel( x,y,rgb) {

		var offset = (4 * x ) + ( 4 * y * this.w );
		//var pixel = this.pixelbufferdata[ offset ];

		this.pixelbufferdata[ offset + 0 ] = rgb[ 0 ];
		this.pixelbufferdata[ offset + 1 ] = rgb[ 1 ];
		this.pixelbufferdata[ offset + 2 ] = rgb[ 2 ];
		this.pixelbufferdata[ offset + 3 ] = 255;

	}

	isColor( x, y , bgColor ) {

		var offset = (4 * x ) + ( 4 * y * this.w );
		var pixels = this.pixelbufferdata;
		var pixel = [];
		pixel[ 0 ] = pixels[ offset+0 ];
		pixel[ 1 ] = pixels[ offset+1 ];
		pixel[ 2 ] = pixels[ offset+2 ];

		if( pixel[ 0] == bgColor[0] && pixel[1] == bgColor[1]  && pixel[2] == bgColor[2]  ) {
			return true;
		}
		return false;
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}


}


class fillFunction extends DFTemplate { /* To be deprecated */
	/* Uses now bitarray to hold fillarea shape, so more complex fills are possible */

    constructor( _paintContext, w, h, bus, _overlay ) {

    super( _paintContext );
		this.w = w;
		this.h = h;
		this.stack = [];
		this.bus = bus;
    this.overlay = _overlay;

		this.mousedown = false;
		this.buttonId = 'left';

		this.counter = 0;
	}

	mouseDown( pState ) {

		this.mousedown = true;

		this.buttonId = 'left';
		if( pState.mouseState.rightButton ) {
			this.buttonId = 'right';
		}


		return { painted: false };
	}


	mouseMove( pState ) {
    this.overlay.clearBrush();
    this.overlay.paintBrush( pState.brush1Pix, pState.mouseState.x, pState.mouseState.y );

    return { painted: false, overlay: true };

		return { painted: false };
	}


	mouseUp( pState ) {

		if( !this.mousedown ) {
			return { painted: false };
		}

		this.mousedown = false;

		var x = pState.mouseState.x;
		var y = pState.mouseState.y;

    this.bucketFillMode = pState.bucketFillMode;

    console.log("("+x+","+y+")");
    console.log("bucketFillMode=" + this.bucketFillMode);

		//var rgbStart;
		var fillRgb = [];

		if( this.buttonId == 'left' ) {
			fillRgb[ 0 ] = pState.fcColor.r ;
			fillRgb[ 1 ] = pState.fcColor.g ;
			fillRgb[ 2 ] = pState.fcColor.b ;
		}
		else {
			fillRgb[ 0 ] = pState.bgColor.r ;
			fillRgb[ 1 ] = pState.bgColor.g ;
			fillRgb[ 2 ] = pState.bgColor.b ;
		}

    console.log( "fill pixels with color: ")
    console.log( fillRgb );
		this.doFill( x, y, fillRgb );
		return { painted: true };
	}



	doFill( _x, _y, _fillRgb ) {
		var x = _x;
		var y = _y;

		this.stack = [];
		var stack = this.stack;

		this.counter = 0;

		this.mask = new BitBuffer( this.w * this.h );
		this.pixelbuffer = this.paintContext.getImageData(0, 0, this.w, this.h);
		this.pixelbufferdata = this.pixelbuffer.data;

		this.fillRgb = _fillRgb;

		this.fillBg = this.paintContext.getImageData(x, y, 1, 1).data;
    console.log( "fill pixels of color: ")
    console.log( this.fillBg );

		this.tryPush({ x: x  , y: y });

		var wait = 0;
		var maxStack = 0;

		while( stack.length > 0 && stack.length < 5000000 && this.counter < 5000000) {

			wait ++;
			if( wait > 50000 ) {
				wait = 0;
			}

			if( wait == 0) {
				console.log("stack" + stack.length + " count" + this.counter);
				//this.doStackDump();
			}

			var el = stack.pop();

			if( wait == 0 ) {
				console.log("el " + el.x + ", " + el.y);
			}

			x = el.x;
			y = el.y;

			this.counter ++;

			this.setPixel( x, y, _fillRgb );
			this.mask.setBit( x + (y * this.w) , true);
      //TODO, translate pixels to lines
      //Shapes class inside iutils, can create solid (line array)
      //but only works with simple shapes
      //FigureFill in iutils, uses points array, then calles shapes to created solid, and then fills it
      //so we need a flexible version of solid, then of solidv, and then generalize figurefill
      //so this can work by tracing all points (on a row (or column))
      //then if on the row there is allready some lines, check to which it belongs (***)
      //and adjust that line
      //***
      //  This can be done by

			this.tryPush({ x: x+1  , y: y });
			this.tryPush({ x: x-1  , y: y });
			this.tryPush({ x: x  , y: y+1 });
			this.tryPush({ x: x  , y: y-1 });

		}

		this.paintContext.putImageData( this.pixelbuffer, 0, 0 );

		this.pixelbufferdata = null;
		this.pixelbuffer = null;
		this.mask = null;

		console.log( "ended " + stack.length + " / " + this.counter );
		console.log( "stack size was " + stack.length );
		console.log( "max stack size was " + maxStack );

	}

	tryPush( el ) {

		if( el.x < 0 || el.y < 0 ) {
			//console.log("skipstack "+ el.x + " , " + el.y );
			return;
		}
		else if( el.x >= this.w || el.y >= this.h  ) {
			//console.log("skipstack "+ el.x + " , " + el.y );
			return;
		}

		if( ! this.isColor( el.x, el.y, this.fillBg ) ) {
			//console.log("skipstack wrong color "+ el.x + " , " + el.y );
			return;
		}

		if( this.mask.getBit( el.x + ( el.y * this.w ) ) ) {
			return;
		}

		this.stack.push( el );
	}

	doStackDump( ) {
		console.log( "StackDump==============================================" );
		for( var i=0; i<this.stack.length; i++ ) {
			console.log( "D:" + this.stack[ i ].x + "\t," + this.stack[ i ].y );
		}
	}

	setPixel( x,y,rgb) {

		var offset = (4 * x ) + ( 4 * y * this.w );
		//var pixel = this.pixelbufferdata[ offset ];

		this.pixelbufferdata[ offset + 0 ] = rgb[ 0 ];
		this.pixelbufferdata[ offset + 1 ] = rgb[ 1 ];
		this.pixelbufferdata[ offset + 2 ] = rgb[ 2 ];
		this.pixelbufferdata[ offset + 3 ] = 255;

	}

	isColor( x, y , bgColor ) {

		var offset = (4 * x ) + ( 4 * y * this.w );
		var pixels = this.pixelbufferdata;
		var pixel = [];
		pixel[ 0 ] = pixels[ offset+0 ];
		pixel[ 1 ] = pixels[ offset+1 ];
		pixel[ 2 ] = pixels[ offset+2 ];

		if( pixel[ 0] == bgColor[0] && pixel[1] == bgColor[1]  && pixel[2] == bgColor[2]  ) {
			return true;
		}
		return false;
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}


}


/*
class simpleFillFunction extends DFTemplate {

    constructor( _paintContext, w, h, bus ) {

    super( _paintContext );
		this.w = w;
		this.h = h;
		this.stack = [];
		this.bus = bus;

		this.mousedown = false;

		this.counter = 0;
	}

	mouseDown( pState ) {

		this.mousedown = true;
		return { painted: false };
	}


	mouseMove( pState ) {
		return { painted: false };
	}


	mouseUp( pState ) {

		if( !this.mousedown ) {
			return { painted: false };
		}

		this.mousedown = false;

		var x = pState.mouseState.x;
		var y = pState.mouseState.y;

		//var rgbStart;
		var fillRgb = [];
		fillRgb[ 0 ] = pState.bgColor.r ;
		fillRgb[ 1 ] = pState.bgColor.g ;
		fillRgb[ 2 ] = pState.bgColor.b ;


		this.doFill( x, y, fillRgb );

		return { painted: true };
	}



	doFill( _x, _y, _fillRgb ) {
		var x = _x;
		var y = _y;

		this.stack = [];
		var stack = this.stack;


		this.counter = 0;

		this.pixelbuffer = this.paintContext.getImageData(0, 0, this.w, this.h);
		this.pixelbufferdata = this.pixelbuffer.data;

		this.fillRgb = _fillRgb;

		this.fillBg = this.paintContext.getImageData(x, y, 1, 1).data;

		this.tryPush({ x: x  , y: y });

		var wait = 0;
		var maxStack = 0;
		while( stack.length > 0 && stack.length < 5000000 && this.counter < 5000000) {

			wait ++;
			if( wait > 10000 ) {
				wait = 0;
			}

			if( wait == 0) {
				console.log("stack" + stack.length + " count" + this.counter);
				//this.doStackDump();
			}

			var el = stack.pop();

			if( wait == 0 ) {
				console.log("el " + el.x + ", " + el.y);
			}

			x = el.x;
			y = el.y;

			this.counter ++;

			this.setPixel( x, y, this.fillRgb );
			this.tryPush({ x: x+1  , y: y });
			this.tryPush({ x: x-1  , y: y });
			this.tryPush({ x: x  , y: y+1 });
			this.tryPush({ x: x  , y: y-1 });

			if( maxStack < stack.length ) {
				maxStack = stack.length;
			}
		}

		this.paintContext.putImageData( this.pixelbuffer, 0, 0 );

		this.pixelbufferdata = null;
		this.pixelbuffer = null;

		console.log( "ended " + stack.length + " / " + this.counter );
		console.log( "stack size was " + stack.length );
		console.log( "max stack size was " + maxStack );

	}

	tryPush( el ) {

		if( el.x < 0 || el.y < 0 ) {
			//console.log("skipstack "+ el.x + " , " + el.y );
			return;
		}
		else if( el.x >= this.w || el.y >= this.h  ) {
			//console.log("skipstack "+ el.x + " , " + el.y );
			return;
		}

		if( ! this.isColor( el.x, el.y, this.fillBg ) ) {
			//console.log("skipstack wrong color "+ el.x + " , " + el.y );
			return;
		}

		this.stack.push( el );
	}

	doStackDump( ) {
		console.log( "StackDump==============================================" );
		for( var i=0; i<this.stack.length; i++ ) {
			console.log( "D:" + this.stack[ i ].x + "\t," + this.stack[ i ].y );
		}
	}

	setPixel( x,y,rgb) {

		var offset = (4 * x ) + ( 4 * y * this.w );
		//var pixel = this.pixelbufferdata[ offset ];

		this.pixelbufferdata[ offset + 0 ] = rgb[ 0 ];
		this.pixelbufferdata[ offset + 1 ] = rgb[ 1 ];
		this.pixelbufferdata[ offset + 2 ] = rgb[ 2 ];
		this.pixelbufferdata[ offset + 3 ] = 255;

	}

	isColor( x, y , bgColor ) {

		var offset = (4 * x ) + ( 4 * y * this.w );
		var pixels = this.pixelbufferdata;
		var pixel = [];
		pixel[ 0 ] = pixels[ offset+0 ];
		pixel[ 1 ] = pixels[ offset+1 ];
		pixel[ 2 ] = pixels[ offset+2 ];

		if( pixel[ 0] == bgColor[0] && pixel[1] == bgColor[1]  && pixel[2] == bgColor[2]  ) {
			return true;
		}
		return false;
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}


} */
