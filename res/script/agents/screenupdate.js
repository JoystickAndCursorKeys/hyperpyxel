class ScreenUpdaterAgent  {

	getId() {
		return 'ScreenUpdater';
	}


		setCanvas( _renderCanvas ) {
			this.renderCanvas = _renderCanvas;
			this.renderContext =
				_renderCanvas.getContext('2d',
					{
						alpha: false,
						desynchronized: true
					}
				);
		}

    constructor( _bus, _renderCanvas, _updateComponents ) {

		this.bus = _bus;
		this.setCanvas( _renderCanvas );
		this.updateComponents = _updateComponents;

		/* Self register */
		this.bus.register( this, ['SCREENUPDATER'], '*' );

	}

	activate() {
	}

	/* App events */
	handleInputSignal( sig ) {
		/* Nothing Here, Input only from browser, see handleEvent */

		//console.log( "sig=" + sig[0] + ":" + sig[1]);

		if( sig[ 0 ] == "SCREENUPDATER" && sig[ 1 ] == "REFRESH" ) {
			//console.log( "DO REFRESH" );

			for( var i=0; i< this.updateComponents.length; i++ ) {
				var uc = this.updateComponents[ i ];

				uc.render( this.renderContext, null );
			}
		}
		else if( sig[ 0 ] == "SCREENUPDATER" && sig[ 1 ] == "BUSYMOUSEPOINTER" ) {
			console.log("WAIT POINTER....");
			this.renderCanvas.style.cursor = "wait"
		}
		else if( sig[ 0 ] == "SCREENUPDATER" && sig[ 1 ] == "PAINTMOUSEPOINTER" ) {
			this.renderCanvas.style.cursor = "url('res/img/pointer/main3.png') 10 10, auto"
		}
		else if( sig[ 0 ] == "SCREENUPDATER" && sig[ 1 ] == "GRABPOINTER" ) {
			this.renderCanvas.style.cursor = "copy"
		}
		else if( sig[ 0 ] == "SCREENUPDATER" && sig[ 1 ] == "ZOOMPOINTER" ) {
			//this.renderCanvas.style.cursor = "zoom-in"
			this.renderCanvas.style.cursor = "url('res/img/pointer/magnify.png') 11 12, auto"
		}
		else if( sig[ 0 ] == "SCREENUPDATER" && sig[ 1 ] == "PICKERPOINTER" ) {
			this.renderCanvas.style.cursor = "copy"
		}
		else if( sig[ 0 ] == "SCREENUPDATER" && sig[ 1 ] == "FILLPOINTER" ) {
			this.renderCanvas.style.cursor = "url('res/img/pointer/fill.png') 2 24, auto"
		}
	}

	/* Browser events */
	handleEvent(evt) {
	}
}
