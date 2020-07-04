class DeltaCalculator {

	calculate( buffers ) {

		var sameY0 = -1;
		var sameY1 = -1;
		var same = null;


		for( var y = 0; y < buffers.paintCanvas.height; y++ ) {

			same = this.compareBufferYLine( buffers, y , buffers.paintCanvas.width );

			if( same == true ) {
				sameY0 = y;
			}
			else {
				if( sameY0 == -1 ) {
					sameY0 = 0;
				}
				break;
			}

		}

		if( sameY0 == buffers.paintCanvas.height-1 ) { console.log( "no changes detected" ); return null; }

		console.log("saveUndoSmartY0:" + sameY0 );

		for( var y = buffers.paintCanvas.height -1 ; y >= 0 ; y-- ) {

			same = this.compareBufferYLine( buffers, y , buffers.paintCanvas.width );

			if( same == true ) {
				sameY1 = y;
			}
			else {
				if( sameY1 == -1 ) {
					sameY1 = buffers.paintCanvas.height; /*plus 1, due to usage to calculate H only in undoStack.save*/
				}
				break;
			}

		}

		console.log("saveUndoSmartY:" + sameY0 + ',' + sameY1);

		var sameX0 = -1;
		var sameX1 = -1;

		for( var x = 0; x < buffers.paintCanvas.width; x++ ) {

			same = this.compareBufferXLine( buffers, x , sameY0, sameY1 );

			if( same == true ) {
				sameX0 = x;
			}
			else {
				if( sameX0 == -1 ) {
					sameX0 = 0;
				}
				break;
			}

		}

		for( var x = buffers.paintCanvas.width -1 ; x >= 0 ; x-- ) {

			same = this.compareBufferXLine( buffers, x , sameY0, sameY1 );

			if( same == true ) {
				sameX1 = x;
			}
			else {
				if( sameX1 == -1 ) {
					sameX1 = buffers.paintCanvas.width ; /*plus 1, due to usage to calculate W only in undoStack.save*/
				}
				break;
			}
		}

	return(
			{
				X0: sameX0,
				Y0:	sameY0,
				X1: sameX1,
				Y1: sameY1
			}
		);

	}

	compareBufferYLine( buffers, y, w ) {

		var paintData = buffers.paintContext.getImageData(0, y, w, 1).data;
		var paintBufData = buffers.paintContextBuffer.getImageData(0, y, w, 1).data;

		for( var i = 0; i< paintData.length ; i++ ) {
			if( paintData[ i] !=  paintBufData[ i ] ) {
				return false;
			}
		}

		return true;

	}


	compareBufferXLine( buffers, x, y0, y1 ) {

		var paintData = buffers.paintContext.getImageData(x, y0, 1, y1-y0).data;
		var paintBufData = buffers.paintContextBuffer.getImageData(x, y0, 1, y1-y0).data;

		for( var i = 0; i< paintData.length ; i++ ) {
			if( paintData[ i] !=  paintBufData[ i ] ) {
				return false;
			}
		}

		return true;

	}

}
