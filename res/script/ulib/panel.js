const PPAINTR_BTYPE_CLICK = 0;
const PPAINTR_BTYPE_TOGGLE = 1;
const PPAINTR_BTYPE_SEPARATOR = 2;
const PPAINTR_BTYPE_INFOAREA = 4;
const PPAINTR_BTYPE_VSLIDER = 8;
const PPAINTR_BTYPE_HSLIDER = 16;
const PPAINTR_BTYPE_TEXT = 32;
const PPAINTR_BTYPE_CUSTOM = 64;
const PPAINTR_BTYPE_HOOK = 99;
const PPAINTR_BSTATE_NORMAL = 0;
const PPAINTR_BSTATE_DOWN = 1;
const PPAINTR_BSTATE_NORENDER = 99;

const SPANEL_ROOT = 1;
const SPANEL_LEFTHALF = 2;
const SPANEL_RIGHTHALF = 4;
const SPANEL_THIRDLEFT = 8;
const SPANEL_THIRDMIDDLE = 16;
const SPANEL_THIRDRIGHT = 32;
const SPANEL_CUSTOM = 128;
const SPANEL_ATTACHED = 256;

const PANEL_LEFTALIGN = -1;
const PANEL_RIGHTALIGN = -2;

const COORD_UNCHANGED = -1;

const PPAINTR_SEPARATOR_CONST_DIST = .2;

var AutoBrush_cnt = 0;

class IconImageStrip {

	constructor( url, gridw, gridh, pixel0Transparency, notifyLoaded ) {

			this.buttons = [];
			this.url = url;
			this.img = new Image();


			this.gridw = gridw;
			this.gridh = gridh;

			var thisIconImage = this;

			this.loaded = false;

			this.iconsCanvas = [];
			this.iconsContext = [];

			this.notifyLoaded = notifyLoaded;

			this.imgonload = function(){

				var w = thisIconImage.img.width;
				var h = thisIconImage.img.height;

				thisIconImage.imageW = w;
				thisIconImage.imageH = h;

				console.log( "loading buttons (" + thisIconImage.url + ") #1");

				thisIconImage.iconCanvas = document.createElement('canvas');
				thisIconImage.iconContext = thisIconImage.iconCanvas.getContext('2d');

				thisIconImage.iconCanvas.width = 	w;
				thisIconImage.iconCanvas.height = 	h;

				thisIconImage.iconContext.drawImage( thisIconImage.img, 0, 0, w, h);

				thisIconImage.xiconcount = w / thisIconImage.gridw;
				if( thisIconImage.gridw == -1 ) {
					thisIconImage.xiconcount = 1;
					thisIconImage.gridw = w;
					thisIconImage.gridh = h;
				}
				//thisIconImage.yiconcount = h / thisIconImage.gridh;


				for (var xicon = 0; xicon < thisIconImage.xiconcount; xicon++) {

					var sx = xicon * thisIconImage.gridw;
					var sy = 0;
					var imgdata = thisIconImage.iconContext.getImageData(sx, sy, thisIconImage.gridw, thisIconImage.gridh);
					var sd  = imgdata.data;

					var dcanvas = document.createElement('canvas');
					dcanvas.width  = thisIconImage.gridw;
					dcanvas.height = thisIconImage.gridh;
					dcanvas.id = AutoBrush_cnt++;

					var dcontext = dcanvas.getContext('2d');
					var dimgdata = dcontext.createImageData( thisIconImage.gridw, thisIconImage.gridh );
					var dd  = dimgdata.data;

					var xoffset = 0;
					var yoffset = 0;
					var rowoffset = thisIconImage.gridw * 4;
					var offset;

					var r0 = sd[ 0 ];
					var g0 = sd[ 1 ];
					var b0 = sd[ 2 ];

					for (var y = 0; y < thisIconImage.gridh; y++) {
						xoffset = 0;
						for (var x = 0; x < thisIconImage.gridw; x++) {
							offset = yoffset + xoffset;

							dd[ offset + 0] = sd[ offset + 0];
							dd[ offset + 1] = sd[ offset + 1];
							dd[ offset + 2] = sd[ offset + 2];
							dd[ offset + 3] = sd[ offset + 3];

							if( dd[ offset + 0] == r0 && dd[ offset + 1] == g0 && dd[ offset + 2] == b0 && pixel0Transparency == true)
							{
								dd[ offset + 0] = 0;
								dd[ offset + 1] = 0;
								dd[ offset + 2] = 0;
								dd[ offset + 3] = 0; /* Make transparent */
							}

							xoffset += 4;
						}

						yoffset += rowoffset;
					}

					dcontext.putImageData( dimgdata, 0, 0);
					thisIconImage.iconsCanvas.push( dcanvas  );
					thisIconImage.iconsContext.push( dcontext );
				}

				thisIconImage.loaded = true;

				console.log( "loading buttons (" + thisIconImage.url + ") #2, count = " + thisIconImage.xiconcount);
				for (var bi = 0; bi < thisIconImage.buttons.length ; bi++) {
					console.log( "loaded button " + bi + "(" + thisIconImage.url + ")");
					var b = thisIconImage.buttons[ bi ];
					b.renderButton( );
				}

				console.log( "NotifyLoadedObject = " + thisIconImage.notifyLoaded.obj);
				console.log( "NotifyLoadedFunct = " + thisIconImage.notifyLoaded.method);

				thisIconImage.notifyLoaded.obj[thisIconImage.notifyLoaded.method]();

			}

	}

	activateLoadingEvents() {

		//Onload event
		this.img.onload = this.imgonload;
		this.load();

	}

	load() {
		this.img.src = this.url;
	}


	registerButton( b ) {
		var allreadyRegistered = false;
		for (var i = 0; i < this.buttons.length; i++) {
			var b2=  this.buttons[ i ];
			if( b2.id == b.id) {
				allreadyRegistered = true;
			}
		}
		if( !allreadyRegistered ) {
			this.buttons.push( b );
		}
	}

}


class ManagedImage extends IconImageStrip {
		constructor( url, notifyLoaded ) {

			super(
					url,
					-1, -1,
					false,
					notifyLoaded
			);

		}
}


class PanelIcon {
	constructor( iImageStrip, iconIx ) {

		this.iImageStrip = iImageStrip;
		this.iconIx = iconIx;

		this.init = false;
	}

	draw( context, x, y ) {

		if( !this.init ) {

			if( !this.iImageStrip.loaded ) {

				return;
			}

			this.canvas = this.iImageStrip.iconsCanvas[ this.iconIx ];
			this.init = true;

		}


		context.imageSmoothingEnabled = false;
		context.drawImage( this.canvas, x , y );
		context.imageSmoothingEnabled = true;
	}

	getWidth() {

		if( !this.iImageStrip ) { return 0 ; }
		if( !this.iImageStrip.iconsCanvas ) { return 0 ; }
		if( !this.iImageStrip.iconsCanvas[ this.iconIx ] ) { return 0 ; }

	  return this.iImageStrip.iconsCanvas[ this.iconIx ].width;
	}

	getHeight() {

		if( !this.iImageStrip ) { return 0 ; }
		if( !this.iImageStrip.iconsCanvas ) { return 0 ; }
		if( !this.iImageStrip.iconsCanvas[ this.iconIx ] ) { return 0 ; }

	  return this.iImageStrip.iconsCanvas[ this.iconIx ].height;
	}
}




class Button {

    constructor( id, x,y, w, h,  type, drawMethod, group, handlerobject, handlermethod ) {

		this.drawMethod = {};
		this.drawMethod.txt = null;
		this.drawMethod.txtStyle = null;
		this.drawMethod.img = null;
		this.drawMethod.ico = null;
		this.drawMethod.overlay = false;
		this.drawMethod.robj = null;
		this.noborder = false;
		this.dontHighlight = false;
		this.panel = null;
		this.absolutePosition = false;
		this.type = type;
		this.id = id;
		this.group = group;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.handlerobject = handlerobject;
		this.handlermethod = handlermethod;
		this.isMenuButton = false;
		this.isMenuParentButton = false;
		this.isToolButton = false;
		this.needsDetailedInputEvents = false;
		this.inDragOperation = false;
		this.active = true;


		if( drawMethod != null ) {

			if(drawMethod.hasOwnProperty('img')) {

				var img = new Image();
				img.src = drawMethod.img;

				this.drawMethod.img = img;
				this.drawMethod.imgURL = drawMethod.img;
			}
			else if(drawMethod.hasOwnProperty('ico')) {

				this.drawMethod.ico = drawMethod.ico;
				this.drawMethod.ico.iImageStrip.registerButton( this );

			}

			if(drawMethod.hasOwnProperty('imgOverlay')) {
				this.drawMethod.overlay = true;
			}


			if(drawMethod.hasOwnProperty('txt')) {
				this.drawMethod.txt = drawMethod.txt;
				if(drawMethod.hasOwnProperty('txtStyle')) {
					this.drawMethod.txtStyle = drawMethod.txtStyle;
				}

			}
			if(drawMethod.hasOwnProperty('robj')) {
				this.drawMethod.robj = drawMethod.robj;
			}
		}

		if( type == PPAINTR_BTYPE_SEPARATOR ) {
			this.state = PPAINTR_BSTATE_NORENDER;
		}
		else if( type == PPAINTR_BTYPE_TEXT ) {
			//this.noborder = true;
			this.state = PPAINTR_BSTATE_NORMAL;
		}
		else {
			this.state = PPAINTR_BSTATE_NORMAL;
		}

  }

	signalOnRenderCoordinatesSet() {
	}

	changeIcon( newIcon ) {
		this.drawMethod.ico = newIcon;
		this.drawMethod.ico.iImageStrip.registerButton( this );

		this.renderButton();
	}

	popDownMenu() {
		if( this.isMenuParentButton ) {
			this.menuManager.popDown();
		}
	}

	handle( buttonevent ) {

		if( this.handlerobject != null && this.handlermethod != null ) {


			try {
				this.handlerobject[ this.handlermethod ]( buttonevent.physicalButtonId, this.id, this.group );
			}
			catch(error) {
				console.log( "error with handler method " + this.handlermethod);
				console.log( this.handlerobject );
  			throw(error);
			}
		}

	}


	clearButton( )
	{

		var ctx = this.panel.ctx;
		ctx.globalAlpha = 1.0;

		ctx.fillStyle = "#e0e0e0";
		ctx.fillRect(this.rx, this.ry, this.rw, this.rh);

	}

	renderButton( )
	{

		if( this.type == PPAINTR_BTYPE_HOOK ||
				this.active == false ) {
			return;
		}

		var fsize = 14;
		var fsized2 = 6;
		var button = this;
		var ctx = this.panel.ctx;

		if( button.state == PPAINTR_BSTATE_NORMAL || button.dontHighlight ) {

			ctx.globalAlpha = 1.0;

			ctx.fillStyle = "#e0e0e0";
			ctx.fillRect(button.rx, button.ry, button.rw, button.rh);
			var xextra = 0;

			if( this.drawMethod.overlay == false ) {
				if( button.drawMethod.ico != null   ) {
					button.drawMethod.ico.draw( ctx, button.rx, button.ry );
					xextra += button.drawMethod.ico.getWidth();
				}
				else if( button.drawMethod.img != null ) {
					ctx.drawImage( button.drawMethod.img , button.rx, button.ry)
				}
			}

			if( button.drawMethod.robj != null ) {
				button.drawMethod.robj['draw']( ctx , button.rx + xextra, button.ry )
			}


			if( this.drawMethod.overlay == true ) {
				if( button.drawMethod.ico != null   ) {
					button.drawMethod.ico.draw( ctx, button.rx, button.ry );
				}
				else if( button.drawMethod.img != null ) {
					ctx.drawImage( button.drawMethod.img , button.rx, button.ry)
				}
			}


			if( this.noborder == false ) {
				if( this.isMenuParentButton ) {
					dmCMU.rect( ctx, button.rx+1, button.ry+1, button.rw-2, button.rh-2, 'rgba(100,100,100,1)', 1 );
				}
				else {
					dmCMU.rect( ctx, button.rx+1, button.ry+1, button.rw-2, button.rh-2, 'rgba(100,100,100,1)', 1 );
				}
			}

			if( button.drawMethod.txt != null ) {

				ctx.font = "normal normal 12px Verdana";
			  ctx.textBaseline  = 'bottom';
			  ctx.fillStyle = "#000000";
				if( button.drawMethod.txtStyle != null ) {
					ctx.font = button.drawMethod.txtStyle;
				}
				else {
					ctx.font = "normal normal 12px Verdana";
				}
				ctx.fillText( button.drawMethod.txt, xextra+button.rx + .5 + fsized2, button.ry + fsize + fsized2 - 2);
			}

		}
		else if( button.state == PPAINTR_BSTATE_DOWN ) {

			ctx.globalAlpha = 1.0;

			ctx.fillStyle = "#ffffff";
			ctx.fillRect(button.rx, button.ry, button.rw, button.rh);
			var xextra = 0;

			if( this.drawMethod.overlay == false ) {
				if( button.drawMethod.ico != null   ) {
					button.drawMethod.ico.draw( ctx, button.rx, button.ry );
					xextra += button.drawMethod.ico.getWidth();
				}
				else if( button.drawMethod.img != null ) {
					ctx.drawImage( button.drawMethod.img , button.rx, button.ry)
				}
			}

			if( button.drawMethod.robj != null ) {
				button.drawMethod.robj['draw']( ctx , button.rx, button.ry )
			}

			if( this.drawMethod.overlay == true ) {
				if( button.drawMethod.ico != null  ) {
					button.drawMethod.ico.draw( ctx, button.rx, button.ry );
				}
				else if( button.drawMethod.img != null ) {
					ctx.drawImage( button.drawMethod.img , button.rx, button.ry)
				}
			}

			dmCMU.rect( ctx, button.rx, button.ry, button.rw, button.rh, 'rgba(100,100,238,1)', 2 );

			if( button.drawMethod.txt != null ) {

				ctx.font = "normal normal 12px Verdana";
			  ctx.textBaseline  = 'bottom';
			  ctx.fillStyle = "#000000";
				if( button.drawMethod.txtStyle != null ) {
					ctx.font = button.drawMethod.txtStyle;
				}
				else {
					ctx.font = "normal normal 12px Verdana";
				}

				ctx.fillText( button.drawMethod.txt, xextra + button.rx + fsized2, button.ry + fsize + fsized2);
			}
		}
	}


	addMenuManager( manager ) {
		this.manager = manager;
		this.manager.setParentButton( this );

		this.handlerobject = this;
		this.handlermethod = 'intPopUpMenu';
	}

	intPopUpMenu( buttonId ) {

		this.manager.popUp();

	}
}


class MenuButton  extends Button {

	constructor( id, y, w, type, drawMethod, group,
			handlerobject, handlermethod ) {

			super( id, 0,y, w, 1,  type, drawMethod, group,
				handlerobject, handlermethod );

			this.isMenuButton = true;
			this.noborder = true;

		}
}

class ToolButton  extends Button {

constructor( id, x,y, w, h,  type, drawMethod, group, handlerobject, handlermethod ) {

		super( id, x,y, w, h,  type, drawMethod, group, handlerobject, handlermethod );
		this.isToolButton = true;
		this.noborder = true;

	}

}



class Separator extends Button {

	constructor( id, x,y, _w, _h ) {
		var w,h;
		w = _w;
		h = _h;
		if( w == undefined ) { w = PPAINTR_SEPARATOR_CONST_DIST; }
		if( h == undefined ) { h = 1; }

		super( id, x,y, w, h,  PPAINTR_BTYPE_SEPARATOR, null,  null, null, null );
	}

	setWidth( w ) {
		this.w = w;
	}

	setHeight( h ) {
		this.h = h;
	}

}


class TextLabel extends Button {

	constructor( id, x,y, w, text, style ) {

		super( id, x,y,
				w, 1,
				PPAINTR_BTYPE_TEXT,
				{txt: text, txtStyle: style },  null, null, null
			);

			this.noborder = true;

	}

}

class Hook extends Button {

	constructor( id, x,y ) {
		super(
		id,
		x,y,
		0, 0,
		PPAINTR_BTYPE_HOOK,
		null,  null, null, null );

		this.subPanels = [];
	}

}


class PanelsManager {

	constructor( scrW, scrH, gw, gh ) {
		this.panels = [];
		this.scrW = scrW;
		this.scrH = scrH;
		this.gridW = gw;
		this.gridH = gh;
		this.flip = false;
		this.active = true;
	}

	isPanelActive( p ) {
		if( this.active == false )  {
			return false;
		}

		return p.active;
	}


	findMouseEventPanel( pos ) {

		var plen = this.panels.length;
		var panels = this.panels;

		for (var i = 0; i < plen; i++) {

			var p =  panels[ i ];

			var onPanel = p.checkMouseEventIsOnPanel( pos[0], pos[1] );

			if( onPanel ) {
				return p;
			}
		}
		return null;
	}

	render( _context ) {

		var dialogIx = this.mostRecentDialogIndex();

		if( dialogIx < 0 ) {
			var old = _context.imageSmoothingEnabled;
			_context.imageSmoothingEnabled = false;

			var panels = this.panels;
			for (var i = 0; i < panels.length; i++) {

				panels[ i ].render( _context );
			}

			_context.imageSmoothingEnabled = old;
		}
		else
		{
			var old = _context.imageSmoothingEnabled;
			_context.imageSmoothingEnabled = false;

			var panels = this.panels;
			for (var i = 0; i < panels.length; i++) {

				var p = panels[ i ];
				if( p.isMenu || i == dialogIx ) {
					p.render( _context );
				}
				else {
					p.render( _context );

					_context.fillStyle = 'rgba(100,100,150,.5)';
					_context.fillRect(
						p.posX,
						p.posY,
						p.width,
						p.height
					);

				}

			}

			_context.imageSmoothingEnabled = old;
		}
	}

	isDialogOpen() {

		var plen = this.panels.length;
		var panels = this.panels;

		for (var i = 0; i < panels.length; i++) {
			if( panels[ i ].isDialog && panels[ i ].active ) {
				return true;
			}
		}

		return false;
	}

	closeMostRecentDialog() {
		var ix = this.mostRecentDialogIndex();
		this.panels[ ix ].cancel('left');
		return;
	}

	mostRecentDialogIndex() {

		var plen = this.panels.length;
		var panels = this.panels;

		for (var i = panels.length-1; i >=0; i--) {
			if( panels[ i ].isDialog && panels[ i ].active ) {
				return i;
			}
		}

		return -1;
	}

	removeMenu( pid ) {
		this.removePanel( pid );
	}

	removeDialog( pid ) {
		this.removePanel( pid );
	}

	removePanel( pid ) {
		console.log("TODO remove panel " + pid);
		var found = -1;

		for (var i = 0; i < this.panels.length; i++) {

			var bp = this.panels[ i ];

			console.log("check panel " + bp.id);
			if( bp.id == pid ) {
				found = i;
			}
		}
		console.log("found=" + found);

		if( found > -1 ) {
			this.panels.splice( found, 1 );
		}


	}

	addPanel( p ) {

		this.panels.push( p );
		p.layout = this;

	}

	centerHPanel( p ) {
		p.positionFlagsCenterHPanel = true;
	}

	addDialog( p ) {

		this.panels.push( p );
		p.layout = this;

	}

	addMenu( p ) {

		this.panels.push( p );
		p.layout = this;

		var posX = p.parentButton.rx + p.parentButton.panel.posX;
		var posY = p.parentButton.ry + p.parentButton.panel.posY;

		if( posY + p.height < this.scrH  && ( !p.alignUpward ) ) {
				p.setPos( posX , posY );
		}
		else {
				posY -= p.height;
				p.setPos( posX , posY );
		}

	}

	calculate() {
		var bottom = this.scrH;

		for (var i = 0; i < this.panels.length; i++) {

			var bp = this.panels[ i ];

			if( this.panels[ i ].isDialog == undefined || this.panels[ i ].isDialog == false ) {

				var x=0;
				if( bp.positionFlagsCenterHPanel) {
					x = Math.round( (this.scrW - bp.width) / 2 );
				}

				bp.setPos( x, bottom - bp.height);
				bottom -= bp.height;
			}
		}
	}


	findMouseEventFocusPanel( pos ) {

		var lastDialogIndex = this.mostRecentDialogIndex();

		var plen = this.panels.length;
		var panels = this.panels;

		for (var i = plen-1; i >=0; i--) {

			var p =  panels[ i ];

			var onPanel = p.checkMouseEventIsOnPanel( pos[0], pos[1] );

			if( onPanel ) {
				if( lastDialogIndex >= 0 ) {
					if( p.isMenu || i == lastDialogIndex ) {
							return p;
					}
				}
				else {
					return p;
				}
			}
		}
		return null;
	}



	handlePanelsClickEvent( pos, buttonId ) {

		var p = this.findMouseEventFocusPanel( pos );

		if(p==null) { return; }
		p.handleClickEvent( pos[0], pos[1], buttonId );

	}

	handlePanelMouseDownEvent( pos, buttonId ) {

		var p = this.findMouseEventFocusPanel( pos );

		if(p==null) { return; }
		if( p.containsDetailedMouseEventConsumer()) {
			p.handlePanelDetailedMouseEvent( "mousedown", pos[0], pos[1], buttonId );
		}
	}

	handlePanelMouseUpEvent( pos,buttonId ) {

		var p = this.findMouseEventFocusPanel( pos );

		if(p==null) { return; }
		if( p.containsDetailedMouseEventConsumer()) {
			p.handlePanelDetailedMouseEvent( "mouseup", pos[0], pos[1], buttonId );
		}


	}

	handlePanelMouseMoveEvent( pos, buttonId ) {
		var p = this.findMouseEventFocusPanel( pos );

		if(p==null) { return; }
		if( p.containsDetailedMouseEventConsumer()) {
			p.handlePanelDetailedMouseEvent( "mousemove", pos[0], pos[1], buttonId );
		}
	}

	handlePanelsAutoClickEvent( name ) {

		var plen = this.panels.length;

		for (var i = 0; i < plen; i++) {
			var p=  this.panels[ i ];

			p.handleAutoClickEvent( name );

		}

	}
}

class SliderButtonValue {
	constructor( valueReference, minValue, maxValue, stepValue ) {
		this.valueReference = valueReference;
		this.minValue = minValue;
		this.maxValue = maxValue;
		this.stepValue = stepValue;

		if( this.valueReference < this.minValue ) {
			throw "SliderButtonValue.constructor current value ["+valueReference+"] cannot be lower then minimum value ["+minValue+"]";
		}
		else if( this.valueReference > this.maxValue ) {
			throw "SliderButtonValue.constructor current value ["+valueReference+"] cannot be higher then maximum value ["+maxValue+"]";
		}

	}

	getValue() {
		return this.valueReference;
	}

	setValue( x ) {
		this.valueReference = Math.round(x);

		if( this.valueReference < this.minValue) {
			this.valueReference = this.minValue;
		}
		else if( this.valueReference > this.maxValue) {
			this.valueReference = this.maxValue;
		}

	}

}

class 	CommonSliderHandler {

	constructor ( sbvalue, signature, handler ) {
		this.value = sbvalue;
		this.signature = signature;
		this.handler = handler;

		if( signature === undefined ) {
			throw "no signature defined for slider, define or set to null";
		}

		if( handler === undefined ) {
			throw "no handler defined for slider, define or set to null";
		}

		this.deltavalue = sbvalue.maxValue - sbvalue.minValue;

		this.delta = this.value.maxValue - this.value.minValue;
		this.prevFraction = ((this.value.valueReference - this.value.minValue) / this.delta );
		this.deltaFraction = this.value.stepValue / this.delta;

		this.sliderBGThickness = 4;
		this.sliderGripperThickness = 20;
		this.offset = 2;

		this.inDragOperation = false;
	}

	calculateCoordinatesInit( rw, rh, rx, ry ) {

		this.rw = rw;
		this.rh = rh;
		this.rx = rx;
		this.ry = ry;

	}

	handleInit( detailedEventType, posX, posY, buttonId ) {

		this.eventOk = false;
		this.eventMove = false;
		if( detailedEventType == 'mousemove' && buttonId == 'left' ) {
			this.eventOk = true;
			this.eventMove = true;
			this.inDragOperation = true;
		} else if(  detailedEventType == 'mouseup' ) {
			this.eventOk  = true;
			this.inDragOperation = false;
		}

		if( this.eventOk ) {
			this.eventX = posX - this.rx;
			this.eventY = posY - this.ry;
		}
	}


	handleFractionMove( _fraction ) {

		var fraction = _fraction;
		if( !this.eventMove ) {
			if( this.prevFraction < fraction ) {
				fraction = this.prevFraction + this.deltaFraction;
			}
			else {
				fraction = this.prevFraction - this.deltaFraction;
			}
		}

		var value = Math.round( fraction * this.delta );
		this.floatValue = fraction * this.delta;

		if( value < 0 ) { value = 0; }
		else if( value > this.deltavalue ) { value = this.deltavalue; }

		if( this.floatValue < 0 ) { this.floatValue = 0; }
		else if( this.floatValue > this.deltavalue ) { this.floatValue = this.deltavalue; }

		this.value.valueReference = value + this.value.minValue;
		this.prevFraction = fraction;

		if( this.handler != null ) {
			this.handler.obj[ this.handler.method ]( this.signature, this.value.valueReference  );
		}
	}

}

class 	HSliderHandler extends CommonSliderHandler {

	constructor ( sbvalue, signature, handler ) {
		super( sbvalue , signature, handler);
	}

	calculateCoordinates( rw, rh, rx, ry ) {

		this.calculateCoordinatesInit( rw, rh, rx, ry )

		this.labelWidth = 30;
		this.sliderBGHeight = this.sliderBGThickness;
		this.sliderBGWidth = Math.floor( (this.rw - (2*this.offset)) - this.labelWidth );
		this.sliderBGry = this.ry + (this.rh / 2) - (this.sliderBGHeight / 2);
		this.sliderBGrx = this.rx + this.offset;
		this.gripperWidth = this.sliderGripperThickness;
		this.sliderAreaWidth = Math.floor( (this.rw - ( this.gripperWidth )) - this.labelWidth );

	}

	handle( detailedEventType, posX, posY, buttonId ) {

		this.handleInit( detailedEventType, posX, posY, buttonId );

		if(!this.eventOk) { return; }

		var fraction = (this.eventX - (this.gripperWidth/2)) / this.sliderAreaWidth;

		this.handleFractionMove( fraction );

	}

	draw( ctx, x, y ) { //TODO, not needed x,y, at least not for slider

	  var size = 9;
	  var xoff = 4;
	  var yoff = 4 + (size);

		var fraction = ((this.value.valueReference - this.value.minValue) / this.delta );

		this.sliderHPos = Math.floor(fraction * this.sliderAreaWidth) + this.rx;

		dmCMU.rect(
			ctx,
			this.sliderBGrx,
			this.sliderBGry,
			this.sliderBGWidth,
			this.sliderBGHeight,
			'rgba(150,150,150,1)',
			1 );

			/* gripper */
			ctx.fillStyle = "#a0a0f0";
			ctx.fillRect(this.sliderHPos, this.ry,  this.gripperWidth, this.rh);

			dmCMU.rect(
				ctx,
				this.sliderHPos,
				this.ry,
				this.gripperWidth,
				this.rh,
				'rgba(0,0,0,1)',
				1 );

			ctx.font = '10px arial';
		  ctx.textBaseline  = 'top';
		  ctx.fillStyle = "#000000";
			var text = this.value.valueReference;
			var size = ctx.measureText(text);
			var center = (this.labelWidth/2) - (size.width / 2);

			ctx.fillText( text,
					Math.round( ((this.rx + this.rw) - this.labelWidth  - (this.offset/2)) + center ),
					this.ry + 3 );

	}
}

class 	VSliderHandler  extends CommonSliderHandler {

	constructor ( sbvalue, signature, handler ) {
		super( sbvalue , signature, handler);
	}


	calculateCoordinates( rw, rh, rx, ry ) {

		this.calculateCoordinatesInit(  rw, rh, rx, ry );

		this.labelHeight = 20;
		this.sliderBGWidth = this.sliderBGThickness;
		this.sliderBGHeight = Math.floor(( this.rh - (2*this.offset) ) - this.labelHeight);
		this.sliderBGrx = this.rx + (this.rw / 2) - (this.sliderBGWidth / 2);
		this.sliderBGry = this.ry + this.offset;
		this.gripperHeight = this.sliderGripperThickness;
		this.sliderAreaHeight = Math.floor( (this.rh - ( this.gripperHeight )) - this.labelHeight );

	}

	handle( detailedEventType, posX, posY, buttonId ) {

		this.handleInit( detailedEventType, posX, posY, buttonId );

		if(!this.eventOk) { return; }

		var fraction = 1-((this.eventY - (this.gripperHeight/2)) / this.sliderAreaHeight);

		this.handleFractionMove( fraction );

	}

	draw( ctx, x, y ) { //TODO, not needed x,y, at least not for slider

	  var size = 9;
	  var xoff = 4;
	  var yoff = 4 + (size);

		var fraction = ((this.value.valueReference - this.value.minValue) / this.delta );

		this.sliderVPos = Math.floor((1-fraction) * this.sliderAreaHeight) + this.ry;

		dmCMU.rect(
			ctx,
			this.sliderBGrx,
			this.sliderBGry,
			this.sliderBGWidth,
			this.sliderBGHeight,
			'rgba(150,150,150,1)',
			1 );

			/* gripper */
			ctx.fillStyle = "#a0a0f0";
			ctx.fillRect(this.rx + ( this.rw * .1), this.sliderVPos, this.rw * .8, this.gripperHeight);
			dmCMU.rect(
				ctx,
				this.rx + ( this.rw * .1),
				this.sliderVPos,
				this.rw * .8,
				this.gripperHeight,
				'rgba(0,0,0,1)',
				1 );

			ctx.font = '10px arial';
		  ctx.textBaseline  = 'top';
		  ctx.fillStyle = "#000000";

			var text = this.value.valueReference;
			var size = ctx.measureText(text);
			var xcenter = (this.rw/2) - (size.width / 2);
			var ycenter = (this.labelHeight/2) - (10 / 2);

			ctx.fillText( text,
					this.rx + xcenter,
					Math.round( ((this.ry + this.rh) - this.labelHeight) + (this.offset/2) + ycenter )
				);

	}
}


class CustomButton extends Button {

	constructor( id, x,y, w, h, drawMethod, group, handlerobject, handlermethod, data ) {

		super( id, x,y, w, h,  PPAINTR_BTYPE_CUSTOM , drawMethod, group, handlerobject, handlermethod );
		this.needsDetailedInputEvents = true;
		this.data = data;
	}

	handleButtonDetailedMouseEvent( detailedEventType, posX, posY, buttonId ) {

			if( this.handlermethod != null && this.handlerobject != null ) {

				var event ={};
				event.type = detailedEventType;
				event.posX = posX;
				event.posY = posY;
				event.deviceButtonId = buttonId;
				event.button = this;
				event.buttonInfo = {};
				event.buttonInfo.width = this.rw;
				event.buttonInfo.height = this.rh;
				event.buttonInfo.id = this.id;
				event.buttonInfo.group = this.group;
				event.buttonInfo.data = this.data;
				event.buttonInfo.renderer = this.drawMethod.robj;

				this.handlerobject[ this.handlermethod ]( event );
			}
			this.renderButton();
	}

}


class SliderButton extends Button {
	constructor( id, x,y, w, h,  type, sbvalue, signature, handler ) {

		var sliderHandler;
		if( type == PPAINTR_BTYPE_VSLIDER ) {
			 sliderHandler = new VSliderHandler( sbvalue, signature, handler );
		}
		else if( type == PPAINTR_BTYPE_HSLIDER ) {
			sliderHandler = new HSliderHandler( sbvalue, signature, handler );
		}

		super( id, x, y, w, h, type, {robj: sliderHandler }, null, "handle" );

		this.handlerobject = this;
		this.sliderHandler = sliderHandler;
		this.noborder = true;
		this.needsDetailedInputEvents = true;
		this.value = sbvalue;

	}

	handle( bid ) { /*do nothing */}

	handleButtonDetailedMouseEvent( detailedEventType, posX, posY, buttonId ) {

			this.sliderHandler.handle( detailedEventType, posX, posY, buttonId );
			this.inDragOperation = this.sliderHandler.inDragOperation;
			this.renderButton();
	}

	signalOnRenderCoordinatesSet() {

		this.sliderHandler.calculateCoordinates(
				this.rw,
				this.rh,
				this.rx,
				this.ry
		);
	}

}

class ButtonPanel {

    constructor( id, width, height, gridw, gridh, renderSignalObj, renderSignalMethod ) {

		this.id = id;
		this.buttons = null;
		this.active = true;
		this.show = true;
		this.canvas = document.createElement('canvas');
		this.canvas.id     = "panel_" + id;

		this.posX  = 0;
		this.posY  = 0;
		this.positionFlagsCenterHPanel = false;

		this.gridw = gridw;
		this.gridh = gridh;

		this.ctx = this.canvas.getContext('2d');

		this.setDimensions( width, height );

		this.renderSignalObj = renderSignalObj;
		this.renderSignalMethod = renderSignalMethod;

		this.state = [];

		this.isDialog = false;
		this.isMenu = false;

		this.buttons = [];
		this.subPanels = [];

		this.xoffset = 5;
		this.yoffset = 5;
		this.xoffsetm2 = this.xoffset * 2;
		this.yoffsetm2 = this.yoffset * 2;

		this.containsDetailedMouseEventConsumerFlag = false;


		this.subPanels["root"] =
		{
				id: "root",
				mode: SPANEL_ROOT,
				param: { w: this.width - this.xoffset_mul_2, h: this.height - this.yoffset_mul_2,
						 x0: this.xoffset, y0: this.yoffset
					},
				buttons: [],
				isActive: true
		};

    }


	containsDetailedMouseEventConsumer() {
		return this.containsDetailedMouseEventConsumerFlag;
	}

	setDimensions( ww, hh ) {
		this.width  = ww;
		this.height = hh;

		this.canvas.width  = ww;
		this.canvas.height = hh;

		this.ctx.fillStyle = "#e0e0e0";
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	getImageButtons()
	{
		var list =  new Array();

		var blen = this.buttons.length;
		for (var i = 0; i < blen; i++) {
			var b=  this.buttons[ i ];

			if( b.drawMethod.img != null ) {

				list.push( b );

			}
		}
		return list;
	}


	makeAttachedSubPanel(  id, hook, w, h ) {
			var par = {};
			var sp = { 	id: id, mode: SPANEL_ATTACHED,
									param: par,
									buttons: [],
									isActive: true
							}

			this.subPanels[ id ] = sp;

			sp.param.x0 = 0;
			sp.param.y0 = 0;
			sp.param.w = this.width;
			sp.param.h = this.height;
			sp.param.hook = hook;

			sp.param.hook.subPanels.push( sp );

	}

	makeSubPanelAuto(  id, mode ) {

		var par = {};
		var sp = { 	id: id, mode: mode,
								param: par,
								buttons: [],
								isActive: true
						}

		this.subPanels[ id ] = sp;

		sp.param.x0 = 0;
		sp.param.y0 = 0;
		sp.param.w = this.width;
		sp.param.h = this.height;

		if( mode == SPANEL_LEFTHALF ) {
			sp.param.x0 = this.xoffset;
			sp.param.y0 = this.yoffset;
			sp.param.w = Math.round( this.width / 2);
			sp.param.h = this.height;
		}
		else if( mode == SPANEL_RIGHTHALF ) {
			sp.param.x0 = Math.round( this.width / 2) + this.xoffset;
			sp.param.y0 = this.yoffset;
			sp.param.w = Math.round( this.width / 2 );
			sp.param.h = this.height;
		}
		else if( mode == SPANEL_THIRDLEFT ) {
			sp.param.x0 = this.xoffset;
			sp.param.y0 = this.yoffset;
			sp.param.w = Math.round( this.width / 3);
			sp.param.h = this.height;
		}
		else if( mode == SPANEL_THIRDMIDDLE ) {
			sp.param.x0 = Math.round( (this.width * 1 )/ 3) + this.xoffset;
			sp.param.y0 = this.yoffset;
			sp.param.w = Math.round( this.width / 3);
			sp.param.h = this.height;
		}
		else if( mode == SPANEL_THIRDRIGHT ) {
			sp.param.x0 = Math.round( (this.width * 2 )/ 3) + this.xoffset;
			sp.param.y0 = this.yoffset;
			sp.param.w = Math.round( this.width / 3);
			sp.param.h = this.height;
		}
	}

	placeButtons(  ) {

		var yoff = 0;
		if( this.isDialog == true ) {
			yoff = 32;
			var fsize = 13;

		}
		this.placeRowCoords = [];

		var sp;

		for (let [key, value] of Object.entries( this.subPanels )) {
		   sp = value;
		   sp.placeRowCoords = [];
		}

		var lastGroup = null;
		var blen = this.buttons.length;
		for (var i = 0; i < blen; i++) {

			var b = this.buttons[ i ];

			b.panel = this;
			var sub = this.subPanels[ b.subPanelId ];

			if( b.type == PPAINTR_BTYPE_TOGGLE ) {
				if( b.group != lastGroup ) {
					lastGroup = b.group;
					b.state = PPAINTR_BSTATE_DOWN;
				}
			}

			if( b.absolutePosition == false ) {
				var x = b.x * this.gridw;
				var y = ( b.y * this.gridh ) + yoff;
				var w = b.w * this.gridw;
				var h = b.h * this.gridh;

				if( b.x == PANEL_LEFTALIGN ) {

					if( ( b.y+1 ) > sub.placeRowCoords.length ) {

						sub.placeRowCoords[ b.y ] = 0;
					}
					b.x = sub.placeRowCoords[ b.y ];
					x = b.x * this.gridw;

					if( b.type != PPAINTR_BTYPE_HOOK ) {
							sub.placeRowCoords[ b.y ] += b.w;
					}

				}

				if( b.x == PANEL_RIGHTALIGN ) {
					x = this.width - w;
				}

				b.rx = x + sub.param.x0;
				b.ry = y + sub.param.y0;
				b.rw = w;
				b.rh = h;
				if( b.type == PPAINTR_BTYPE_HOOK ) {
					for (var j = 0; j < b.subPanels.length; j++) {
							b.subPanels[ j ].param.x0 = b.rx;
							b.subPanels[ j ].param.y0 = b.ry;
					}
				}

				b.signalOnRenderCoordinatesSet();
			}

			b.renderButton(  );

		}
	}

	clearToggleButtons( groupId ) {
		var blen = this.buttons.length;

		for (var i = 0; i < blen; i++) {

			var b = this.buttons[ i ];
			if( b.group == groupId ) {
				b.state = PPAINTR_BSTATE_NORMAL;
			}
		}
	}

	selectToggleButton( groupId, id ) {
		var blen = this.buttons.length;

		for (var i = 0; i < blen; i++) {

			var b = this.buttons[ i ];
			if( b.group == groupId && b.id == id ) {
				b.state = PPAINTR_BSTATE_DOWN;
			}
			else if( b.group == groupId  ) {
				b.state = PPAINTR_BSTATE_NORMAL;
			}
		}

	}

	setButtons( _moreButtons, _subPanelId ) {

		var subPanel = null;
		for (let [key, value] of Object.entries( this.subPanels )) {
			if( _subPanelId == value.id ) {
				subPanel = value;
			}
		}

		var blen = _moreButtons.length;
		for (var i = 0; i < blen; i++) {
			var b=  _moreButtons[ i ];

			b.panel = this;
			b.subPanelId = _subPanelId;
			if( b.needsDetailedInputEvents ) {
				this.containsDetailedMouseEventConsumerFlag = true;
			}

			subPanel.buttons.push( b );
			this.buttons.push( b );
		}

	}

	setPos(  x, y ) {

		if( x != COORD_UNCHANGED ) {
				this.posX = x;
		}
		if( y != COORD_UNCHANGED ) {
			this.posY = y;
		}
	}

	intSetPosCenter(  scrW, scrH ) {

		this.posX = Math.round((scrW - this.width) / 2 );
		this.posY = Math.round((scrH - this.height) / 2 );
	}

	intPaint( ctx ) {

		if( !this.active ) { return; }

		if( ctx == this.ctx ) {
			throw "cannot paint panel on itself";
		}

		ctx.drawImage( this.canvas, this.posX, this.posY);

		this.renderSignalObj[ this.renderSignalMethod ]();
	}

	render( ctx ) {

		if( ctx == this.ctx ) {
			throw "cannot render panel on itself";
		}

		if( !this.active ) { return; }

		ctx.drawImage( this.canvas, this.posX, this.posY);
	}

	getToggleButtonId( groupId ) {
		var blen = this.buttons.length;

		for (var i = 0; i < blen; i++) {

			var b = this.buttons[ i ];
			if( b.group == groupId && b.state == PPAINTR_BSTATE_DOWN ) {
				return b.id;
			}

		}
	}

	updateRender() {

		if( !this.active ) { return; }

		var blen = this.buttons.length;
		for (var i = 0; i < blen; i++) {
			var b=  this.buttons[ i ];
			b.renderButton( );
		}
	}

	checkMouseEventIsOnPanel( x0, y0 ) {

		if( !this.active ) { return false; }

		var ex = x0 - this.posX ;
		var ey = y0 - this.posY ;

		if( x0 > this.posX && y0 > this.posY )
		{
			if( ex < this.width && ey < this.height )
			{
				return true;
			}
		}
		return false;
	}

	subPanelSetActiveState( spID, flag ) {
		for (let [key, value] of Object.entries( this.subPanels )) {
			var sp = value;
			if( sp.id == spID ) {
				sp.isActive = flag;

				var blen = sp.buttons.length;

				for (var i = 0; i < blen; i++) {
					var b=  sp.buttons[ i ];

					b.active = flag;
					if( flag ) {
						b.renderButton();
					}
					else {
						b.clearButton();
					}
				}

				return;
			}
		}
	}

	handleAutoClickEvent( buttonId )  {

		var blen;

		for (let [key, value] of Object.entries( this.subPanels )) {
			var sp = value;

			if( !sp.isActive ) {
				continue;
			}

			blen = sp.buttons.length;

			for (var i = 0; i < blen; i++) {
				var b=  sp.buttons[ i ];

				if( b.id == buttonId ) {

					if( b.type == PPAINTR_BTYPE_TOGGLE ) {
							b.state = PPAINTR_BSTATE_DOWN;
							b.renderButton(  );

							var blen2 = sp.buttons.length;
							for (var i2 = 0; i2 < blen; i2++) {
								var b2=  sp.buttons[ i2 ];

								if( b2 != b && b2.group != null && b2.group == b.group && b2.state == PPAINTR_BSTATE_DOWN ) {
									b2.state = PPAINTR_BSTATE_NORMAL;

									b2.renderButton( );
								}

							}
							b.handle( { physicalButtonId: 'left' } );
					}
					else if( b.type == PPAINTR_BTYPE_CLICK ) {
							b.state = PPAINTR_BSTATE_DOWN;
							b.renderButton(  );
							b.handle( { physicalButtonId: 'left' });
							var pan = this;
							var butt = b;
							var renderSignalObj = this.renderSignalObj;
							var renderSignalMethod = this.renderSignalMethod;
							var __thisctx = this.ctx;

							setTimeout(function() {

								butt.state = PPAINTR_BSTATE_NORMAL;
								butt.renderButton( pan.ctx );

								renderSignalObj[ renderSignalMethod ]();

							}, 100);
					}
				}
			}
		}
		//this.intPaint( this.ctx );
	}

	handlePanelDetailedMouseEvent( detailedEventType, posX, posY, buttonId ) {

		if( !this.active ) { return; }
		if( buttonId == undefined ) { throw "no button defined"; }

		var ex = posX - this.posX;
		var ey = posY - this.posY;

		var activeButtonFound = null;

		var blen;
		for (let [key, value] of Object.entries( this.subPanels )) {
			var sp = value;

			if( !sp.isActive ) {
				continue;
			}

			blen = sp.buttons.length;

			for (var i = 0; i < blen; i++) {
				var b=  sp.buttons[ i ];

				if( !b.needsDetailedInputEvents ) {
					continue;
				}

				var x = b.rx;
				var y = b.ry;
				var w = b.rw;
				var h = b.rh;

				if( b.inDragOperation ) {
					activeButtonFound = b;
					break;
				}
				else if( ex > x && ex < x+w ) {
					if( ey > y && ey < y+h  ) {
						activeButtonFound = b;
					}
				}
			}

		}

		if( activeButtonFound != null ) {
				b = activeButtonFound;

				for (var i2 = 0; i2 < blen; i2++) {
					var b2=  this.buttons[ i2 ];

					if( b2 != b && b2.isMenuParentButton == true ) {
						b2.popDownMenu();
					}
				}

				if( b.type == PPAINTR_BTYPE_VSLIDER ||  b.type == PPAINTR_BTYPE_HSLIDER || b.type == PPAINTR_BTYPE_CUSTOM) {


						b.handleButtonDetailedMouseEvent(
								detailedEventType,
								ex,
								ey,
								buttonId
						);

						b.renderButton();
						this.renderSignalObj[ this.renderSignalMethod ](); /* Update directly*/
						return;
			  	}
		}

	}

	handleClickEvent( x0, y0, physicalButtonId ) {

		if( !this.active ) { return; }
		if( physicalButtonId == undefined ) { throw "no button defined"; }

		var ex = x0 - this.posX;
		var ey = y0 - this.posY;

		var blen;
		for (let [key, value] of Object.entries( this.subPanels )) {
			var sp = value;

			if( !sp.isActive ) {
				continue;
			}

			blen = sp.buttons.length;

			for (var i = 0; i < blen; i++) {
				var b=  sp.buttons[ i ];

				var x = b.rx;
				var y = b.ry;
				var w = b.rw;
				var h = b.rh;
				var mouseOverButton = false;

				if( ex > x && ex < x+w ) {
					if( ey > y && ey < y+h  ) {
						mouseOverButton = true;
					}
				}

				if( mouseOverButton ) {

					for (var i2 = 0; i2 < blen; i2++) {
						var b2=  this.buttons[ i2 ];

						if( b2 != b && b2.isMenuParentButton == true ) {
							b2.popDownMenu();
				  	}
					}


					if( b.type == PPAINTR_BTYPE_TOGGLE) {
							b.state = PPAINTR_BSTATE_DOWN;
							b.renderButton(  );

							for (let [tmpkey, tmpvalue] of Object.entries( this.subPanels )) {
								var tmpsp = tmpvalue;

								if( !tmpsp.isActive ) {
										continue;
								}

								var tmpblen2 = tmpsp.buttons.length;
								for (var ti2 = 0; ti2 < tmpblen2; ti2++) {
									var b2=  tmpsp.buttons[ ti2 ];

									if( b2 != b && b2.group != null && b2.group == b.group && b2.state == PPAINTR_BSTATE_DOWN ) {
										b2.state = PPAINTR_BSTATE_NORMAL;

										b2.renderButton( );
									}

								}
							}
							b.handle( { physicalButtonId: physicalButtonId });

					}
					else if( b.type == PPAINTR_BTYPE_CLICK ) {
							b.state = PPAINTR_BSTATE_DOWN;
							b.renderButton(  );
							b.handle( { physicalButtonId: physicalButtonId });
							var pan = this;
							var butt = b;
							var renderSignalObj = this.renderSignalObj;
							var renderSignalMethod = this.renderSignalMethod;
							var __thisctx = this.ctx;

							setTimeout(function() {

								butt.state = PPAINTR_BSTATE_NORMAL;
								butt.renderButton( pan.ctx );

								renderSignalObj[ renderSignalMethod ]();

							}, 100);
					}
				}
			}
		}

	}

	getContext() {
		return this.ctx;
	}

	getState() {
		return this.state;
	}

}

class MenuManager {

		constructor( id, width, gridh, buttonDefs, renderSignalObj, renderSignalMethod ) {
				this.id = id;
				this.parentButton = null;
				this.width = width;
				this.gridh = gridh;
				this.renderSignalObj = renderSignalObj;
				this.renderSignalMethod = renderSignalMethod;
				this.buttonDefs = buttonDefs;
				this.menu = null;
		}

		setParentButton( parentButton ) {
			this.parentButton = parentButton;
			this.parentButton.isMenuParentButton = true;
			this.parentButton.menuManager = this;
			this.parentButton.noborder = false;

		}

		popDown() {
			if( this.menu == null ) {
				return;
			}

			this.parentButton.panel.layout.removeMenu( this.id );

			this.menu = null;
		}


		createCallbackFunction(__this, def,  callid, i) {

		  return function( bid ) {
				__this.popDown();

				def.callfunction[ 0 ][ def.callfunction[ 1 ] ]( bid );

		  };
		}

		popUp() {

			if( this.menu != null ) {
				this.popDown();
				return;
			}

			var h = this.gridh * this.buttonDefs.length;
			for( var i = 0; i < this.buttonDefs.length; i++ ) {
				var def = this.buttonDefs[ i ];
				if( def.type == PPAINTR_BTYPE_SEPARATOR ) {
					h-= (1-PPAINTR_SEPARATOR_CONST_DIST) * this.gridh;
				}
			}

			this.menu = new MenuPanel(
				this.id,
				this.width,
				h,
				this.width, this.gridh,
				this.renderSignalObj, this.renderSignalMethod );


				var y = 0;

				console.log( "popUp buttons: " + this.buttonDefs.length);

				var b = [];
				for( var i = 0; i < this.buttonDefs.length; i++ ) {

					var def = this.buttonDefs[ i ];

					var callid = "callfunction" + i;
					console.log( "callid=" + callid );

					this[callid] = this.createCallbackFunction(this , def, callid, i);

					b.push(

						new MenuButton(
								"menupanel_" + this.id + "_menubutton" + i,
						 		y, 1,
								def.type,
								def.render,
								null,
								this, callid )
						);

						console.log( "add button at  y:" + y);
						if( def.type != PPAINTR_BTYPE_SEPARATOR ) {
							y+= 1;
						}
						else {
							y+= PPAINTR_SEPARATOR_CONST_DIST;
						}
				}

				this.menu.setButtons( b, "root" );
				this.menu.placeButtons();
				this.menu.parentButton = this.parentButton;

				this.parentButton.panel.layout.addMenu( this.menu );
		}


}

class MenuPanel extends ButtonPanel {

	 constructor( id,  _width, _height, _gridw, _gridh, renderSignalObj, renderSignalMethod ) {

		super( id,
				Math.round( _width ), Math.round( _height ),
				Math.round( _gridw), Math.round( _gridh ),
				renderSignalObj, renderSignalMethod
		);

		this.setDimensions(
				this.width  + this.xoffsetm2,
				this.height + this.yoffsetm2
		);

		this.isMenu = true;
		this.alignUpward = true;

		dmCMU.rect( this.ctx,
			0, 0, this.width, this.height, 'rgba(64,64,64,1)', 1 );

	}

	finalizeSize() {

	}



}

class Dialog extends ButtonPanel {

	  constructor( id, title, scrW, scrH, _width, _height, _gridw, _gridh, _closeObj, _closeMethod, renderSignalObj, renderSignalMethod ) {

		super( id,
				Math.round( _width ), Math.round( _height ),
				Math.round( _gridw), Math.round( _gridh ),
				renderSignalObj, renderSignalMethod
		);

		this.closeObj = _closeObj;
		this.closeMethod = _closeMethod;

		this.centerDialog( scrW, scrH );

		this.isDialog = true;
		this.title = title;

		dmCMU.rect( this.ctx,
			0, 0, this.width, this.height, 'rgba(64,64,64,1)', 1 );

		//title bar
		dmCMU.rect( this.ctx,
				5, 5, this.width - (5 * 2), 25 - 6, 'rgba(100,100,238,1)', 1 );

		dmCMU.rect( this.ctx,
				2, 2, this.width - (2 * 2), 25, 'rgba(100,100,238,1)', 1 );


		this.ctx.fillStyle = "black";
		this.ctx.font = 'normal  ' + 10 + 'px Verdana';
		this.ctx.fillText( this.title, 12,18);

		var bok,bcan;

		bcan = new Button( "sys:cancel-button",
			null,null,
			4, 1,
			PPAINTR_BTYPE_CLICK,
			{txt:"Cancel"}  ,
			null, this,  'cancel'
			);

		bcan.rw = 55;
		bcan.rh = 25;
		bcan.absolutePosition = true;
		bcan.rx = this.width - (bcan.rw + 5);
		bcan.ry = this.height - 30;



		bok = new Button( "sys:ok-button",
			null,null,
			4, 1,
			PPAINTR_BTYPE_CLICK,
			{txt:"OK"}  ,
			null, this,  'ok'
			);

		bok.absolutePosition = true;

		bok.rw = 50;
		bok.rh = 25;
		bok.rx = bcan.rx - (bok.rw + 5);
		bok.ry = this.height - 30;

		var b = [];
		b.push(bcan);
		b.push(bok);

		this.setButtons(  b , "root" );

	}

	cancel( physicalButtonId ) {
		this.active = false;
		this.show = false;

		this.closeObj[ this.closeMethod ]( false );
	}


	ok( physicalButtonId ) {
		this.active = false;
		this.show = false;

		this.closeObj[ this.closeMethod ]( true );
	}

	centerDialog( scrW, scrH ) {

		this.intSetPosCenter( scrW, scrH );

	}
}
