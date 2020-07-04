class UndoStack {

    constructor() {
		this.stack = [];
		this.redoStack = [];
		this.nameCount = 0;
		this.undoSize = 0;
		this.redoSize = 0;
	}

	getSize() {
		return ( this.undoSize + this.redoSize );
	}

	grabScreenPart( name, srcCanvas, x, y, w, h ) {

		var partCanvas = document.createElement('canvas');

		partCanvas.id     = "undo" + this.stack.length + "_" + name ;
		partCanvas.width  = w;
		partCanvas.height = h;

		var destCanvasContext = partCanvas.getContext('2d');

		destCanvasContext.drawImage(srcCanvas, x, y, w, h, 0, 0, w, h);

		var el = {
			x: x,
			y: y,
			canvas: partCanvas
		}

		return el;
	}

	save( name, srcCanvas, x, y, w, h ) {
    console.log("save " + x + "," + y + "," + w + "," + h);
		var el = this.grabScreenPart( name, srcCanvas, x, y, w, h );

		this.stack.push( el );

		var size = 0;
		console.log( "undo stack " + this.stack.length );
		for (var i = 0; i < this.stack.length; i++ ) {
			var el = this.stack[ i ];
			size += (el.canvas.width * el.canvas.height * 4);

			console.log( "stack["+i+"]=" + el.canvas.width + "," + el.canvas.height  );

		}

		this.undoSize = size;
		console.log( "undo stack content size " + Math.floor(size / (1024*1024)) + "MB" );

	}

	undo( buffers ) {

		if( this.stack.length > 0 ) {
			var el = this.stack.pop();

			var elRedo = this.grabScreenPart(
				"redo" + this.nameCount++, buffers.paintCanvas,
				el.x, el.y, el.canvas.width, el.canvas.height );

			this.redoStack.push( elRedo );
			console.log("redoStack size: " + this.redoStack.length );

			buffers.paintContext.drawImage(el.canvas, el.x, el.y );
		}
		else {
			console.log("Undo, nothing to undo");
		}
	}

	redo( buffers, callbackCalculateDelta ) {

		if( this.redoStack.length > 0 ) {
			var el = this.redoStack.pop();
			console.log("redoStack size: " + this.redoStack.length );
			console.log("REDO");
			console.log( el );

			this.bufferForUndo( buffers );
			console.log("redoStack size: " + this.redoStack.length );
			buffers.paintContext.drawImage(el.canvas, el.x, el.y );

			var fc = callbackCalculateDelta;
			var delta = fc.obj[ fc.method ]( buffers );

			this.intSaveUndoSmart( buffers, delta, "redo" + this.nameCount++, false );

			console.log("redoStack size: " + this.redoStack.length );
		}
		else {
			console.log("Redo, nothing to redo");
		}
	}

	clear() {

		this.stack = [];
		this.redoStack = [];
		this.nameCount = 0;
	}

	last() {
		if( this.stack.length > 0 ) {
			return this.stack[ this.stack.length - 1 ];
		}
		return null;
	}


	bufferForUndo( buffers ) {
		console.log( "buffer paintcanvas for undo" );

		var imgData = buffers.paintContext.getImageData( 0,0, buffers.paintCanvas.width, buffers.paintCanvas.height );

		//buffers.paintContextBuffer.drawImage( buffers.paintCanvas, 0 , 0 );

		buffers.paintContextBuffer.putImageData(imgData, 0, 0 );
	}


	saveUndoSmart(  buffers, delta , name ) {
		console.log("saveUndoSmart!");
		this.intSaveUndoSmart( buffers, delta, name, true );

	}


	intSaveUndoSmart( buffers, delta, name, flushRedo ) {

		var sameY0 = -1;
		var sameY1 = -1;
		var same = null;

		if( flushRedo == true ) {
			this.redoStack = [];
		}

		this.save( name, buffers.paintCanvasBuffer, delta.X0, delta.Y0, delta.X1 - delta.X0, delta.Y1 - delta.Y0  );

		console.log("saveUndoSmartX:" + delta.X0 + ',' + delta.X1);
	}





}
