
class DFTemplate {
  constructor( _paintContext ) {
    this.setContext( _paintContext );
  }

  setContext( _paintContext ) {
    this.paintContext = _paintContext;
  }
}

class shapes {
  constructor() {
  }

}

class picker extends DFTemplate {

    constructor( _paintContext ) {

    super( _paintContext );
		this.x = 0;
		this.y = 0;
		this.color = 'fg';
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}


	mouseDown( pState ) {

		this.color = 'fg';
		if( pState.mouseState.rightButton ) {
			this.color = 'bg';
		}
		return { painted: false, overlay: false };

	}

	mouseUp( pState ) {

		this.x = pState.mouseState.x;
		this.y = pState.mouseState.y;

		return { painted: false, x: this.x, y: this.y, overlay: false, color: this.color  };
	}

	mouseMove( pState ) {

		return { painted: false, overlay: false };
	}

}

class grabFunction extends DFTemplate {

    constructor( _paintContext, _overlay, _w, _h ) {

		super( _paintContext );
		this.overlay = _overlay;
		this.w = _w;
		this.h = _h;

		this.x1 =0;
		this.y1 =0;

		this.x2 =1;
		this.y2 =1;

	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}


	mouseDown( pState ) {

		this.x1 = pState.mouseState.x;
		this.y1 = pState.mouseState.y;

		return { painted: false, overlay: false };

	}

	mouseUp( pState ) {

		return { painted: false, overlay: false };
	}

	mouseMove( pState ) {


		if( pState.mouseState.leftButton ) {

			this.overlay.clear();

			this.x2 = pState.mouseState.x;
			this.y2 = pState.mouseState.y;

			this.overlay.setRect( this.x1, this.y1, this.x2, this.y2 );

			return { painted: true, overlay: true };
		}
		else {
			this.overlay.clear();
		}
		return { painted: false, overlay: false };
	}

}


class magicAreaFunction  extends DFTemplate {

	constructor( _paintContext, _overlay,  w, h, bus ) {

    super( _paintContext );
		this.w = w;
		this.h = h;
		this.stack = [];
		this.bus = bus;
    this.overlay = _overlay;

		this.counter = 0;
	}

	mouseDown( pState ) {

		this.mousedown = true;

		return { painted: true };
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

		var area = this.discoverArea( x, y );

		return { painted: true, area: area };
	}


	discoverArea( _x, _y ) {
		var x = _x;
		var y = _y;

		this.stack = [];
		var stack = this.stack;

		this.x0 = _x;
		this.y0 = _y;
		this.x1 = _x;
		this.y1 = _y;

		this.counter = 0;

		this.mask = new BitBuffer( this.w * this.h );
		this.pixelbuffer = this.paintContext.getImageData(0, 0, this.w, this.h);
		this.pixelbufferdata = this.pixelbuffer.data;

		this.fillBg = this.paintContext.getImageData(x, y, 1, 1).data;

		this.tryPush({ x: x  , y: y });

		var wait = 0;
		var maxStack = 0;

		var lines = [];
    var rows = [];

    for ( var xx=0; xx<this.w; xx++ ) {
		    rows[ xx ] = { use: false };
		}

		for ( var yy=0; yy<this.h; yy++ ) {
		    lines[ yy ] = { use: false };
		}

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

			this.mask.setBit( x + (y * this.w) , true);

			lines[ y ].use = true;
      rows[ x ].use = true;

			this.tryPush({ x: x+1  , y: y });
			this.tryPush({ x: x-1  , y: y });
			this.tryPush({ x: x  , y: y+1 });
			this.tryPush({ x: x  , y: y-1 });

		}

		this.pixelbufferdata = null;
		this.pixelbuffer = null;

		var y0=-1;
    var y1 = -1;
		for ( var yy=0; yy<this.h; yy++ ) {
			if ( lines[ yy ].use ) {
				if( y0 == -1 && y1 == -1 ) { y0=yy; y1 = yy;}
        else {
          if( yy > y1 ) {
            y1 = yy;
          }
          else if( yy < y0 ) {
            y0 = yy;
          }
        }
			}
		}

    var x0=-1;
    var x1=-1;
		for ( var xx=0; xx<this.w; xx++ ) {
			if ( rows[ xx ].use ) {
				if( x0 == -1 && x1 == -1 ) { x0=xx; x1 = xx;}
        else {
          if( xx > x1 ) {
            x1 = xx;
          }
          else if( xx < x0 ) {
            x0 = xx;
          }
        }
			}
		}

		//this.mask = null;

		console.log( "area xy->xy=" + x0 + "," + x1 + "-" + y0 + "," + y1 );

		var mask = this.mask;
		this.mask = null;

		return { pixels: mask, w: this.w , sx0: x0, sx1: x1, sy0: y0, sy1:y1 };

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

class FigureFill {

  constructor( fillmode, points, paintContext, patternBrush, fillColor ) {

    this.fillMode = fillmode;
    this.points = points;
    this.paintContext = paintContext;
    this.brush = patternBrush;
    this.shapes = new Shapes();
    this.fillColor = fillColor;

  }

  do() {

      var lines = this.shapes.solid( this.points );
      var vlines = this.shapes.solidV( this.points );

      console.log( "minmaxY" + lines.miny + "," + lines.maxy) ;
      console.log( "minmaxX" + vlines.minx + "," + vlines.maxx) ;

      this.paintContext.globalAlpha = 1.0;
      this.paintContext.fillStyle = this.fillColor;

      var mode = this.fillMode;
      var distort = this.getDistortionFunction("expwarp3");//"expwarp2");
      var distortfact = .6;

      if( mode == 'solid') {

        for( var x = vlines.minx; x<= vlines.maxx; x++ ) {
            var l = vlines[ x ];
            this.paintContext.fillRect(x, l.miny , 1, (l.maxy - l.miny)+1 );
          }
      }
      else if( mode == 'stretch') { //good one
        var brushW = this.brush.w;
        var brushH = this.brush.h;
        var brushContext = this.brush.getContext();

        var areaW = (vlines.maxx - vlines.minx) + 1;
        var areaH = (lines.maxy - lines.miny) + 1;

        var brushIDVdata = brushContext.getImageData( 0, 0, brushW, brushH ).data;
        var brushRowsize = brushW  *4;

        for( var x = vlines.minx; x<= vlines.maxx; x++ ) {

          var l = vlines[ x ];
          var bxf = (x - vlines.minx ) / areaW;
          var bx = Math.floor( bxf * (brushW-1) );

          //var brushIDVdata = this.getVLine( brushContext, bx, 0, brushH ).data;
          var ctxIDV = this.getVLine( this.paintContext, x, l.miny, (l.maxy -  l.miny) + 1 );
          var ctxIDVdata = ctxIDV.data;
          var offset = 0;
          var brXOffset = (bx * 4);
          var brOffset;

          for( var y = l.miny; y<= l.maxy; y++ ) {

            var byf = (y - lines.miny ) / areaH;
            var by = Math.floor( byf * (brushH-1) );
            brOffset = (by * brushRowsize) + brXOffset;

            ctxIDVdata[offset + 0] = brushIDVdata[brOffset + 0];
            ctxIDVdata[offset + 1] = brushIDVdata[brOffset + 1];
            ctxIDVdata[offset + 2] = brushIDVdata[brOffset + 2];

            offset += 4;
          }

          this.paintContext.putImageData( ctxIDV, x, l.miny );

        }
      }
      else if( mode == 'wrap') { //new one
        var brushW = this.brush.w;
        var brushH = this.brush.h;
        var brushContext = this.brush.getContext();

        var areaW = (vlines.maxx - vlines.minx) + 1;
        var areaH = (lines.maxy - lines.miny) + 1;

        var brushIDVdata = brushContext.getImageData( 0, 0, brushW, brushH ).data;
        var brushRowsize = brushW  *4;

        for( var x = vlines.minx; x<= vlines.maxx; x++ ) {


          var l = vlines[ x ];

          var ctxIDV = this.getVLine( this.paintContext, x, l.miny, (l.maxy -  l.miny) + 1 );
          var ctxIDVdata = ctxIDV.data;
          var offset = 0;

          var brOffset;

          for( var y = l.miny; y<= l.maxy; y++ ) {

            //var myHeight = areaH;
            var hl = lines[ y ];
            var myHeight1 =  (l.maxy -  l.miny) + 1;
            var myWidth1  =  (hl.maxx -  hl.minx) + 1;
            var myHeight2 =  areaH;
            var myWidth2  =  areaW;
            var f1 = distortfact;
            var f2 = 1-distortfact;

            var byf1 = (y - l.miny ) / myHeight1;  //wrapping
            var byf2 = byf1;
            byf1 = distort( byf1 );
            var byf = (byf1 * f1 + byf2 * f2);
            var by = Math.floor( byf * (brushH-1) );

            var bxf1 = (x - hl.minx ) / myWidth1;
            var bxf2 = bxf1;
            bxf1 = distort( bxf1 );
            var bxf = (bxf1 * f1 + bxf2 * f2);
            var bx = Math.floor( bxf * (brushW-1) );

            var brXOffset = (bx * 4);

            brOffset = (by * brushRowsize) + brXOffset;

            ctxIDVdata[offset + 0] = brushIDVdata[brOffset + 0];
            ctxIDVdata[offset + 1] = brushIDVdata[brOffset + 1];
            ctxIDVdata[offset + 2] = brushIDVdata[brOffset + 2];

            offset += 4;
          }

          this.paintContext.putImageData( ctxIDV, x, l.miny );

        }
    }


  }

  getDistortionFunction( mode ) {
    if( mode == 'coswarp' ) {
      return this.coswarp;
    }
    if( mode == 'cosinvwarp' ) {
      return this.cosinvwarp;
    }
    else if( mode == 'expwarp' ) {
      return this.expwarp;
    }
    else if( mode == 'expwarp2' ) {
      return this.expwarp2;
    }
    else if( mode == 'expwarp3' ) {
      return this.expwarp3;
    }
    else if( mode == 'none' ) {
      return this.nowarp;
    }
  }

  nowarp( x ) {
    return x;
  }


  cosinvwarp( x ) {

    var pi=3.1415;
    return ( Math.cos((x*pi) + pi ) / 2 ) + 0.5

  }


  coswarp( x ) {

    var pi=3.1415;
    if( x < 0.5 ) {
      return Math.cos(((x-.5)*pi))/2
    }
    else  {
      return (Math.cos(((x+.5)*pi))/2)+1
    }
  }

  expwarp( x ) {
    if( x < 0.5 ) {
      return (-(x-.5)*(x-.5)*2)+.5;
    }
    else  {
      return ((x-.5)*(x-.5)*2)+.5;
    }
  }

  expwarp2( x ) {
    var w;
    if( x < 0.5 ) {
      w= (-(x-.5)*(x-.5)*2)+.5;
    }
    else  {
      w= ((x-.5)*(x-.5)*2)+.5;
    }
    return ( w + 2*x) / 3;
    //return ( w + x) / 2;
  }



  expwarp3_old( x ) {
    var w;
    if( x < 0.3 ) {
      w= (-(x-.3)*(x-.3)*5.5555555)+.5;
    }
    else if( x >= 0.3 && x < 0.7) {
      w = 0.5;
    }
    else  {
      w= ((x-.7)*(x-.7)*5.5555555)+.5;
    }
    return ( 5*w + x) / 6;
  }


  expwarp3( x0 ) {
    var w;
    var x=0.1 + (0.8*x0);

    if( x < 0.3 ) {
      w= (-(x-.3)*(x-.3)*5.5555555)+.5;
    }
    else if( x >= 0.3 && x < 0.7) {
      w = 0.5;
    }
    else  {
      w= ((x-.7)*(x-.7)*5.5555555)+.5;
    }
    return ( 5*w + x) / 6;
  }

  getVLine( context, x, y0, h ) {
    return context.getImageData( x, y0, 1, h );
  }

}

class lineDF extends DFTemplate {

  constructor( _paintContext, _overlay  ) {

	  super( _paintContext );
		this.overlay = _overlay;
		this.brush = null;

    this.shapes = new Shapes();

	}


	getBrush( pState ) {
		var brush = pState.brush;
		if( pState.mouseState.rightButton ) {
			brush = pState.bgbrush;
		}
		return brush;
	}

	mouseDown( pState ) {

		this.x0 = pState.mouseState.x;
		this.y0 = pState.mouseState.y;

		return { painted: false, overlay: false };

	}

	mouseMove( pState ) {


		if( pState.mouseState.leftButton || pState.mouseState.rightButton ) {
			var linePoints = this.shapes.line( this.x0, this.y0, pState.mouseState.x, pState.mouseState.y );

			this.overlay.clearBrush();
			this.brush = this.getBrush( pState );

			for( var i = 0; i< linePoints.length; i++ ) {
				var p = linePoints[ i ];
				this.overlay.paintBrush( this.brush, p.x, p.y );
			}

			//pState.brush.draw( this.paintContext, pState.mouseState.x, pState.mouseState.y );

		}
		else {
			this.overlay.clearBrush();
			this.overlay.paintBrush( pState.brush, pState.mouseState.x, pState.mouseState.y );
			//this.overlay.paintBrush( pState.brush, pState.mouseState.y, pState.mouseState.x );

		}

		return { painted: false, overlay: true };
	}

	mouseUp( pState ) {

		this.overlay.clearBrush();

		var linePoints = this.shapes.line( this.x0, this.y0, pState.mouseState.x, pState.mouseState.y );


		if( this.brush == null ) {
			return { painted: false, overlay: false };
		}

		for( var i = 0; i< linePoints.length; i++ ) {
			var p = linePoints[ i ];

			this.brush.draw( this.paintContext, p.x, p.y );

		}

		return { true: false, overlay: false };
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}

}


class ovalDF extends DFTemplate {

    constructor( _paintContext, _overlay, _circle  ) {

    super( _paintContext );
		this.overlay = _overlay;
		this.brush = null;
    this.fillColor = null;
    this.shapes = new Shapes();
    this.symetric = _circle;

    this.outline = true;
    this.fill = false;

	}

  getFillColor( pState ) {
    var color = pState.fcColor;
    if( pState.mouseState.rightButton ) {
      color = pState.bgColor;
    }
    return color.getHTML();
  }

	getBrush( pState ) {
		var brush = pState.brush;
		if( pState.mouseState.rightButton ) {
			brush = pState.bgbrush;
		}
		return brush;
	}

	mouseDown( pState ) {

		this.x0 = pState.mouseState.x;
		this.y0 = pState.mouseState.y;

    this.fill = pState.shapeFill;
    this.fillMode = pState.shapeFillMode;
    this.outline = pState.shapeWithBrush;

    this.brush = this.getBrush( pState );
    this.fillColor = this.getFillColor( pState );

		return { painted: false, overlay: false };

	}


  getX1Y1( pState )  {
    console.log( "getX1Y1(symetric="+this.symetric+")");
    if( this.symetric ) {

      var y1 = pState.mouseState.y;
      var x1 = pState.mouseState.x;
      var y0 = this.y0;
      var x0 = this.x0;

      var tdistX = x1 - x0;
      var tdistY = y1 - y0;

      var dist = Math.sqrt( (tdistX * tdistX) + (tdistY * tdistY) );

      var x1b = dist + x0;
      var y1b = dist + y0;

      return {x: x1b, y: y1b};
    }
    return {x: pState.mouseState.x, y: pState.mouseState.y};
  }

	mouseMove( pState ) {

    this.fill = pState.shapeFill;
    this.outline = pState.shapeWithBrush;
		if( pState.mouseState.leftButton || pState.mouseState.rightButton ) {

      var x1y1 = this.getX1Y1( pState );
			var ovalPoints = this.shapes.oval( this.x0, this.y0, x1y1.x, x1y1.y );

      console.log("("+this.x0+","+this.y0+")->("+x1y1.x+","+x1y1.y+")");

			this.overlay.clearBrush();


      var b = this.brush;
      if( !this.outline ) {
        b = pState.brush1Pix;
      }

			for( var i = 0; i< ovalPoints.length; i++ ) {
				var p = ovalPoints[ i ];
				this.overlay.paintBrush( b, p.x, p.y );
			}

		}
		else {
			this.overlay.clearBrush();
      if( this.outline ) {
			     this.overlay.paintBrush( pState.brush, pState.mouseState.x, pState.mouseState.y );
      }

		}

		return { painted: false, overlay: true };
	}

	mouseUp( pState ) {

		this.overlay.clearBrush();

    var x1y1 = this.getX1Y1( pState );
		var ovalPoints = this.shapes.oval( this.x0, this.y0,  x1y1.x, x1y1.y );

		if( this.brush == null ) {
			return { painted: false, overlay: false };
		}


    if( this.fill ) {


      var filler = new FigureFill( this.fillMode, ovalPoints, this.paintContext, this.brush, this.fillColor );

      filler.do();

    }

    if( this.outline ) {
  		for( var i = 0; i< ovalPoints.length; i++ ) {
  			var p = ovalPoints[ i ];
  			this.brush.draw( this.paintContext, p.x, p.y );
  		}
    }

		return { painted: true, overlay: false };
	}



	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}

}


class rectangleDF extends DFTemplate {

    constructor( _paintContext, _overlay, _square  ) {

    super( _paintContext );
		this.overlay = _overlay;
		this.brush = null;
    this.fillColor = null;
    this.shapes = new Shapes();
    this.symetric = _square;

    this.outline = true;
    this.fill = false;

	}


	getBrush( pState ) {
		var brush = pState.brush;
		if( pState.mouseState.rightButton ) {
			brush = pState.bgbrush;
		}
		return brush;
	}

  getFillColor( pState ) {
    var color = pState.fcColor;
    if( pState.mouseState.rightButton ) {
      color = pState.bgColor;
    }
    return color.getHTML();
  }


	mouseDown( pState ) {

		this.x0 = pState.mouseState.x;
		this.y0 = pState.mouseState.y;

    this.fill = pState.shapeFill;
    this.fillMode = pState.shapeFillMode;
    this.outline = pState.shapeWithBrush;

    this.brush = this.getBrush( pState );
    this.fillColor = this.getFillColor( pState );

		return { painted: false, overlay: false };

	}


  getXYBox( pState )  {
    console.log( "getX1Y1(circle="+this.symetric+")");

    var y1 = pState.mouseState.y;
    var x1 = pState.mouseState.x;
    var y0 = this.y0;
    var x0 = this.x0;

    if( this.symetric ) {

      var tdistX = x1 - x0;
      var tdistY = y1 - y0;
      var tdistXSign = 1;
      var tdistYSign = 1;

      if(  tdistX != 0 ) {
        tdistXSign = Math.abs(tdistX) / tdistX;
      }

      if(  tdistY != 0 ) {
        tdistYSign = Math.abs(tdistY) / tdistY;
      }

      var dist = Math.round( Math.sqrt( (tdistX * tdistX) + (tdistY * tdistY) ) );

      var x1b;
      var y1b;

      if( Math.abs( tdistX ) > Math.abs( tdistY ) ) {
        x1b =  (tdistXSign * Math.abs(tdistX)) + x0;
        y1b =  (tdistYSign * Math.abs(tdistX)) + y0;
      }
      else {
        x1b =  (tdistXSign * Math.abs(tdistY)) + x0;
        y1b =  (tdistYSign * Math.abs(tdistY)) + y0;
      }

      return {x0: x0-dist, y0: y0-dist, x1: x0+dist, y1: y0+dist};
    }
    return {x0:x0,y0:y0, x1: x1, y1: y1};
  }


	mouseMove( pState ) {

    this.fill = pState.shapeFill;
    this.fillMode = pState.shapeFillMode;

    this.outline = pState.shapeWithBrush;

		if( pState.mouseState.leftButton || pState.mouseState.rightButton ) {

      var x1y1 = this.getXYBox( pState );
			var rectPoints = this.shapes.rect( x1y1.x0, x1y1.y0, x1y1.x1, x1y1.y1 );

			this.overlay.clearBrush();


      var b = this.brush;
      if( !this.outline ) {
        b = pState.brush1Pix;
      }

			for( var i = 0; i< rectPoints.length; i++ ) {
				var p = rectPoints[ i ];
				this.overlay.paintBrush( b, p.x, p.y );
			}

		}
		else {
			this.overlay.clearBrush();

      if( this.outline ) {
        this.overlay.paintBrush( pState.brush, pState.mouseState.x, pState.mouseState.y );
      }


		}

		return { painted: false, overlay: true };
	}

	mouseUp( pState ) {

		this.overlay.clearBrush();

    var x1y1 = this.getXYBox( pState );
    var rectPoints = this.shapes.rect( x1y1.x0, x1y1.y0, x1y1.x1, x1y1.y1 );

		if( this.brush == null ) {
			return { painted: false, overlay: false };
		}

    if( this.fill ) {

      var filler = new FigureFill( this.fillMode, rectPoints, this.paintContext, this.brush, this.fillColor );

      filler.do();


    }

    if( this.outline ) {
  		for( var i = 0; i< rectPoints.length; i++ ) {
  			var p = rectPoints[ i ];

  			this.brush.draw( this.paintContext, p.x, p.y );
  		}
    }
		return { painted: false, overlay: false };
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}


  getVLine( context, x, y0, h ) {
    return context.getImageData( x, y0, 1, h );
  }


}


class solidDF extends DFTemplate {

    constructor( _paintContext, _overlay ) {

    super( _paintContext );
		this.overlay = _overlay;
		this.prefX = undefined;
		this.prefY = undefined;
    this.shapes = new Shapes();

	}

	getBrush( pState ) {
		var brush = pState.brush;
		if( pState.mouseState.rightButton ) {
			brush = pState.bgbrush;
		}
		return brush;
	}

	mouseDown( pState ) {

		var brush = this.getBrush( pState );
		brush.draw( this.paintContext, pState.mouseState.x, pState.mouseState.y );

		this.prefX = pState.mouseState.x;
		this.prefY = pState.mouseState.y;

		return { painted: true, overlay: false };

	}

	mouseUp( pState ) {
		this.prefX = undefined;
		this.prefY = undefined;

		return { painted: false, overlay: false };
	}

	mouseMove( pState ) {


		if( pState.mouseState.leftButton || pState.mouseState.rightButton ) {

			var brush = this.getBrush( pState );

			if( this.prefX == undefined ) { this.prefX = pState.mouseState.x; this.prefY = pState.mouseState.y;}


      var linePoints = this.shapes.line( this.prefX, this.prefY, pState.mouseState.x, pState.mouseState.y );

			for( var i = 0; i< linePoints.length; i++ ) {
				var p = linePoints[ i ];
        brush.draw( this.paintContext, p.x, p.y );
			}

			this.prefX = pState.mouseState.x;
			this.prefY = pState.mouseState.y;

			this.overlay.clearBrush();

			return { painted: true, overlay: false };
		}

		this.overlay.clearBrush();
		this.overlay.paintBrush( pState.brush, pState.mouseState.x, pState.mouseState.y );

		return { painted: false, overlay: true };
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}

}


class sprayDF extends DFTemplate {

    constructor( _paintContext, _overlay ) {

    super( _paintContext );
		this.overlay = _overlay;
    this.size = 20;
    this.size2 = this.size / 2;
    this.intensity = 1;

	}


  setSize( size ) {
    this.size = size;
    this.size2 = this.size / 2;
  }

  setIntensity( i ) {
    this.intensity = i;
  }

	getBrush( pState ) {
		var brush = pState.brush;
		if( pState.mouseState.rightButton ) {
			brush = pState.bgbrush;
		}
		return brush;
	}

	mouseDown( pState ) {

		var brush = this.getBrush( pState );

    var xoff = Math.floor(Math.random() * this.size) - this.size2;
    var yoff = Math.floor(Math.random() * this.size) - this.size2;

		brush.draw( this.paintContext, pState.mouseState.x + xoff, pState.mouseState.y + yoff );

		return { painted: true, overlay: false };

	}

	mouseUp( pState ) {
		return { painted: false, overlay: false };
	}

	mouseMove( pState ) {



    //var xoff = Math.floor(Math.random() * this.size) - this.size2;
    //var yoff = Math.floor(Math.random() * this.size) - this.size2;

		if( pState.mouseState.leftButton ||  pState.mouseState.rightButton ) {

			var brush = this.getBrush( pState );

      var repeat = 1;
      if( this.intensity == 2 ) {
        repeat = 10;
      }
      else if( this.intensity == 3 ) {
        repeat = 50;
      }

      for( var i = 0; i<=repeat; i++ ) {
          var angle = Math.random()*Math.PI*2;
          var dist =  ( .05 + (Math.random()*.95) ) * (this.size2) ;

          var xoff = Math.floor( Math.cos(angle)*dist );
          var yoff = Math.floor( Math.sin(angle)*dist );
			    brush.draw( this.paintContext, pState.mouseState.x + xoff, pState.mouseState.y + yoff);
      }

			this.overlay.clearBrush();

			return { painted: true, overlay: false };
		}

		this.overlay.clearBrush();
		this.overlay.paintBrush( pState.brush, pState.mouseState.x + xoff, pState.mouseState.y + yoff );

		return { painted: false, overlay: true };
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}

}

class simpleDF extends DFTemplate {

    constructor( _paintContext, _overlay ) {

    super( _paintContext );
		this.overlay = _overlay;

	}


	getBrush( pState ) {
		var brush = pState.brush;
		if( pState.mouseState.rightButton ) {
			brush = pState.bgbrush;
		}
		return brush;
	}

	mouseDown( pState ) {

		var brush = this.getBrush( pState );
		brush.draw( this.paintContext, pState.mouseState.x, pState.mouseState.y );

		return { painted: true, overlay: false };

	}

	mouseUp( pState ) {
		return { painted: false, overlay: false };
	}

	mouseMove( pState ) {

		if( pState.mouseState.leftButton ||  pState.mouseState.rightButton ) {

			var brush = this.getBrush( pState );

			brush.draw( this.paintContext, pState.mouseState.x, pState.mouseState.y );

			this.overlay.clearBrush();

			return { painted: true, overlay: false };
		}

		this.overlay.clearBrush();
		this.overlay.paintBrush( pState.brush, pState.mouseState.x, pState.mouseState.y );

		return { painted: false, overlay: true };
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}

}


class selectPointDF extends DFTemplate {

  constructor( _paintContext, _overlay ) {

    super( _paintContext );
		this.overlay = _overlay;
    this.id = "none";

	}

  setFunctionId( id ) {
    this.id = id;
  }

  setFunctionData( data ) {
    this.fdata = data;
  }

	mouseDown( pState ) {

		return { painted: false, overlay: false };

	}

	mouseUp( pState ) {
				return { painted: false, x: pState.mouseState.x, y: pState.mouseState.y, overlay: false, functionId: this.id, functionData: this.fdata   };
	}

	mouseMove( pState ) {

    return { painted: false, overlay: false };
	}

	setPaintingDimensions( _w, _h ) {
		this.w = _w;
		this.h = _h;
	}

}
