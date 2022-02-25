class DM_CommonMiscellaneousUtilities  {

	//cutls_
	constructor() {
	}

	getCanvasPosition(event, canvas, fullscreen, screenw, screenh)
	{

		//console.log("getCanvasPosition:" + event.pageX +","+ event.pageY+ " fs="+fullscreen);

		if( fullscreen && false) {
			//console.log("fs");
			return [ event.pageX, event.pageY ];
		}
		else {

			var totalOffsetX = 0;
			var totalOffsetY = 0;
			var canvasX = 0;
			var canvasY = 0;
			var currentElement = canvas;

			do{
				totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
				totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
			}
			while(currentElement = currentElement.offsetParent)

			canvasX = event.pageX - totalOffsetX;
			canvasY = event.pageY - totalOffsetY;

			return [canvasX,canvasY];
		}
	}

	rect( context, x, y , w , h, style, size )
	{
			var oldAlpha = context.globalAlpha;
			var oldFStyle = context.fillStyle;
			var sizeModifier = size - 1;

			context.globalAlpha = 1.0;
			context.fillStyle = style;

			context.fillRect(x, y , w, 1+sizeModifier );
			context.fillRect(x, y + h - (1 + sizeModifier) , w, 1+sizeModifier );
			context.fillRect(x, y , 1+sizeModifier, h );
			context.fillRect(x + w - (1 + sizeModifier), y , 1+sizeModifier, h );

			context.fillStyle = oldFStyle;
			context.globalAlpha = oldAlpha;
	}


	imdLineRaw( dstData, offset0, w, r, g, b, a )
	{
		var offset = offset0;
		for (var x = 0; x < w; x++) {

			dstData[ offset + 0] = r;
			dstData[ offset + 1] = g;
			dstData[ offset + 2] = b;
			dstData[ offset + 3] = a;
			offset += 4;

		}
	}

	fullScreen( thisElement ){

		if (thisElement.requestFullscreen) {
			console.log( "enter FS1");
			thisElement.requestFullscreen();
		}
		else if (thisElement.mozRequestFullScreen) {
			console.log( "enter FS2");
			thisElement.mozRequestFullScreen();
		}
		else if (thisElement.webkitRequestFullScreen) {
			console.log( "enter FS3");
			thisElement.webkitRequestFullScreen();
		}
		else if (thisElement.msRequestFullscreen) {
			console.log( "enter FS4");
			thisElement.msRequestFullscreen();
		}
	}

	cancelFullScreen( thisElement ){

		console.log( thisElement );
		if (thisElement.exitFullscreen) {
			console.log( "exit FS1");
			thisElement.exitFullscreen();
		}
		else if (thisElement.mozCancelFullScreen) {
			console.log( "exit FS2");
			thisElement.mozCancelFullScreen();
		}
		else if (thisElement.webkitCancelFullScreen) {
			console.log( "exit FS3");
			thisElement.webkitCancelFullScreen();
		}
		else if (thisElement.msExitFullscreen) {
			console.log( "exit FS4");
			thisElement.msExitFullscreen();
		}
	}



    findGetParameter(parameterName) {
		var result = null,
		tmp = [];
		var items = location.search.substr(1).split("&");
		for (var index = 0; index < items.length; index++) {
		tmp = items[index].split("=");
		if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
		}
		return result;
	}
}
