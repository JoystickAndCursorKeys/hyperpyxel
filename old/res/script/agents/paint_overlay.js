class OverlayPixel {
	constructor( _x, _y, _color  ) {
		this.x = _x;
		this.y = _y;
		this.color = _color;
	}
}


class OverlayVLine {
	constructor( _x, _y0, _y1 ) {
		this.x = _x;
		this.y0 = _y0;
		this.y1 = _y1;
	}
}

class OverlayHLine {
	constructor( _x0, _x1, _y ) {
		this.x0 = _x0;
		this.x1 = _x1;
		this.y = _y;
	}
}

class PaintOverlay {

	constructor(  ) {
		this.pixels= [];
		this.vlines= [];
		this.hlines= [];

		this.brushes = new Array();
		this.m = 0;
		this.rectMode = false;
		this.tileMode = false;
		this.intersectMode = false;

	}

	setIntersect( flag ) {
		this.intersectMode = flag;
	}

	setIntersectCoords( x, y, w, h  ) {
		this.intersectX = x;
		this.intersectY = y;
		this.intersectW = w;
		this.intersectH = h;

	}

	clear() {
		this.pixels= [];
		this.vlines= [];
		this.hlines= [];
		this.rectMode = false;
		this.tileMode = false;
	}

	clearBrush() {
		this.brushes = new Array();
	}

	set( x, y ) {
		this.pixels[ x+'_'+y ] = ( new OverlayPixel( x, y, null ));
	}

	paintBrush( _b, _x, _y ) {

		this.brushes.push( { x:_x, y:_y, brush: _b} );

	}

	update() {
		if( this.rectMode ) {
			this.pixels= [];
			this.drawRect();
			this.drawTiles();
		}
		//else if( this.intersectMode ) {
		//	this.drawIntersect();
		//}
	}

	unSet( x, y ) {
		var label = x+'_'+y;
		if( this.overlay[ label ] != undefined ) {
			this.overlay[ label ] = null;
		}
	}

	setTiles( gw, gh, w, h ) {

		this.gw = gw;
		this.gh = gh
		this.w = w;
		this.h = h;

		this.tileMode = true;

		this.drawTiles();

	}

	setRect( x0,y0, x1,y1 ) {

		var xx0 = x0;
		var	yy0 = y0;
		var xx1 = x1;
		var yy1 = y1;

		this.rectMode = true;

		if( x0 > x1 ) {
			xx0 = x1;
			xx1 = x0;
		}

		if( y0 > y1 ) {
			yy0 = y1;
			yy1 = y0;
		}

		this.rx0 = xx0;
		this.rx1 = xx1;
		this.ry0 = yy0;
		this.ry1 = yy1;

		this.drawRect();

	}


	drawTiles(  ) {

			if( this.tileMode != true ) {
				return;
			}

			for( var x= this.gw ; x<this.w; x+= this.gw ) {
					this.drawLineVer( x, 0, this.h -1 );
			}

			for( var y= this.gh ; y<this.h; y+= this.gh ) {
					this.drawLineHor( 0, this.w - 1, y );
			}
	}

	drawLineVer( lx, ly0, ly1 ) {

		this.vlines.push ( new OverlayVLine( lx, ly0, ly1) );

	}

	drawLineHor( lx0, lx1, ly ) {

		this.hlines.push ( new OverlayHLine( lx0, lx1, ly ) );

	}


	drawRect(  ) {
		this.rectMode = true;

		var xx0 = this.rx0;
		var	yy0 = this.ry0;
		var xx1 = this.rx1;
		var yy1 = this.ry1;

		this.m += 1;
		this.m = this.m % 5;

		var twice = false;
		if( ( xx1 - xx0 ) > 10  && ( yy1 - yy0 ) > 10) {
			twice = true;
		}

		for (var y = yy0 + this.m; y <= yy1; y+=5) {
			this.set( xx0, y );
			this.set( xx1, y );
			if( twice ) {
				this.set( xx0 + 1, y );
				this.set( xx1 - 1, y );
			}
		}

		for (var x = xx0 + this.m; x <= xx1; x+=5 ) {
			this.set( x, yy0 );
			this.set( x, yy1 );

			if( twice ) {
				this.set( x, yy0 + 1 );
				this.set( x, yy1 - 1 );
			}
		}
	}

	renderMagnifiedOLPixels( viewContext, paintContext, W, H, voffsetX, voffsetY, viewCursX, viewCursY, magnifyFactor ) {

		this.m += 1;
		this.m = this.m % 3;
		var n = 0;
		var bw = 0;

		var col = 'rgb(' +
				(255) + ',' +
				(255) + ',' +
				(255) + ')';

	  viewContext.globalCompositeOperation  = 'difference';
		for (var key in this.pixels) {
			/*n++;
			n = n % 3;
			if ( this.m != n ) {
				continue;
			}
			*/

			var ovlPix = this.pixels[ key ];
			if( ovlPix == undefined || ovlPix == null ) {
				continue;
			}

			var x = ((ovlPix.x - viewCursX ) * magnifyFactor) + voffsetX;
			var y = ((ovlPix.y - viewCursY ) * magnifyFactor) + voffsetY;

			if( x < W && y< H && x>=0 && y>=0 ) {

				viewContext.fillStyle = col;
				viewContext.fillRect(x, y, magnifyFactor, magnifyFactor);

			}
		}

		for (var key in this.vlines) {

			var ovlLine = this.vlines[ key ];
			if( ovlLine == undefined || ovlLine == null ) {
				continue;
			}

			var x = ((ovlLine.x - viewCursX ) * magnifyFactor) + voffsetX;
			var y0 = ((ovlLine.y0 - viewCursY ) * magnifyFactor) + voffsetY;
			var y1 = ((ovlLine.y1 - viewCursY ) * magnifyFactor) + voffsetY;

			if( x < W && x>=0 ) {

				if( y0 < 0 ) { y0 = 0;}
				else if( y0 >= H ) { y0 = H-1;}
				if( y1 < 0 ) { y1 = 0;}
				else if( y1 >= H ) { y1 = H-1;}

				viewContext.fillStyle = col;
				viewContext.fillRect(x, y0, 1, (y1 - y0) + magnifyFactor);

			}
		}

		for (var key in this.hlines) {

			var ovlLine = this.hlines[ key ];
			if( ovlLine == undefined || ovlLine == null ) {
				continue;
			}

			var x0 = ((ovlLine.x0 - viewCursX ) * magnifyFactor) + voffsetX;
			var x1 = ((ovlLine.x1 - viewCursX ) * magnifyFactor) + voffsetX;
			var y  = ((ovlLine.y  - viewCursY ) * magnifyFactor) + voffsetY;

			if( y < H && y>=0 ) {

				if( x0 < 0 ) { x0 = 0;}
				else if( x0 >= W ) { x0 = W-1;}
				if( x1 < 0 ) { x1 = 0;}
				else if( x1 >= W ) { x1 = W-1;}

				viewContext.fillStyle = col;
				viewContext.fillRect(x0, y, (x1 - x0) + magnifyFactor, 1 );

			}

		}


		if( this.intersectMode ) {
			var xx = this.intersectX;
			var	yy = this.intersectY;
			var ww = this.intersectW;
			var hh = this.intersectH;

			var xxx = ((xx - viewCursX ) * magnifyFactor) + voffsetX;
			var yyy = ((yy - viewCursY ) * magnifyFactor) + voffsetY;

			viewContext.fillStyle = col;
			var gap = magnifyFactor * 10;
			viewContext.fillRect(0, yyy, ww-1, magnifyFactor); //hor
			viewContext.fillRect(xxx , 0, magnifyFactor, hh-1);//ver
			viewContext.fillRect(xxx-gap, yyy, gap * 2, magnifyFactor); //hor
			viewContext.fillRect(xxx , yyy-gap, magnifyFactor, gap * 2);//ver

		}

		viewContext.globalCompositeOperation  = 'source-over';

/*		var gw = 16 * magnifyFactor; gh = 16 * magnifyFactor;
		for( var x=0; x< W)
				viewContext.globalCompositeOperation  = 'source-over';*/
	}

	renderMagnifiedBrushOperation( viewContext, paintContext, W, H, voffsetX, voffsetY, viewCursX, viewCursY, magnifyFactor ) {

		var brushPos;

		viewContext.globalCompositeOperation  = 'source-over';
		for( var i=0; i<this.brushes.length; i++ ) {

			brushPos = this.brushes[ i ];

			var b = brushPos.brush;
			var canvas = brushPos.brush.canvas;

			var x = ((( brushPos.x - b.xoff) - viewCursX) * magnifyFactor) + voffsetX;
			var y = ((( brushPos.y - b.yoff) - viewCursY) * magnifyFactor) + voffsetY;

			viewContext.drawImage( canvas ,
				x,
				y,
				b.w * magnifyFactor ,
				b.h * magnifyFactor );

		}

		viewContext.globalCompositeOperation  = 'source-over';
	}


	renderMagnified( viewContext, paintContext, W, H, voffsetX, voffsetY, viewCursX, viewCursY, magnifyFactor ) {

		this.renderMagnifiedOLPixels(
			viewContext,
			paintContext,
			W, H,
			voffsetX, voffsetY,
			viewCursX, viewCursY,
			magnifyFactor );

		this.renderMagnifiedBrushOperation(
			viewContext,
			paintContext,
			W, H,
			voffsetX, voffsetY,
			viewCursX, viewCursY,
			magnifyFactor );

	}
}
