var ImageCanvasContext_counter = 0;


class Shapes  {
	constructor() {}

	solid( p ) {

		var minY = 1000000;
		var minX = 1000000;
		var maxX = -1;
		var maxY = -1;
		var lines = [];

		for( var i = 0; i < p.length; i++ ) {

			var pp = p[i];

			if(pp.y > maxY ) { maxY = pp.y; }
			if(pp.y < minY ) { minY = pp.y; }

			if(typeof lines[pp.y] === 'undefined') {
					lines[pp.y] = { minx: pp.x, maxx: pp.x };
			}
			else {
				var line = lines[pp.y];

				if( pp.x > line.maxx) {
					line.maxx = pp.x;
				}
				if( pp.x < line.minx) {
					line.minx = pp.x;
				}

			}

		}

		lines.maxy = maxY;
		lines.miny = minY;
		return lines;
	}

	solidV( p ) {

		var minY = 1000000;
		var minX = 1000000;
		var maxX = -1;
		var maxY = -1;
		var lines = [];

		for( var i = 0; i < p.length; i++ ) {

			var pp = p[i];

			if(pp.x > maxX ) { maxX = pp.x; }
			if(pp.x < minX ) { minX = pp.x; }

			if(typeof lines[pp.x] === 'undefined') {
					lines[pp.x] = { miny: pp.y, maxy: pp.y };
			}
			else {
				var line = lines[pp.x];

				if( pp.y > line.maxy) {
					line.maxy = pp.y;
				}
				if( pp.y < line.miny) {
					line.miny = pp.y;
				}

			}

		}

		lines.maxx = maxX;
		lines.minx = minX;
		return lines;
	}

	oval( _x0, _y0, _x1 , _y1 ) {
		var points = new Array();

		if( _x0 == _x1 && _y0 == _y1 ) {
			points.push( { x:_x0, y:_y0 } );
			return points;
		}

		var x0 = _x0;
		var x1 = _x1;
		var y0 = _y0;
		var y1 = _y1;
		var tmp;

		var midX = x0;
		var midY = y0;

		var rX = Math.floor( ( x1 - x0 )  );
		var rY = Math.floor( ( y1 - y0 )  );

		var maxA = Math.PI * 2;

		var lastX = null;
		var lastY = null;

		var stepA = 0.1;

		for( var a = 0; a <= maxA; a+= stepA ) {

			var x = Math.round(midX + rX* Math.cos(a));
			var y = Math.round(midY + rY* Math.sin(a));
			var p2 = null;

			if( lastX != null ) {
				p2 = this.line( lastX , lastY, x, y );

				for( var p = 0; p < p2.length; p++ ) {
					points.push( p2[ p ] );
				}

			}

			lastX = x;
			lastY = y;

		}

		x = Math.round(midX + rX* Math.cos(maxA));
		y = Math.round(midY + rY* Math.sin(maxA));
		p2 = this.line( lastX , lastY, x, y );

		for( var p = 0; p < p2.length; p++ ) {
			points.push( p2[ p ] );
		}

		return points;
	}


	line( _x0, _y0, _x1, _y1 ) {

		var points = new Array();

		if( _x0 == _x1 && _y0 == _y1 ) {
			points.push( { x: Math.round(_x0), y: Math.round(_y0) } );
			return points;
		}

		var x0 = _x0;
		var y0 = _y0;
		var x1 = _x1;
		var y1 = _y1;

/*		for( var i = -5; i<=5 ; i++ ) {
			points.push( { x: Math.round(_x0 + i), y: Math.round(_y0) } );
			points.push( { x: Math.round(_x1 + i), y: Math.round(_y1) } );
			points.push( { x: Math.round(_x0 ), y: Math.round(_y0+i) } );
			points.push( { x: Math.round(_x1 ), y: Math.round(_y1+i) } );
		}*/

		var w = Math.abs(x1 - x0);
		var h = Math.abs(y1 - y0);

		var tmp;
		if( w > h ) {

			if( x0 > x1 ) {
				tmp = x0;
				x0 = x1;
				x1 = tmp;

				tmp = y0;
				y0 = y1;
				y1 = tmp;
			}

			var yfact = 1;
			if( y1 < y0 ) { yfact = -1 ;}
			for( var x = 0; x<=w ; x++ ) {

				var xx = x + x0;

				var progress = (x / w);
				var yy = y0 + (yfact * (progress * h));

				points.push( { x:Math.round(xx), y:Math.round(yy) } );
			}

		}
		else {

			if( y0 > y1 ) {
				tmp = x0;
				x0 = x1;
				x1 = tmp;

				tmp = y0;
				y0 = y1;
				y1 = tmp;
			}

			var xfact = 1;
			if( x1 < x0 ) { xfact = -1 ;}
			for( var y = 0; y<=h ; y++ ) {

				var yy = y + y0;

				var progress = (y / h);
				var xx = x0 + (xfact * (progress * w));

				points.push( { x:Math.round(xx), y:Math.round(yy) } );
			}
		}

		return points;
	}

	rect( _x0, _y0, _x1 , _y1 ) {
		var points = new Array();

		if( _x0 == _x1 && _y0 == _y1 ) {
			points.push( { x:_x0, y:_y0 } );
			return points;
		}

		var x0 = _x0;
		var x1 = _x1;
		var y0 = _y0;
		var y1 = _y1;
		var tmp;

		if( x1 < x0 ) {
			tmp = x1;
			x1 = x0;
			x0 = tmp;
		}

		if( y1 < y0 ) {
			tmp = y1;
			y1 = y0;
			y0 = tmp;
		}


		for( var xx=x0; xx<=x1; xx++ ) {
			points.push( { x: xx, y: y0 } );
			points.push( { x: xx, y: y1 } );
		}


		for( var yy=y0; yy<=y1; yy++ ) {
			points.push( { x: x0, y: yy } );
			points.push( { x: x1, y: yy } );
		}

		return points;
	}

}

class ColorBox {

	int_mix(a, b, v)
	{
		return (1-v)*a + v*b;
	}

	// input: r,g,b in [0,255], out: h in [0,360) and s,v in [0,1]
	RGBtoHSV (r, g, b) {
	    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
	    rabs = r / 255;
	    gabs = g / 255;
	    babs = b / 255;
	    v = Math.max(rabs, gabs, babs),
	    diff = v - Math.min(rabs, gabs, babs);
	    diffc = c => (v - c) / 6 / diff + 1 / 2;
	    percentRoundFn = num => Math.round(num * 100) / 100;
	    if (diff == 0) {
	        h = s = 0;
	    } else {
	        s = diff / v;
	        rr = diffc(rabs);
	        gg = diffc(gabs);
	        bb = diffc(babs);

	        if (rabs === v) {
	            h = bb - gg;
	        } else if (gabs === v) {
	            h = (1 / 3) + rr - bb;
	        } else if (babs === v) {
	            h = (2 / 3) + gg - rr;
	        }
	        if (h < 0) {
	            h += 1;
	        }else if (h > 1) {
	            h -= 1;
	        }
	    }
	    return {
	        h: Math.round(h * 360),
	        s: percentRoundFn(s * 100) / 100,
	        v: percentRoundFn(v * 100) / 100
	    };
	}

	HSVtoRGB(H, S, V)
	/*
		This function expects 0<=H<=360, 0<=S<=1 and 0<=V<=1 and returns an object that contains R, G and B
		See HSV image: https://en.wikipedia.org/wiki/HSL_and_HSV#/media/File:HSV_color_solid_cylinder_saturation_gray.png
		H = Hue				(Spectrum of the rainbow, divided in 360 steps)
		S = Saturation		(0 is gray, 1 is fully saturated color)
		V = Value 			(0 is black, 1 is fully bright color)
	*/
	{
		var V2 = V * (1 - S);
		var r  = ((H>=0 && H<=60) || (H>=300 && H<=360)) ? V : ((H>=120 && H<=240) ? V2 : ((H>=60 && H<=120) ? this.int_mix(V,V2,(H-60)/60) : ((H>=240 && H<=300) ? this.int_mix(V2,V,(H-240)/60) : 0)));
		var g  = (H>=60 && H<=180) ? V : ((H>=240 && H<=360) ? V2 : ((H>=0 && H<=60) ? this.int_mix(V2,V,H/60) : ((H>=180 && H<=240) ? this.int_mix(V,V2,(H-180)/60) : 0)));
		var b  = (H>=0 && H<=120) ? V2 : ((H>=180 && H<=300) ? V : ((H>=120 && H<=180) ? this.int_mix(V2,V,(H-120)/60) : ((H>=300 && H<=360) ? this.int_mix(V,V2,(H-300)/60) : 0)));

		return {
			r : Math.round(r * 255),
			g : Math.round(g * 255),
			b : Math.round(b * 255)
		};
	}

	makeGradient( colFrom, colTo, colorCount ) {

			var rgbFrom = colFrom;
			var rgbTo = colTo;

			var rD = (rgbTo.r - rgbFrom.r ) / (colorCount-1);
			var gD = (rgbTo.g - rgbFrom.g ) / (colorCount-1);
			var bD = (rgbTo.b - rgbFrom.b ) / (colorCount-1);

			var rr = rgbFrom.r;
			var gg = rgbFrom.g;
			var bb = rgbFrom.b;

			var gradient = [];

			for( var ci = 0; ci< colorCount; ci++  ) {

				console.log( "ci=" + ci );

				var newRGB = {
					r: Math.round(rr),
					g: Math.round(gg),
					b: Math.round(bb)
				}

				gradient.push( newRGB );

				rr += rD;
				gg += gD;
				bb += bD;
			}

			return gradient;
	}


	makeAdditionalGradient( colFrom, colTo, colorCount ) {

			var rgbFrom = colFrom;
			var rgbTo = colTo;

			var rD = (rgbTo.r - rgbFrom.r ) / (colorCount);
			var gD = (rgbTo.g - rgbFrom.g ) / (colorCount);
			var bD = (rgbTo.b - rgbFrom.b ) / (colorCount);

			var rr = rgbFrom.r + rD;
			var gg = rgbFrom.g + gD;
			var bb = rgbFrom.b + bD;

			var gradient = [];

			for( var ci = 0; ci< colorCount; ci++  ) {

				console.log( "ci=" + ci );

				var newRGB = {
					r: Math.round(rr),
					g: Math.round(gg),
					b: Math.round(bb)
				}

				gradient.push( newRGB );

				rr += rD;
				gg += gD;
				bb += bD;
			}

			return gradient;
	}

}

class ImageCanvasContext  {

	constructor() {}

	initWithCanvasOnly( _canvas ) {
		this.canvas = _canvas;
		this.context = this.canvas.getContext('2d');

		this.w = this.canvas.width;
		this.h = this.canvas.height;
	}

	initWithCanvas( _canvas, _context ) {
		this.canvas = _canvas;
		this.context = _context;

		this.w = this.canvas.width;
		this.h = this.canvas.height;
	}

	initNewCanvas( w, h ) {

		this.canvas = document.createElement('canvas');

		this.canvas.id     = "ImageCanvasContext_" + ImageCanvasContext_counter++;
		this.canvas.width  = w;
		this.canvas.height = h;

		this.w = w;
		this.h = h;

		this.context = this.canvas.getContext('2d');
	}

	initFromImage( img ) {

		this.canvas = document.createElement('canvas');

		this.canvas.id     = "ImageCanvasContext_" + ImageCanvasContext_counter++;
		this.canvas.width  = img.width;
		this.canvas.height = img.height;

		this.w = img.width;
		this.h = img.height;

		this.context = this.canvas.getContext('2d');
		this.context.drawImage(img, 0, 0);

	}

	copy() {

		var tmpImgCtxCanv = new ImageCanvasContext();

		tmpImgCtxCanv.initNewCanvas( this.w, this.h );
		tmpImgCtxCanv.context.drawImage( this.canvas, 0, 0);

		return tmpImgCtxCanv;

	}

	getCopyAllData() {
		return this.context.getImageData(0, 0, this.w, this.h);
	}

	setAllData( data ) {
		this.context.putImageData(data, 0, 0);
	}

	colorize( col ) {

		var imageData = this.getCopyAllData();

		for (var i=0;i<imageData.data.length;i+=4)
		{
			if( imageData.data[ i+3 ] != 0 ) {
				imageData.data[ i+0 ] = col.r;
				imageData.data[ i+1 ] = col.g;
				imageData.data[ i+2 ] = col.b;
			}
		}

		this.setAllData( imageData );
	}

	makeTransparent() {

		var imageData = this.getCopyAllData();

		for (var i=0;i<imageData.data.length;i+=4)
		{
			if( imageData.data[ i+3 ] != 0 ) {
				imageData.data[ i+3 ] = Math.floor(imageData.data[ i+3 ] * .75 )
			}
		}

		this.setAllData( imageData );
	}

	makeTransparentMaskFromColor( col ) {

		var imageData = this.getCopyAllData();

		for (var i=0;i<imageData.data.length;i+=4)
		{
			if(
					imageData.data[ i+0 ]  == col.r &&
					imageData.data[ i+1 ]  == col.g &&
					imageData.data[ i+2 ]  == col.b
			) {
				imageData.data[ i+3 ] = 0;
			}
			else {
				imageData.data[ i+3 ] = 255;
			}
		}

		this.setAllData( imageData );
	}

	flipX() {

		var imgCtxCanv = this;

		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;

		for( var y=0; y<h; y++ ) {
			for( var x=0; x<w; x++) {
				var x2= w-1-x;

				var offset1 = yoffset + (x * 4);
				var offset2 = yoffset + (x2 * 4);

				dstData[ offset1 ] 		= srcData[ offset2 ];
				dstData[ offset1+1 ] 	= srcData[ offset2+1 ];
				dstData[ offset1+2 ] 	= srcData[ offset2+2 ];
				dstData[ offset1+3 ] 	= srcData[ offset2+3 ];
			}

			yoffset+= (w*4);
		}

		imgCtxCanv.setAllData( dstIData );
	}

	flipY() {

		var imgCtxCanv = this;
		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;
		var yoffset2;

		for( var y=0; y<h; y++ ) {
			var y2= h-y-1;
			yoffset2 = (w*4) * y2;

			for( var x=0; x<w; x++) {


				var offset1 = yoffset + (x * 4);
				var offset2 = yoffset2 + (x * 4);

				dstData[ offset1 ] 		= srcData[ offset2 ];
				dstData[ offset1+1 ] 	= srcData[ offset2+1 ];
				dstData[ offset1+2 ] 	= srcData[ offset2+2 ];
				dstData[ offset1+3 ] 	= srcData[ offset2+3 ];
			}

			yoffset+= (w*4);
		}

		imgCtxCanv.setAllData( dstIData );

	}


	blur(  ) {

						var imgCtxCanv = this;
						var tmpImgCtxCanv = imgCtxCanv.copy( );

						var w=tmpImgCtxCanv.w;
						var h=tmpImgCtxCanv.h;
						var srcIData = tmpImgCtxCanv.getCopyAllData();
						var dstIData = imgCtxCanv.getCopyAllData();
						var srcData = srcIData.data;
						var dstData = dstIData.data;

						var yoffset = 0;
						var yoffset0 = 0;
						var yoffsetmin = 0;
						var rowSize = w*4;

						var colorBox = new ColorBox();

						yoffset+= ( rowSize );
						for( var y=1; y<h; y++ ) {

							for( var x=1; x<w; x++) {

								var offset = yoffset + (x * 4);
								var offset0 = yoffset + ((x-1) * 4);
								var offset0b = yoffset0 + (x * 4);

								if( srcData[ offset + 3] == 0) {
									continue;
								}

								var r0,g0,b0;
								r0 = srcData[ offset0 + 0];
								g0 = srcData[ offset0 + 1];
								b0 = srcData[ offset0 + 2];

								var r0b,g0b,b0b;
								r0b = srcData[ offset0b + 0];
								g0b = srcData[ offset0b + 1];
								b0b = srcData[ offset0b + 2];

								var r,g,b;
								r = srcData[ offset + 0];
								g = srcData[ offset + 1];
								b = srcData[ offset + 2];

								r = ( r + r0 + r0b ) / 3;
								g = ( g + g0 + g0b ) / 3;
								b = ( b + b0 + b0b ) / 3;

								dstData[ offset + 0]=r;
								dstData[ offset + 1]=g;
								dstData[ offset + 2]=b;

							}

							yoffset+= ( rowSize );
							yoffset0+= ( rowSize );
						}

						imgCtxCanv.setAllData( dstIData );
	}

	makeNegative() {
		var imgCtxCanv = this;
		var tmpImgCtxCanv = imgCtxCanv.copy( );

		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;
		var yoffsetmin = 0;
		var rowSize = w*4;

		var colorBox = new ColorBox();

		for( var y=0; y<h; y++ ) {

			for( var x=0; x<w; x++) {

				var offset = yoffset + (x * 4);

				if( srcData[ offset + 3] == 0) {
					continue;
				}

				var r,g,b;
				r = srcData[ offset + 0];
				g = srcData[ offset + 1];
				b = srcData[ offset + 2];

				dstData[ offset + 0]= 255 - r;
				dstData[ offset + 1]= 255 - g;
				dstData[ offset + 2]= 255 - b;

			}

			yoffset+= ( rowSize );
		}

		imgCtxCanv.setAllData( dstIData );

	}

	changeSaturation( level ) {

				var imgCtxCanv = this;
				var tmpImgCtxCanv = imgCtxCanv.copy( );

				var w=tmpImgCtxCanv.w;
				var h=tmpImgCtxCanv.h;
				var srcIData = tmpImgCtxCanv.getCopyAllData();
				var dstIData = imgCtxCanv.getCopyAllData();
				var srcData = srcIData.data;
				var dstData = dstIData.data;

				var yoffset = 0;
				var yoffsetmin = 0;
				var rowSize = w*4;

				var colorBox = new ColorBox();

				for( var y=0; y<h; y++ ) {

					for( var x=0; x<w; x++) {

						var offset = yoffset + (x * 4);

						if( srcData[ offset + 3] == 0) {
							continue;
						}

						var r,g,b;
						r = srcData[ offset + 0];
						g = srcData[ offset + 1];
						b = srcData[ offset + 2];

						var hsv = colorBox.RGBtoHSV( r, g, b );
						hsv.s = level;

						var rgb = colorBox.HSVtoRGB( hsv.h, hsv.s, hsv.v );

						dstData[ offset + 0]=rgb.r;
						dstData[ offset + 1]=rgb.g;
						dstData[ offset + 2]=rgb.b;

					}

					yoffset+= ( rowSize );
				}

				imgCtxCanv.setAllData( dstIData );

	}

	changeHue( degrees ) {

				var imgCtxCanv = this;
				var tmpImgCtxCanv = imgCtxCanv.copy( );

				var w=tmpImgCtxCanv.w;
				var h=tmpImgCtxCanv.h;
				var srcIData = tmpImgCtxCanv.getCopyAllData();
				var dstIData = imgCtxCanv.getCopyAllData();
				var srcData = srcIData.data;
				var dstData = dstIData.data;

				var yoffset = 0;
				var yoffsetmin = 0;
				var rowSize = w*4;

				var colorBox = new ColorBox();

				for( var y=0; y<h; y++ ) {

					for( var x=0; x<w; x++) {

						var offset = yoffset + (x * 4);

						if( srcData[ offset + 3] == 0) {
							continue;
						}

						var r,g,b;
						r = srcData[ offset + 0];
						g = srcData[ offset + 1];
						b = srcData[ offset + 2];

						var hsv = colorBox.RGBtoHSV( r, g, b );
						hsv.h = degrees;
						hsv.s = 1;

						var rgb = colorBox.HSVtoRGB( hsv.h, hsv.s, hsv.v );

						dstData[ offset + 0]=rgb.r;
						dstData[ offset + 1]=rgb.g;
						dstData[ offset + 2]=rgb.b;

					}

					yoffset+= ( rowSize );
				}

				imgCtxCanv.setAllData( dstIData );

	}

	fatPixels() {

		var imgCtxCanv = this;
		var tmpImgCtxCanv = imgCtxCanv.copy( );

		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;
		var yoffsetmin = 0;
		var rowSize = w*4;

		var colorBox = new ColorBox();

		for( var y=0; y<h; y++ ) {

			for( var x=1; x<w; x+=2) {

				var offset0 = yoffset + ((x-1) * 4);
				var offset = yoffset + (x * 4);

				var r,g,b;
				r = srcData[ offset0 + 0];
				g = srcData[ offset0 + 1];
				b = srcData[ offset0 + 2];

				dstData[ offset + 0]=r;
				dstData[ offset + 1]=g;
				dstData[ offset + 2]=b;

			}

			yoffset+= ( rowSize );
		}

		imgCtxCanv.setAllData( dstIData );

}

	trimAlfa2( ) {

		var imgCtxCanv = this;
		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;
		var yoffsetmin = 0;
		var rowSize = w*4;

		for( var y=0; y<h; y++ ) {

			for( var x=0; x<w; x++) {

				var offset = yoffset + (x * 4);
				var currAlfa = srcData[ offset + 3 ];
				var newAlpha = currAlfa;

				var yoffsetMin 	= offset - rowSize;
				var yoffsetPlus = offset + rowSize;
				var xoffsetMin = offset - 4;
				var xoffsetPlus = offset + 4;

				var alphaUp = 0;
				var alphaDown = 0;
				var alphaLeft = 0;
				var alphaRight = 0;

				if( x > 0 ) {
					alphaLeft = srcData[ xoffsetMin + 3 ];
				}
				if( y > 0 ) {
					alphaUp = srcData[ yoffsetMin + 3 ];
				}
				if( x<(w-1) ) {
					alphaRight = srcData[ xoffsetPlus + 3 ];
				}
				if(  y<(h-1) ) {
					alphaDown = srcData[ yoffsetPlus + 3 ];
				}

				newAlpha = Math.round(
									( alphaLeft + alphaUp + alphaRight + alphaDown + currAlfa )
														/ 5);

				dstData[ offset ] 		= srcData[ offset ] ;
				dstData[ offset+1 ] 	= srcData[ offset+1 ] ;
				dstData[ offset+2 ] 	= srcData[ offset+2 ] ;

				if( currAlfa > 0 ) {
					dstData[ offset+3 ] 	= 	newAlpha;
				}
				else {
					dstData[ offset+3 ] 	= 	0;
				}

			}

			yoffset+= ( rowSize );
		}

		imgCtxCanv.setAllData( dstIData );

	}


	trimAlfa( factor ) {

		var imgCtxCanv = this;
		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;
		var yoffsetmin = 0;
		var rowSize = w*4;

		for( var y=0; y<h; y++ ) {

			for( var x=0; x<w; x++) {

				var offset = yoffset + (x * 4);

				var isBg;

				isBg =
						srcData[ offset + 3 ] < 255;

				var keep = false;

				if( !isBg ) {

					var yoffsetMin 	= offset - rowSize;
					var yoffsetPlus = offset + rowSize;
					var xoffsetMin = offset - 4;
					var xoffsetPlus = offset + 4;

					var isUpBg ;
					var isDownBg ;
					var isLeftBg ;
					var isRightBg ;

					if( x>=1 && y>= 1 && x<(w-1) && y<(h-1) ) {


						isUpBg =
								srcData[ yoffsetMin + 3 ] < 255;

						isDownBg =
								srcData[ yoffsetPlus + 3 ] < 255;

						isLeftBg =
								srcData[ xoffsetMin + 3 ] < 255;

						isRightBg =
								srcData[ xoffsetPlus + 3 ] < 255;

						if( ! (isUpBg || isDownBg || isLeftBg || isRightBg) ) {
							keep = true;
						}

					}

				}

				dstData[ offset ] 		= srcData[ offset ] ;
				dstData[ offset+1 ] 	= srcData[ offset+1 ] ;
				dstData[ offset+2 ] 	= srcData[ offset+2 ] ;

				if( keep ) {
					dstData[ offset+3 ] 	= srcData[ offset+3 ];
				}
				else {

					dstData[ offset+3 ] 	= srcData[ offset+3 ] * factor;
				}

			}

			yoffset+= ( rowSize );
		}

		imgCtxCanv.setAllData( dstIData );

	}


	trim( bgColor ) {

		var imgCtxCanv = this;
		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;
		var yoffsetmin = 0;
		var rowSize = w*4;

		for( var y=0; y<h; y++ ) {

			for( var x=0; x<w; x++) {

				var offset = yoffset + (x * 4);

				var isBg;

				if( bgColor == null ) {
					isBg =
						srcData[ offset + 3 ] == 0;
				}
				else {
					isBg =
						srcData[ offset + 0 ] == bgColor.r &&
						srcData[ offset + 1 ] == bgColor.g &&
						srcData[ offset + 2 ] == bgColor.b
						;
				}

				var keep = false;

				if( !isBg ) {

					var yoffsetMin 	= offset - rowSize;
					var yoffsetPlus = offset + rowSize;
					var xoffsetMin = offset - 4;
					var xoffsetPlus = offset + 4;

					var isUpBg ;
					var isDownBg ;
					var isLeftBg ;
					var isRightBg ;

					if( x>=1 && y>= 1 && x<(w-1) && y<(h-1) ) {

						if( bgColor == null ) {

							isUpBg =
								srcData[ yoffsetMin + 3 ] == 0;

							isDownBg =
								srcData[ yoffsetPlus + 3 ] == 0;

							isLeftBg =
								srcData[ xoffsetMin + 3 ] == 0;

							isRightBg =
								srcData[ xoffsetPlus + 3 ] == 0;
						}
						else {

							isUpBg =
								srcData[ yoffsetMin + 0 ] == bgColor.r &&
								srcData[ yoffsetMin + 1 ] == bgColor.g &&
								srcData[ yoffsetMin + 2 ] == bgColor.b;

							isDownBg =
								srcData[ yoffsetPlus + 0 ] == bgColor.r &&
								srcData[ yoffsetPlus + 1 ] == bgColor.g &&
								srcData[ yoffsetPlus + 2 ] == bgColor.b;

							isLeftBg =
								srcData[ xoffsetMin + 0 ] == bgColor.r &&
								srcData[ xoffsetMin + 1 ] == bgColor.g &&
								srcData[ xoffsetMin + 2 ] == bgColor.b;

							isRightBg =
								srcData[ xoffsetPlus + 0 ] == bgColor.r &&
								srcData[ xoffsetPlus + 1 ] == bgColor.g &&
								srcData[ xoffsetPlus + 2 ] == bgColor.b;

						}

						if( ! (isUpBg || isDownBg || isLeftBg || isRightBg) ) {
							keep = true;
						}

					}

				}


				if( keep ) {
					dstData[ offset ] 		= srcData[ offset ];
					dstData[ offset+1 ] 	= srcData[ offset+1 ];
					dstData[ offset+2 ] 	= srcData[ offset+2 ];
					dstData[ offset+3 ] 	= srcData[ offset+3 ];
				}
				else {

					if( bgColor == null ) {
						dstData[ offset ] 		= 0;
						dstData[ offset+1 ] 	= 0;
						dstData[ offset+2 ] 	= 0;
						dstData[ offset+3 ] 	= 0;
						/*dstData[ offset ] 		= srcData[ offset ] ;
						dstData[ offset+1 ] 	= srcData[ offset+1 ] ;
						dstData[ offset+2 ] 	= srcData[ offset+2 ] ;
						dstData[ offset+3 ] 	= srcData[ offset+3 ] /2;	TODO, for softer brushes*/
					}
					else {

						dstData[ offset+0 ] 	= bgColor.r;
						dstData[ offset+1 ] 	= bgColor.g;
						dstData[ offset+2 ] 	= bgColor.b;
						dstData[ offset+3 ] 		= 255;
					}
				}

			}

			yoffset+= ( rowSize );
		}

		imgCtxCanv.setAllData( dstIData );

	}

	feather( fgcolor ) {

		var imgCtxCanv = this;
		var tmpImgCtxCanv = imgCtxCanv.copy( );

		var w=tmpImgCtxCanv.w;
		var h=tmpImgCtxCanv.h;
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		var dstIData = imgCtxCanv.getCopyAllData();
		var srcData = srcIData.data;
		var dstData = dstIData.data;

		var yoffset = 0;
		var yoffsetmin = 0;
		var rowSize = w*4;

		for( var y=0; y<h; y++ ) {

			for( var x=0; x<w; x++) {

				var offset = yoffset + (x * 4);

				var isBg =
					srcData[ offset + 3 ] == 0;

				var feather = false;

				if( isBg ) {

					var yoffsetMin 	= offset - rowSize;
					var yoffsetPlus = offset + rowSize;
					var xoffsetMin = offset - 4;
					var xoffsetPlus = offset + 4;

					if( x>=1 && y>= 1 && x<(w-1) && y<(h-1) ) {

						var isUpFg =
							srcData[ yoffsetMin + 3 ] != 0;

						var isDownFg =
							srcData[ yoffsetPlus + 3 ] != 0;

						var isLeftFg =
							srcData[ xoffsetMin + 3 ] != 0;

						var isRightFg =
							srcData[ xoffsetPlus + 3 ] != 0;

						if(  (isUpFg || isDownFg || isLeftFg || isRightFg) ) {
							feather = true;
						}
					}
				}

				if( feather ) {
					dstData[ offset ] 		= fgcolor.r;
					dstData[ offset+1 ] 	= fgcolor.g;
					dstData[ offset+2 ] 	= fgcolor.b;
					dstData[ offset+3 ] 	= 255;
				}
				else {
					dstData[ offset ] 		= srcData[ offset ];
					dstData[ offset+1 ] 	= srcData[ offset+1 ];
					dstData[ offset+2 ] 	= srcData[ offset+2 ];
					dstData[ offset+3 ] 	= srcData[ offset+3 ];
				}
			}

			yoffset+= ( rowSize );
		}

		imgCtxCanv.setAllData( dstIData );

	}

	rotate90Degrees() {

		var imgCtxCanv = this;
		var w=imgCtxCanv.w;
		var h=imgCtxCanv.h;
		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		imgCtxCanv.w = h;
		imgCtxCanv.h = w;
		imgCtxCanv.canvas.width = h;
		imgCtxCanv.canvas.height = w;
		var dstIData = imgCtxCanv.getCopyAllData();

		var offsetsrc = 0;
		var offsetdst = 0;

		var yoffsetmin = 0;
		var rowSizesrc = tmpImgCtxCanv.w	*4;
		var rowSizedst = imgCtxCanv.w			*4;

		for( var y=0; y<h; y++ ) {

			for( var x=0; x<w; x++) {

					var xd = h-y-1;
					var yd = x; //w-x-1;

					offsetsrc = ( y * rowSizesrc) + (x * 4);
					offsetdst = ( yd * rowSizedst) + ( xd * 4);

					dstIData.data[ offsetdst + 0 ] = srcIData.data[ offsetsrc + 0 ];
					dstIData.data[ offsetdst + 1 ] = srcIData.data[ offsetsrc + 1 ];
					dstIData.data[ offsetdst + 2 ] = srcIData.data[ offsetsrc + 2 ];
					dstIData.data[ offsetdst + 3 ] = srcIData.data[ offsetsrc + 3 ];
			}
		}
		imgCtxCanv.setAllData( dstIData );
		return { w:imgCtxCanv.w, h: imgCtxCanv.h}
	}


	pixelResize( wNew, hNew ) {

		var imgCtxCanv = this;
		var oldW=imgCtxCanv.w;
		var oldH=imgCtxCanv.h;
		var tmpImgCtxCanv = imgCtxCanv.copy( );
		var srcIData = tmpImgCtxCanv.getCopyAllData();
		imgCtxCanv.w = wNew;
		imgCtxCanv.h = hNew;
		imgCtxCanv.canvas.width = wNew;
		imgCtxCanv.canvas.height = hNew;
		var dstIData = imgCtxCanv.getCopyAllData();

		var offsetsrc = 0;
		var offsetdst = 0;

		var yoffsetmin = 0;
		var rowSizesrc = tmpImgCtxCanv.w	*4;
		var rowSizedst = imgCtxCanv.w			*4;

		var xFact = oldW / wNew;
		var yFact = oldH / hNew;

		for( var y=0; y<hNew; y++ ) {

			for( var x=0; x<wNew; x++) {

					var xs = Math.floor(x * xFact);
					var ys = Math.floor(y * yFact);

					offsetsrc = ( ys * rowSizesrc) + (xs * 4);
					offsetdst = ( y * rowSizedst) + ( x * 4);

					dstIData.data[ offsetdst + 0 ] = srcIData.data[ offsetsrc + 0 ];
					dstIData.data[ offsetdst + 1 ] = srcIData.data[ offsetsrc + 1 ];
					dstIData.data[ offsetdst + 2 ] = srcIData.data[ offsetsrc + 2 ];
					dstIData.data[ offsetdst + 3 ] = srcIData.data[ offsetsrc + 3 ];
			}
		}
		imgCtxCanv.setAllData( dstIData );

		return { w:imgCtxCanv.w, h: imgCtxCanv.h}
	}

}
