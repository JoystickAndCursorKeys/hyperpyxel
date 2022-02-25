class RawPalette {

	constructor() {
		this.colors = [];
	}

	getColorCount() {
		return this.colors.length;
	}

	getColor( i ) {
		return this.colors[ i ];
	}

	roundComponent( c ) {
			var c2 = Math.round( c );

			if( c2 > 255 ) { return 255; }
			if( c2 < 0   ) { return 0;   }

			return c2;
	}
}


class FadedPalette extends RawPalette {

	constructor( rgb1, rgb2, colorCount ) {
		super();
		this.colors = [];

		var r1 = rgb1.r;
		var g1 = rgb1.g;
		var b1 = rgb1.b;

		var r2 = rgb2.r;
		var g2 = rgb2.g;
		var b2 = rgb2.b;

		var rdelta = (r2 - r1) / colorCount;
		var gdelta = (g2 - g1) / colorCount;
		var bdelta = (b2 - b1) / colorCount;

		var r=r1;
		var g=g1;
		var b=b1;

		for( var i=0; i<colorCount; i++) {
				var rgb = {
						r: this.roundComponent( r ),
						g: this.roundComponent( g ),
						b: this.roundComponent( b )
					}

					r += rdelta;
					g += gdelta;
					b += bdelta;

					this.colors.push( rgb );
	  }
	}

}


class FadedPalette2 extends RawPalette {

	constructor( rgb1, rgb2, rgb3, colorCount ) {

		super();
		this.colors = [];
		var colorCountDiv2 = Math.round( colorCount / 2 );

		var r1 = rgb1.r;
		var g1 = rgb1.g;
		var b1 = rgb1.b;

		var r2 = rgb2.r;
		var g2 = rgb2.g;
		var b2 = rgb2.b;

		var rdelta = (r2 - r1) / colorCount;
		var gdelta = (g2 - g1) / colorCount;
		var bdelta = (b2 - b1) / colorCount;

		var rgb2b = {
				r: this.roundComponent( rgb2.r + rdelta),
				g: this.roundComponent( rgb2.g + gdelta),
				b: this.roundComponent( rgb2.b + bdelta )
		}

		var p1 = new FadedPalette( rgb1, rgb2, colorCountDiv2);
		var p2 = new FadedPalette( rgb2b, rgb3, colorCountDiv2);

		for( var i=0; i<p1.getColorCount(); i++) {
			this.colors.push ( p1.getColor( i ) );
		}
		for( var i=0; i<p2.getColorCount(); i++) {
			this.colors.push ( p2.getColor( i ) );
		}

	}


}

class PaletteImage extends RawPalette {

	constructor( url, colorW, notifyLoaded ) {

			super();
			this.url = url;
			this.img = new Image();

			this.colorW = colorW;

			var thisPalette = this;

			this.loaded = false;

			this.colors = [];

			this.notifyLoaded = notifyLoaded;

			this.imgonload = function(){

				var w = thisPalette.img.width;
				var h = thisPalette.img.height;

				thisPalette.iconCanvas = document.createElement('canvas');
				thisPalette.iconContext = thisPalette.iconCanvas.getContext('2d');

				thisPalette.iconCanvas.width = 	w;
				thisPalette.iconCanvas.height = 	h;

				thisPalette.iconContext.drawImage( thisPalette.img, 0, 0, w, h);

				thisPalette.xiconcount = w / thisPalette.colorW;

				for (var xicon = 0; xicon < thisPalette.xiconcount; xicon++) {

					var sx = xicon * thisPalette.colorW;
					var sy = 0;
					var imgdata = thisPalette.iconContext.getImageData(sx, sy, 1, 1);
					var sd  = imgdata.data;

					var col = { r: sd[0], g: sd[1], b: sd[2] };

					thisPalette.colors.push( col );

				}

				thisPalette.loaded = true;

				console.log( "NotifyLoadedObject = " + thisPalette.notifyLoaded.obj);
				console.log( "NotifyLoadedFunct = " + thisPalette.notifyLoaded.method);

				thisPalette.notifyLoaded.obj[thisPalette.notifyLoaded.method]( thisPalette );

			}

	}

	activateLoadingEvents() {

		//Onload event
		this.img.onload = this.imgonload;
		this.load();

	}

	load() {
		this.img.src = this.url;
	}
}

class ColorButtonRenderer {

	constructor ( ctx, r, g, b, xo, yo, w, h, txt, overlays ) {


		this.overlaysFill = null;
		this.overlays = overlays;
		if( this.overlays != null ) {
			this.overlaysFill = this.overlays[0];
		}

		this.xo = xo;
		this.yo = yo;

		this.w = w;
		this.h = h;
		this.colorData = ctx.createImageData( w, h);
//

		this.txt = txt;

		this.selectFG = false;
		this.selectFC = false;
		this.selectBG = false;

		this.setColor( {r: r, g: g, b: b} );
	}

	getColor() {
		return this.rgb;
	}

	setColor( rgb ) {

		this.rgb = {};
		this.rgb.r = rgb.r;
		this.rgb.g = rgb.g;
		this.rgb.b = rgb.b;

		var r = rgb.r;
		var g = rgb.g;
		var b = rgb.b;
		var xoffset = 0;
		var yoffset = 0;
		var rowoffset = this.w * 4;
		var offset;
		var d  = this.colorData.data;                        // only do this once per page

		for (var y = 0; y < this.h; y++) {

			xoffset = 0;
			for (var x = 0; x < this.w; x++) {
				offset = yoffset + xoffset;

				d[ offset + 0] = r;
				d[ offset + 1] = g;
				d[ offset + 2] = b;
				d[ offset + 3] = 255;

				xoffset += 4;

			}

			yoffset += rowoffset;
		}
	}

	draw( context, x, y ) {

		context.putImageData( this.colorData, x + this.xo, y + this.yo );

		if( this.txt != null ) {

			if( this.selectFC) {
				console.log("found selectFC");
			}
			if( this.selectFG ) {

				dmCMU.rect( context, x + this.xo+2, y + this.yo+2, this.w-4, this.h-4, 'rgba(255,255,255,1)', 1 );
				dmCMU.rect( context, x + this.xo+3, y + this.yo+3, this.w-6, this.h-6, 'rgba(128,128,128,1)', 1 );
				//dmCMU.rect( context, x + this.xo + 1, y + this.yo + 1, this.w -2 , this.h - 2, 'rgba(100,255,100,1)', 1 );
			}

			if( this.selectBG ) {
				dmCMU.rect( context, x + this.xo, y + this.yo, this.w, this.h, 'rgba(000,000,000,1)', 1 );
				dmCMU.rect( context, x + 1 + this.xo, y + 1 + this.yo, this.w - 2, this.h - 2, 'rgba(128,128,128,1)', 1 );

			}

			context.font = '10px arial';
			context.textBaseline  = 'bottom';
			context.fillStyle = "#ffffff";
			context.fillText( this.txt,  x + this.xo + 4, y + this.yo + 11);

			context.fillStyle = "#000000";
			context.fillText( this.txt,  x + this.xo + 5, y + this.yo + 12);


			if( this.selectFC && this.overlaysFill != null ) {
				this.overlaysFill.draw( context, x ,y  );

			}
		}
	}

}



class CurrentColorsButtonRenderer {

	constructor ( ctx, xo, yo, w, h ) {

		this.xo = xo;
		this.yo = yo;

		this.w = w;
		this.h = h;
		this.colorData = ctx.createImageData( w, h);

		this.colors = [];
		this.colors[ 'fg' ] = {r: 255, g: 255, b: 255};
		this.colors[ 'bg' ] = {r: 0, g: 0, b: 0};
		this.colors[ 'fc' ] = {r: 255, g: 255, b: 255};

		this.mode = 'fg';

		this.render();
	}

	setColor( rgb, mode ) {

		this.colors[ mode ] = rgb;

		this.render();

	}

	setMode( mode ) {

		this.mode = mode;
		this.render();

	}

	getMode( mode ) {

		return this.mode;

	}


	render() {

		console.log("CurrentColorsButtonRenderer");
		var xoffset = 0;
		var yoffset = 0;
		var rowoffset = this.w * 4;
		var offset;
		var d  = this.colorData.data;                        // only do this once per page

		var r0 = [];
		var g0 = [];
		var b0 = [];

		var r1 = [];
		var g1 = [];
		var b1 = [];

		var rgbF = this.colors[ 'fg' ];
		var rgbB = this.colors[ 'bg' ];
		var rgbFill = this.colors[ 'fc' ];

		var bgBW = 7;
		var bgBH = 7;

		/* FG */
		xoffset = 0;
		yoffset = 0;
		for (var y = 0; y < this.h; y++) {

			xoffset = 0;
			for (var x = 0; x < this.w; x++) {

				offset = yoffset + xoffset;

				d[ offset + 0] = rgbB.r;
				d[ offset + 1] = rgbB.g;
				d[ offset + 2] = rgbB.b;
				d[ offset + 3] = 255;

				xoffset += 4;

			}

			yoffset += rowoffset;
		}

		var fgW = this.w / 2;

		/* FG */
		xoffset = 0;
		yoffset = 0;
		yoffset += ( rowoffset * (bgBW - 1) );
		for (var y = bgBH-1; y < (this.h - (bgBH - 1)); y++) {

			xoffset = 0;
			xoffset += ( 4 * (bgBW -1) );
			for (var x = bgBW-1; x < (this.w - (bgBW -1)); x++) {

				offset = yoffset + xoffset;

				d[ offset + 0] = 0;
				d[ offset + 1] = 0;
				d[ offset + 2] = 0;
				d[ offset + 3] = 255;

				xoffset += 4;

			}

			yoffset += rowoffset;
		}

		xoffset = 0;
		yoffset = 0;
		yoffset += ( rowoffset * bgBW );
		var lastY = (this.h - bgBH) - 1;
		for (var y = bgBH; y <=lastY; y++) {

			xoffset = 0;
			xoffset += ( 4 * bgBW );
			for (var x = bgBW; x < (this.w - bgBW); x++) {

				offset = yoffset + xoffset;

				if( x < fgW ) {
					d[ offset + 0] = rgbF.r;
					d[ offset + 1] = rgbF.g;
					d[ offset + 2] = rgbF.b;
					d[ offset + 3] = 255;

					if( (y == lastY || y == bgBH || x==fgW-1 ) && this.mode == 'fg') {
						d[ offset + 0] = 255;
						d[ offset + 1] = 255;
						d[ offset + 2] = 255;
					}
					else if( (y == lastY-1 || y == bgBH+1  || x==fgW-2 ) && this.mode == 'fg') {
						d[ offset + 0] = 0;
						d[ offset + 1] = 0;
						d[ offset + 2] = 0;
					}
				}
				else if( x == fgW ) {
					d[ offset + 0] = 0;
					d[ offset + 1] = 0;
					d[ offset + 2] = 0;
					d[ offset + 3] = 255;
				}
				else {
					d[ offset + 0] = rgbFill.r;
					d[ offset + 1] = rgbFill.g;
					d[ offset + 2] = rgbFill.b;
					d[ offset + 3] = 255;

					if( (y == lastY || y == bgBH || x==fgW+1 ) && this.mode == 'fc') {
						d[ offset + 0] = 255;
						d[ offset + 1] = 255;
						d[ offset + 2] = 255;
					}
					else if( (y == lastY-1 || y == bgBH+1  || x==fgW+2 ) && this.mode == 'fc') {
						d[ offset + 0] = 0;
						d[ offset + 1] = 0;
						d[ offset + 2] = 0;
					}
				}

				xoffset += 4;

			}

			yoffset += rowoffset;
		}

	}

	draw( context, x, y ) {

		context.putImageData( this.colorData, x + this.xo, y + this.yo );
	}

}
