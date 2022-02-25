

class KeyboardAgent {

	getId() {
		return 'Keyboard';
	}

	constructor( _bus, _renderCanvas, _inputHandlerId ) {

		//Checkout -> for ctrl-keys -> https://stackoverflow.com/questions/2903991/how-to-detect-ctrlv-ctrlc-using-javascript

		this.bus = _bus;
		this.renderCanvas = _renderCanvas;
		this.inputHandlerId = _inputHandlerId;

		/* Self register */
		this.bus.register( this, [], '*' );

	}

	activate() {

		//this.renderCanvas.addEventListener("keypress", this, true); /* Disabled */
		this.renderCanvas.addEventListener("keyup", this, true);

	}

	/* App events */
	handleInputSignal( sig ) {
		/* Nothing Here, Input only from browser, see handleEvent */
	}

	/* Browser events */
	handleEvent(evt) {
	  //console.log("kk=" + evt.keyCode);

	  switch(evt.type) {
	  case 'keyup':

			if( evt.keyCode == 17 ) {
				return;
			}
			var keyString = evt.key;
			var keyString2 = evt.code;
			var prefix = "";
			if( evt.ctrlKey ) {
				prefix = "CTRL-";
			}
			if( evt.shiftKey ) {
				prefix = "SHIFT-";// + keyString.toLowerCase();
			}

			if( this.isAlphabeticChar( keyString )  ) {
				keyString = prefix + keyString.toLowerCase();
			}

			keyString2 = prefix + keyString2;

			var sig2 = {0: 'BROWSKEYBOARD', 1: keyString, data: {} };
			sig2.data.code = keyString2;
			sig2.destination = this.inputHandlerId;
			this.bus.post( sig2 );

		break;

	  default:
		return;
	  }
	}

	isAlphabeticChar( x ) {
		var lc = x.toLowerCase();
		var uc = x.toUpperCase();
		if( lc != x || uc != x /* is ALPHA */) {
			return true;
		}
		return false;
	}

}
