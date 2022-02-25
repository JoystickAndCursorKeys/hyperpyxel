var AutoBrush_cnt = 1000;

class BareBrush {

	constructor( w, h, xo, yo, canvas ) {
		this.init( w, h, xo, yo, canvas );

		this.mode = 'bare';
		this.colorable = false;
		this.colorized = false;
		this.mutable   = true;
	}

	init( w, h, xo, yo, canvas ) {

		this.w = w;
		this.h = h;
		this.xoff = xo;
		this.yoff = yo;
		this.canvas = canvas;
		this.context = null;

	}

	setContext( context ) {
		this.context = context;
	}

	getCanvas() {
		return this.canvas;
	}

	getContext() {
		return this.context;
	}


	draw( context, x, y ) {

		var oldval = context.imageSmoothingEnabled;
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.msImageSmoothingEnabled = false;
		context.imageSmoothingEnabled = false;

		context.drawImage( this.canvas, x - this.xoff , y - this.yoff  );

		context.mozImageSmoothingEnabled = oldval;
		context.webkitImageSmoothingEnabled = oldval;
		context.msImageSmoothingEnabled = oldval;
		context.imageSmoothingEnabled = oldval;

	}

	clone() {

		var canvas;
		canvas = document.createElement('canvas');
		canvas.width  = this.w;
		canvas.height  = this.h;
		canvas.id = AutoBrush_cnt++;

		var brush = new BareBrush(		this.w ,this.h ,this.xoff ,this.yoff , canvas	);
		brush.context = canvas.getContext('2d');

		brush.context.drawImage( this.canvas, 0, 0 );

		return brush;

	}

	transform( op, opOptions, fgcolor, bgcolor ) {

		if( this.mode == 'auto' ) {
			return;
		}

		var  icc = new ImageCanvasContext();

		icc.initWithCanvas( this.canvas, this.context);


		if( op == "FLIPX") {
			icc.flipX();
		}
		else if( op == "FLIPY") {
			icc.flipY();
		}
		else if( op == "SCALE") {
			wh = icc.pixelResize( opOptions.w, opOptions.h );

			this.w = wh.w;
			this.h = wh.h;
			this.xoff = Math.floor( wh.w/2 );
			this.yoff = Math.floor( wh.h/2 );
		}
		else if( op == "HALVE") {

			var w=Math.round( this.canvas.width / 2 );
			var h=Math.round( this.canvas.height / 2 );

			wh = icc.pixelResize( w, h );

			this.w = wh.w;
			this.h = wh.h;
			this.xoff = Math.floor( wh.w/2 );
			this.yoff = Math.floor( wh.h/2 );
		}
		else if( op == "DOUBLE") {
			var w=this.canvas.width * 2;
			var h=this.canvas.height * 2;

			if( this.canvas.width>1024 || this.canvas.height>768) {
				/*Do Nothing*/
			}
			else {

				wh = icc.pixelResize( w, h );

				this.w = wh.w;
				this.h = wh.h;
				this.xoff = Math.floor( wh.w/2 );
				this.yoff = Math.floor( wh.h/2 );
			}
		}
		else if( op == "TRIM") {
			icc.trim( null );
		}
		else if( op == "TRIM2") {
			icc.trim( bgcolor );
		}
		else if ( op == "SOFTEN") {
			icc.trimAlfa2();
		}
		else if ( op == "TRIMALFA") {
			icc.trimAlfa(.8);
		}
		else if( op == "FEATHER") {
			icc.feather( fgcolor );
		}
		else if( op == "BGCOLORIZE") {
			icc.colorize( bgcolor );
		}
		else if( op == "COLORIZE") {
			icc.colorize( fgcolor );
			this.colorized = true;
		}
		else if( op == "FIXCOLOR") {
			this.colorized = false;
		}
		else if( op == "BLACKANDWHITE") {
			icc.changeSaturation( 0 );
		}
		else if( op == "SEPIA") {
			icc.changeHue( 35 );
			icc.changeSaturation( 0.7 );
		}
		else if( op == "BLUR") {
			icc.blur();
		}
		else if( op == "MAKETRANSPARENT") {
			icc.makeTransparent();
		}
		else if( op == "ROTATE90DEG") {
			var wh = icc.rotate90Degrees();
			this.w = wh.w;
			this.h = wh.h;
			this.xoff = Math.floor( wh.w/2 );
			this.yoff = Math.floor( wh.h/2 );
		}
		icc = null;

	}

	quickDraw( context, x, y ) {

		context.drawImage( this.canvas, x - this.xoff , y - this.yoff  );

	}

}


class ImageURLBrush extends BareBrush{

	constructor( url, onLoadCallback ) {

		super( 0,0,0,0,null,null );

		this.colorable = false;
		this.mutable   = false;
		this.mode = 'image';
		this.url = url;
		this.img = new Image();
		this.loaded = false;
		var pictureBrush = this;
		var callback = onLoadCallback;

		this.imgonloadFunction = function(){
				var icc = new ImageCanvasContext();

				icc.initFromImage( pictureBrush.img );

				pictureBrush.init( icc.w, icc.h, Math.round( icc.w/2 ), Math.round( icc.h/2), icc.canvas );

				if( callback.method != null ) {
					if( callback.obj != null ) {
						callback.obj[callback.method]();
					}
					else {
						callback.method();
					}
				}
		}

	}




	activateLoadingEvents() {

		this.img.onload = this.imgonloadFunction;
		this.img.src = this.url;

	}

	render() {
	}

}

class GrabBrush extends BareBrush{

	constructor( x1, y1, x2, y2, paintCanvas, _bgColor, area ) {

		var canvas = document.createElement('canvas');

		var w  = Math.abs( x2 - x1 ) + 1;
		var h = Math.abs( y2 - y1 ) + 1;

		var bgColor = _bgColor;

		canvas.width  = w;
		canvas.height  = h;
		canvas.id = AutoBrush_cnt++;

		super( w, h, Math.floor( w/2 ), Math.floor( h/2) , canvas );
		this.colorable = false;
		this.mutable   = true;

		this.context = canvas.getContext('2d');

		this.context.drawImage(
			paintCanvas,
			x1,
			y1,
			w,
			h,
			0,
			0,
			w,
			h
		);

		if ( bgColor != null ) {

			var imageData = this.context.getImageData(0, 0, w, h);

			for (var i=0;i<imageData.data.length;i+=4)
			  {
				  if(imageData.data[i]==bgColor.r &&
					 imageData.data[i+1]==bgColor.g &&
					 imageData.data[i+2]==bgColor.b
				  ){
					  imageData.data[i+3]=0;
				  }
			  }

			this.context.putImageData(imageData,0,0);
		}

		if ( area != null ) {
			var imageData = this.context.getImageData(0, 0, w, h);

			for( var ax=x1 ; ax<=x2 ; ax++ ) {
	      for( var ay=y1 ; ay<=y2 ; ay++ ) {
	        var aoffset, acurrent, coffset;

	        aoffset = ax + (ay * area.w);
					coffset = (( ax - area.sx0 ) + ( w * ( ay - area.sy0 ))) * 4;

	        acurrent = area.pixels.getBit( aoffset ) > 0

	        if( !acurrent ) {
	            imageData.data[ coffset + 0 ] = 0;
	            imageData.data[ coffset + 1 ] = 0;
			        imageData.data[ coffset + 2 ] = 0;
							imageData.data[ coffset + 3 ] = 0;
	        }
					else {
						//imageData.data[ coffset + 1 ]=255;
					}
	      }
	    }

			this.context.putImageData(imageData,0,0);

			bgColor = { r:0, g:0, b:0 }
		}

		this.bgColor = bgColor;
		this.mode = 'grab';

	}


//	clone() {
//		return new GrabBrush( 0, 0, this.w-1, this.h-1, this.canvas, this.bgColor );
//	}

	render() {
	}
}

class AutoBrush extends BareBrush {

	constructor( w, h, bForm, paintColor ) {

		var canvas = document.createElement('canvas');
		canvas.width  = w;
		canvas.height = h;
		canvas.id = AutoBrush_cnt++;

		super( w, h, Math.floor( w/2 ), Math.floor( h/2) , canvas );
		this.colorable = true;
		this.mutable   = false;

		this.context = canvas.getContext('2d');
		this.imData = this.context.createImageData( w, h);

		this.brushForm = bForm;
		this.paintColor = paintColor;

		this.mode = 'auto';


		this.render();

	}


	transform( op ) {
	}

	render() {

		var rowoffset = this.w * 4;
		var d  = this.imData.data;
		var paintColor = this.paintColor;

		switch( this.brushForm )
		{
			case "rect":

				var xoffset = 0;
				var yoffset = 0;

				var offset;

				for (var y = 0; y < this.h; y++) {

					xoffset = 0;

					dmCMU.imdLineRaw( d, yoffset, this.w, paintColor.r, paintColor.g, paintColor.b, paintColor.a );

					yoffset += rowoffset;
				}
			break;


			case "oval":

				var xoffset = 0;
				var yoffset = 0;
				var yoffset0;
				var offset;
				var y;
				var x;
				var i;

				//clear
				for (y = 0; y < this.h; y++) {
					xoffset = 0;
					dmCMU.imdLineRaw( d, yoffset, this.w, 0, 0, 0, 0 );
					yoffset += rowoffset;
				}


				var w2 = Math.round( this.w / 2 );
				var h2 = Math.round( this.h / 2 );
				var w2offset = Math.round(w2-1) * 4;
				var h2offset = Math.round(h2) * rowoffset;

				for (i = 0; i <= 90; i += 1) {

					var angle = (i * Math.PI / 180);

					y = Math.round( Math.cos(angle) * (h2-1) );
					x = Math.round( Math.sin(angle) * (w2) );

					yoffset0 = rowoffset * (y+1);
					yoffset  = rowoffset * (y-1);


					//left half
					xoffset = (w2 - x) * 4;
					dmCMU.imdLineRaw( d, (-yoffset0) + h2offset + xoffset  , x, paintColor.r, paintColor.g, paintColor.b, paintColor.a );
					dmCMU.imdLineRaw( d, yoffset    +  h2offset + xoffset  , x, paintColor.r, paintColor.g, paintColor.b, paintColor.a );

					//right half
					dmCMU.imdLineRaw( d, (-yoffset0) + h2offset + w2offset  , x, paintColor.r, paintColor.g, paintColor.b, paintColor.a );
					dmCMU.imdLineRaw( d, yoffset + h2offset + w2offset  , x, paintColor.r, paintColor.g, paintColor.b, paintColor.a );

				}
			break;
			case "softoval":

				var xoffset = 0;
				var yoffset = 0;
				var yoffset0;
				var offset;
				var y;
				var x;
				var i;

				//clear
				for (y = 0; y < this.h; y++) {
					xoffset = 0;
					dmCMU.imdLineRaw( d, yoffset, this.w, 0, 0, 0, 0 );
					yoffset += rowoffset;
				}


				var w2 = Math.round( this.w / 2 );
				var h2 = Math.round( this.h / 2 );
				var w2offset = Math.round(w2-1) * 4;
				var h2offset = Math.round(h2) * rowoffset;

				for (i = 0; i <= 90; i += 1) {

					var angle = (i * Math.PI / 180);

					y = Math.round( Math.cos(angle) * (h2-1) );
					x = Math.round( Math.sin(angle) * (w2) );

					yoffset0 = rowoffset * (y+1);
					yoffset  = rowoffset * (y-1);

					//left half
					xoffset = (w2 - x) * 4;
					dmCMU.imdLineRaw( d, (-yoffset0) + h2offset + xoffset  , x, paintColor.r, paintColor.g, paintColor.b, 255 );
					dmCMU.imdLineRaw( d, yoffset    +  h2offset + xoffset  , x, paintColor.r, paintColor.g, paintColor.b, 255 );

					//right half
					dmCMU.imdLineRaw( d, (-yoffset0) + h2offset + w2offset  , x, paintColor.r, paintColor.g, paintColor.b, 255 );
					dmCMU.imdLineRaw( d, yoffset + h2offset + w2offset  , x, paintColor.r, paintColor.g, paintColor.b, 255 );

				}

				xoffset = 0;
				yoffset = 0;
				for (x = 0; x < this.w; x++) {
					yoffset = 0;
					for (y = 0; y < this.h; y++) {
						offset = xoffset + yoffset;
						var value = d[ offset + 3];
						if( value > 0) {
							var xd = Math.abs( w2 - x);
							var yd = Math.abs( h2 - y);

							var dist = Math.sqrt( xd*xd + yd*yd );

							var maxd = w2;
							if( maxd < h2 ) {
								maxd = h2;
							}

							var f = (1-(dist / maxd)) * .2;
							var t = Math.floor( f * 255);

							d[ offset + 3 ] = t;

						}

						yoffset += rowoffset;
					}
					xoffset += 4;
				}
			break;
		}

		this.context.putImageData( this.imData, 0, 0);

	}

	softLine( x0, x1, h, r, g, b, sign ) {

	}
}

class paintColor {

    constructor( r,g,b,a ) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	set( r,g,b,a ) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	getHTML() {

		return "rgba("+ this.r +", "+ this.g +", "+ this.b +", 1)";
	}

	getHTMLTransp( transparency ) {

		return "rgba("+ this.r +", "+ this.g +", "+ this.b +", " + transparency + ")";
	}

}
