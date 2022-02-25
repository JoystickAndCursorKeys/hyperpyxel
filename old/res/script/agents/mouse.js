class MouseAgent {

	getId() {
		return 'Mouse';
	}

    constructor( _bus, _renderCanvas, _SCRW, _SCRH, _inputHandlerId  ) {

		this.bus = _bus;
		this.renderCanvas = _renderCanvas;
		this.fullScreenFlag = false;
		this.SCRW = _SCRW;
		this.SCRH = _SCRH;
		this.inputHandlerId = _inputHandlerId;
		this.buttonId = 'left';

		/* Build */
		this.msMap1 = [];
		var msMap1 = this.msMap1;
		msMap1['mouseenter'] =  [ 'BROWSMOUSE', 	'ENTER' 	];
		msMap1['click'] 	=  	[ 'BROWSMOUSE',  	'CLICK'		];
		msMap1['mousedown'] =  	[ 'BROWSMOUSE', 	'DOWN' 		];
		msMap1['mouseup'] 	=  	[ 'BROWSMOUSE', 	'UP' 		];
		msMap1['mousemove'] =  	[ 'BROWSMOUSE', 	'MOVE' 		];
		msMap1['mouseenter'] =  [ 'BROWSMOUSE', 	'ENTER' 	];
		msMap1['pointerdown'] =  	[ 'BROWSMOUSE', 	'DOWN' 		];
		msMap1['pointerup'] 	=  	[ 'BROWSMOUSE', 	'UP' 		];
		msMap1['pointermove'] =  	[ 'BROWSMOUSE', 	'MOVE' 		];
		msMap1['pointerenter'] =  	[ 'BROWSMOUSE', 	'ENTER' 		];

		/* Self register */
		this.bus.register( this, [], '*' );

	}

	activate() {

		//https://stackoverflow.com/questions/2405771/is-right-click-a-javascript-event


		this.renderCanvas.addEventListener('click',     this, false);
	//	this.renderCanvas.addEventListener('mousedown', this, false);
	//	this.renderCanvas.addEventListener('mouseup',   this, false);
	//	this.renderCanvas.addEventListener('mousemove',   this, false);
		//this.renderCanvas.addEventListener('mouseenter',   this, false);

	  this.renderCanvas.addEventListener('pointerdown', this, false);
		this.renderCanvas.addEventListener('pointerup',   this, false);
		this.renderCanvas.addEventListener('pointermove',   this, false);
		this.renderCanvas.addEventListener('pointerenter',   this, false);

		this.buttonId = 'none';

	}

	/* App events */
	handleInputSignal( sig ) {
		/* Nothing Here, Input only from browser, see handleEvent */
	}

	/* Browser events */
	handleEvent(evt) {

		var sig0 = this.msMap1[ evt.type ];
		if( sig0 == undefined ) {
		  return;
		}

		//console.log(evt.type + ":pid-" + evt.pointerId );
		//console.log(evt);

		var sig = {};
		sig[0] = sig0[0];
		sig[1] = sig0[1];
		sig.data = sig0.data;
		sig.destination = sig0.destination;



		var data = {};
		var pos = dmCMU.getCanvasPosition( evt , this.renderCanvas, this.fullScreenFlag, this.SCRW, this.SCRH );

/*
		if( evt.type == 'mousedown' || evt.type == 'mouseup' || evt.type == 'click' || evt.type == 'mousemove' || evt.type == 'mouseenter')
		{

			if( evt.which == 3 ) {

				this.buttonId = 'right';
			}
			else if( evt.which == 1 ) {

				this.buttonId = 'left';
			}
		}
*/

		if( evt.type == 'pointerenter' ) {
			this.buttonId = "none";
		}

		if( evt.type == 'pointerdown' || evt.type == 'pointerup')  // || evt.type == 'pointermove'
		{

			if( evt.which == 3 ) {

				this.buttonId = 'right';
			}
			else if( evt.which == 1 ) {

				this.buttonId = 'left';
			}
		}

		//console.log( this.buttonId );

		data.appPos = pos;
		data.buttonId = this.buttonId;
		sig.data = data;
		sig.destination = this.inputHandlerId;

		this.bus.post( sig );

		if( evt.type == 'pointerup' ) {
			this.buttonId = 'none'
		}
	}
}
