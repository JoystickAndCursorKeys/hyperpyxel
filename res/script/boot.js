function __fBootPreventDefault( event ) {
	return event.preventDefault();
}

class Boot {


	lockRMB() {
		document.addEventListener('contextmenu', __fBootPreventDefault );
	}

	releaseRMB() {
		document.removeEventListener('contextmenu', __fBootPreventDefault );
	}

	constructor ( _renderCanvasId, _Loader, _Saver, _SCRW, _SCRH ) {

		/* Prevent reload, without confirmation */
		window.onbeforeunload = function() {
  		return "";
		}

		this.lockRMB();

		var constants = {};

		constants.initialImageName = "untitled";

		this.renderCanvasId = _renderCanvasId;
		this.renderCanvas = document.getElementById( _renderCanvasId );

		this.renderCanvas.style.touchAction = "none";

		this.renderCanvas.id     = "ApplicationCanvas";
		this.SCRW = _SCRW;
		this.SCRH = _SCRH;

		this.sizeCanvas( this.SCRW, this.SCRH );
		this.renderContext = this.renderCanvas.getContext('2d');

		this.bus = new AppEventBus();
		this.agents = [];

		/* Agents not connected to browser layer */
		this.agents['agentPanels'] 		= new PanelsAgent( this.bus, constants,  this.SCRW, this.SCRH, 0 );
		this.agents['agentPaint'] 		= new PaintAgent( this.bus, constants, this.SCRW, this.SCRH,  1 );

		/* Build agents and self register them on the bus */
		/* Agents connected to browser layer */

		this.updateComponents = [];
		this.updateComponents[0] = this.agents['agentPaint'];
		this.updateComponents[1] = this.agents['agentPanels'];

		this.agents['agentScreenUpdater']	= new ScreenUpdaterAgent( this.bus, this.renderCanvas, this.updateComponents );
		this.agents['agentInputFocus']		= new InputFocusAgent( this.bus, this.SCRW, this.SCRH, this.agents['agentPaint'], this.agents['agentPanels'] );

		var iphId = this.agents['agentInputFocus'].getId();
		this.agents['agentKeyboard'] 		= new KeyboardAgent(	this.bus, this.renderCanvas, iphId );
		this.agents['agentMouse'] 			= new MouseAgent( 		this.bus, this.renderCanvas, this.SCRW, this.SCRH, iphId );


		var paintAgent = this.agents['agentPaint'];
		this.agents['agentImportExport']	= new ImportExportAgent(
					this.bus,
					_Loader,
					_Saver);


		/* Activate all agents */
		for (var name in this.agents ) {
			this.agents[name].activate();
		}

	}

	sizeCanvas( w, h )
	{

		this.renderCanvas.width  = w;
		this.renderCanvas.height = h;

	}
}
