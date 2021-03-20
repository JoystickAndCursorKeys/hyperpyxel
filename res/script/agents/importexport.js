class ImgUploader {

	constructor ( _bus ) {
		this.bus = _bus;
	}

	handleEvent(evt) {
		console.log("handleEvent " + evt.type);
		switch(evt.type) {
		case "change":
			console.log("--------------handle upload event");
			console.log(evt);
			this.handleUpload( evt );

		break;
		}
	}

	handleUpload(e){

		var reader = new FileReader();
		var BUS = this.bus;

		var thisFileName = e.target.files[0].name;
		var isBrush = this.isBrush;

		reader.onload = function(event){

			console.log("reader onload " + thisFileName);

			var img = new Image();

			img.onload = function(){


				console.log("image onload ");

				var sig = [];
				sig[0] = "PAINT";
				if( !isBrush ) {
					sig[1] = "IMPORTIMAGE";
				}
				else {
					sig[1] = "IMPORTBRUSH";
				}

				sig.data = { img: img, name: thisFileName };
				BUS.post( sig );

			}

			console.log( event.target.result );
			img.src = event.target.result;
		}

		console.log("read " + e.target.files[0]);
		console.log(e.target.files[0]);
		reader.readAsDataURL(e.target.files[0]); //this is the original

		//reader.readAsArrayBuffer(e.target.files[0]); //petscii
	}

}




class ImportExportAgent  {

	getId() {
		return 'ImportExport';
	}

    constructor( _bus, _imageLoader, _imageSaver ) {

		this.bus = _bus;
		this.imageLoader = _imageLoader;
		this.imageSaver = _imageSaver;
		this.imgUploader = new ImgUploader( _bus );
		this.clipBoardImporter = new CLIPBOARD_CLASS(true, _bus);

		/* Self register */
		this.bus.register( this, ['IMPORT','EXPORT'], '*' );

	}

	activate() {
	}

	/* App events */
	handleInputSignal( sig ) {
		console.log( "importexport got signal " + sig[0]);
		if( sig[ 0 ] == 'IMPORT' ) {

			switch( sig[ 1 ] ) {
				case 'LOAD':
					this.load();
					break;
				case 'LOADBRUSH':
					this.loadBrush();
					break;
			}
		}
		else if( sig[ 0 ] == 'EXPORT' ) {

			switch( sig[ 1 ] ) {
				case 'SAVE':
					this.save( sig.data.canvas, sig.data.options, sig.data.name );
				break;
				case 'PRINT':
					this.print( sig.data.canvas, sig.data.options, sig.data.name  );
				break;
			}
		}
	}

	/* Browser events */
	handleEvent(evt) {
	}

	downloadURI(uri, name) {

		  var link = document.getElementById( this.imageSaver );

		  link.download = name;
		  link.href = uri;
		  link.click();
		  //https://stackoverflow.com/questions/8863940/how-to-force-chrome-display-a-save-as-dialog-when-i-click-a-download-link
		  //http://danml.com/download.html


	}

	dataPresentation( byte, format ) {
		if( format == 'decimal' ) {
			return byte;
		}
		else if( format == 'hexadecimal' ) {
			var hex = byte.toString( 16 );
			if (hex.length < 2) {
				hex = "0" + hex;
			}
			return "$" + hex;
		}
		return "?undefined?" + byte
	}


	print( _canvas, options ) {
		var sourceCanvas = _canvas;

		var gridW, gridH;
		gridW = options.coordinates.tilesW;
		gridH = options.coordinates.tilesH;
		var row = options.datastart;

		console.log( "print", options)
		var bytes = "";


		if( options.exportdatatype == 'basic+comment' ) {
				bytes = row +" REM PUT YOUR COMMENT HERE";
				row += options.datastep;

		}

		//for( var i = 0; i<data.length; i+=4 ) {
		for( var xi=options.coordinates.range.scolix ; xi<=options.coordinates.range.ecolix ; xi++ ) {

			var colIx = xi;
			var rowIx = options.coordinates.range.srowix;


			if( options.mode == '1bpp' ) {
				var sdbg=1;

				var copy = new ImageCanvasContext();
				copy.initNewCanvas( gridW, gridH );

				//grab the context from your destination canvas
				var destCtx = copy.context;


				//void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
				var xoff, yoff;

				xoff = colIx * gridW;
				yoff = rowIx * gridH;

				destCtx.drawImage( sourceCanvas,
					xoff, yoff, gridW, gridH, 0, 0, gridW, gridH );

				var data = copy.getCopyAllData().data;

				var byte = 0; var bitval=1; var bitval2=128;

				var newline = true;
				var lineCnt =0;

				var maxOnLine = 21;
				for( var i = 0; i<data.length; i+=4 ) {

					//if( ( data[ i ] + data [ i + 1 ] + data[ i + 2] ) > 0 ) {
					//	byte += bitval2;
					//}
					if( options.isOpaqueFunction( data[ i ], data [ i + 1 ], data[ i + 2] )  ) {
						byte += bitval2;
					}

					bitval *=2;
					bitval2 = bitval2 / 2;
					if( bitval > 128 ) {
						bitval = 1;
						bitval2 = 128;
						if( !newline ) {
							bytes = bytes + ", ";
						}
						else {
							bytes = bytes + "\n" + row + " data ";
							row += options.datastep;
							newline = false;
						}
						bytes = bytes + this.dataPresentation( byte, options.exportdatapresentation );
						byte = 0;
						lineCnt++;
						newline = false;
						if( lineCnt >= maxOnLine){
							lineCnt=0;
							newline = true;
						}
					}
				}
				var edbg=1;
			}
			else if( options.mode == '4bpp' ) {

				var copy = new ImageCanvasContext();
				copy.initNewCanvas( gridW, gridH );

				var colorPalette = options.colorPalette;

				//grab the context from your destination canvas
				var destCtx = copy.context;


				//void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
				var xoff, yoff;

				xoff = colIx * gridW;
				yoff = rowIx * gridH;

				destCtx.drawImage( sourceCanvas,
					xoff, yoff, gridW, gridH, 0, 0, gridW, gridH );

				var data = copy.getCopyAllData().data;

				var byte = 0; var bitval=1; var bitval2=128;

				var newline = true;
				var lineCnt =0;
				var maxOnLine = 8;
				for( var i = 0; i<data.length; i+=8 ) {

					//if( ( data[ i ] + data [ i + 1 ] + data[ i + 2] ) > 0 ) {
					//	byte += bitval2;
					//}
					var highNibble = options.getColorIndexFunction( data[ i ], data [ i + 1 ], data[ i + 2] , colorPalette)  ;
					var lowNibble = options.getColorIndexFunction( data[ i + 4 ], data [ i + 4 + 1 ], data[ i + 4 + 2] , colorPalette );
					byte = lowNibble + (highNibble * 16);

					if( !newline ) {
							bytes = bytes + ", ";
					}
					else {
							bytes = bytes + "\n" + row + " DATA ";
							row += options.datastep;
							newline = false;
					}

					bytes = bytes + this.dataPresentation( byte, options.exportdatapresentation );
					lineCnt++;
					newline = false;
					if( lineCnt >= maxOnLine){
						lineCnt=0;
						newline = true;
					}
				}
			}
		}
		var imageTxtOut = document.getElementById( "exporttxt" ); //this.imageLoader );
		var imageTxtOutData = document.getElementById( "exporttxtdata" ); //this.imageLoader );
		imageTxtOut.removeAttribute("hidden");
		imageTxtOutData.value = bytes;

		booter.releaseRMB();
	}


	save( _canvas, options, _name ) {
		var canvas = _canvas;

		if( options.transparency == 'background' ) {
			var orig = new ImageCanvasContext();
			orig.initWithCanvasOnly( canvas );
			var clone = orig.copy();
			clone.makeTransparentMaskFromColor( options.bgcolor );

			canvas = clone.canvas;
		}

		if( canvas.msToBlob !== undefined) {

			console.log("save to blob");
			var blob = canvas.msToBlob();
			window.navigator.msSaveBlob(blob, _name );

		}
		else {

			console.log("save to data url");
			var url = canvas.toDataURL("image/png");
			this.downloadURI( url, _name );
		}

	}


	load() {

		//var ImgUploader = this.imgUploader;
		var imageLoader = document.getElementById( this.imageLoader );
		this.imgUploader.isBrush = false;

		console.log( imageLoader );
		imageLoader.addEventListener('change', this.imgUploader, true);
		imageLoader.click();
		console.log( "clicked" );

	}

	loadBrush() {

		console.log("loadbrush");
		//var ImgUploader = this.imgUploader;
		var imageLoader = document.getElementById( this.imageLoader );
		this.imgUploader.isBrush = true;

		console.log( imageLoader );
		imageLoader.addEventListener('change', this.imgUploader, true);
		imageLoader.click();
		console.log( "clicked" );

	}

}


function CLIPBOARD_CLASS( autoresize, _bus ) {
	var _self = this;
	this.bus = _bus;
	//var canvas = document.getElementById(canvas_id);
	//var ctx = document.getElementById(canvas_id).getContext("2d");

	//handlers
	document.addEventListener('paste', function (e) { _self.paste_auto(e); }, false);

	//on paste
	this.paste_auto = function (e) {
		//console.log("PASTE!");
		console.log( e );
		//console.log( e.clipboardData.getData( "application/octet-stream" ) );

		if (e.clipboardData) {
			var items = e.clipboardData.items;
			if (!items) return;

			//access data directly
			var is_image = false;
			for (var i = 0; i < items.length; i++) {
				console.log( items );
				if (items[i].type.indexOf("image") !== -1) {
					//image
					var blob = items[i].getAsFile();
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);
					this.paste_createImage(source);
					is_image = true;
				}
			}
			if(is_image == true){
				e.preventDefault();
			}
		}
	};
	//draw pasted image to canvas

	var BUS = this.bus;
	this.paste_createImage = function (source) {
		var pastedImage = new Image();
		pastedImage.onload = function () {

			console.log("image onPaste " + pastedImage.src );

			var sig = [];
			sig[0] = "PAINT";
			sig[1] = "IMPORTIMAGE";
			sig.data = { img: pastedImage, name: 'copy-paster.png' };
			BUS.post( sig );

		};
		pastedImage.src = source;
	};
}
