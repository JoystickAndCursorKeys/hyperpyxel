class InputFocusAgent {

	getId() {
		return 'InputFocus';
	}

  constructor( _bus, _SCRW, _SCRH, _componentPaint, _componentPanels ) {

		this.keyShortCuts = new ShortCuts().getKeys();
		this.keyLocalizedShortCuts = new ShortCuts().getLocalizedKeys();

		this.bus = _bus;
		this.SCRW = _SCRW;
		this.SCRH = _SCRH;

		this.PANEL_INDEX = 0;
		this.PAINT_INDEX = 1;


		this.componentPanels = _componentPanels;
		this.componentPaint = _componentPaint;
		this.displayComponents = [ _componentPaint, _componentPanels ];

		this.focusMouse = [0, 0];

		this.PrioListOfComponents = [];
		this.PrioListOfComponentsEventDestinations = [];

		for( var  i= 0; i < this.displayComponents.length; i++ ) {
			var prio = this.displayComponents[ i ].getViewPriority();
			this.PrioListOfComponents[ prio ] = this.displayComponents[ i ];
			this.PrioListOfComponentsEventDestinations[ prio ] = this.displayComponents[ i ].getId();
		}

		if( this.PrioListOfComponents[ 0 ] === undefined ) {
			throw "No update component with view priority 0 defined";
		}
		else if( this.PrioListOfComponents[ 1 ] === undefined ) {
			throw "No update component with view priority 1 defined";
		}

		this.panelComponent = this.PrioListOfComponents[ this.PANEL_INDEX ];
		this.paintComponent = this.PrioListOfComponents[ this.PAINT_INDEX ];

		this.panelComponent_DestAddress = this.PrioListOfComponentsEventDestinations[ this.PANEL_INDEX ];
		this.paintComponent_DestAddress = this.PrioListOfComponentsEventDestinations[ this.PAINT_INDEX ];


		/* Self register */
		this.bus.register( this, ['BROWSMOUSE','BROWSKEYBOARD'], '*' );

	}

	activate() {
	}


	/* App events */
	handleInputSignal( sig0 ) {

		this.lastFocusDest = this.focusDest;

	  var inputSignal = false;
	  var sig = {};
	  sig[0] = sig0[0];
	  sig[1] = sig0[1];
	  sig.data = sig0.data;
	  sig.destination = sig0.destination;

	  var keyboard = false;

	  if( sig[ 0 ] == 'BROWSMOUSE' ) {
		  sig[ 0 ] = 'APPMOUSE';

		  inputSignal = true;
		  this.focusMouse = sig.data.appPos;

	  }
	  else if( sig[ 0 ] == 'BROWSKEYBOARD' ) {
		  inputSignal = true;

		  sig[ 0 ] = 'APPKEYBOARD';
		  keyboard = true;

		  if( sig.data.code == 'Space' ) {

				sig[ 0 ] = 'PANEL';
				sig[ 1 ] = 'TOGGLE';
				sig.destination = undefined;

				this.bus.post( sig );

				return;
			}
			else if( sig.data.code == 'Escape' ) {

				sig[ 0 ] = 'PANEL';
				sig[ 1 ] = 'CLOSEDIALOG';
				sig.destination = undefined;

				this.bus.post( sig );

				return;
			}
	  }

	  if( inputSignal ) {

		if( !keyboard ) {
			sig.data.focusPos = this.focusMouse;
		}

		this.focusComponent = this.paintComponent;
		this.focusDest = this.paintComponent_DestAddress;

		if( this.panelComponent.isVisible() ) {

			if( this.panelComponent.isMouseOver( this.focusMouse ) || keyboard ) {

				this.focusComponent = this.panelComponent; //panel
				this.focusDest = this.panelComponent_DestAddress; //panel
			}
		}

		sig.destination = this.focusDest;
		if( keyboard ) {
			sig.destination = this.paintComponent_DestAddress;

			var shortCut = this.keyShortCuts[ sig[1] ];
			if( shortCut ) {
				if( shortCut.destination == undefined ) {
					shortCut.destination = this.paintComponent_DestAddress;
				}

				this.bus.post( shortCut );

				return;
			}

			var locShortCut = this.keyLocalizedShortCuts[ sig.data.code ];
			if( locShortCut ) {
				if( locShortCut.destination == undefined ) {
					locShortCut.destination = this.paintComponent_DestAddress;
				}


				this.bus.post( locShortCut );

				return;
			}

		}

		/* focus swap */
		if( this.focusDest != this.lastFocusDest ) {
			if( this.focusDest == this.panelComponent_DestAddress ) {

				var focusSwapSignal;
				var focusSwapSignal = {};
			  focusSwapSignal[0] = "PAINT";
			  focusSwapSignal[1] = "HIDEBRUSH";
			  focusSwapSignal.data = null;
			  focusSwapSignal.destination = this.paintComponent_DestAddress;

				this.bus.post( focusSwapSignal );
			}
		}


		this.bus.post( sig );
	  }

	}


	/* Browser events */
	handleEvent(evt) {

		/* Nothing Here, Input only from application, see handleInputSignal */

	}
}
