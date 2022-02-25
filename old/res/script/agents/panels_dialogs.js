class SelectResolutionDialog {

	constructor( _layout, _curRes, _okdialogfunction, _renderFunction ) {

		this.SCRW = _layout.scrW;
		this.SCRH = _layout.scrH;
		this.currentRes = _curRes;
		this.layout = _layout;
		this.renderObj = _renderFunction.obj;
		this.renderMethod = _renderFunction.method;
		this.okObj = _okdialogfunction.obj;
		this.okMethod = _okdialogfunction.method;
		this.panel = null;
		this.gridW = _layout.gridW;
		this.gridH = _layout.gridH;
		this.lockFlag = true;

		this.titleStyle = "bold 14px Arial";
		this.groupStyle = "bold 12px Arial";

		this.result={ w: this.currentRes.W, h: this.currentRes.H };

		this.colorBox = new ColorBox();

		var res;

		this.retro = [];
		res = this.retro;
		res.push({grp: true, name: "Retro Style Resolutions"});
		res.push({res: '320x200', name: "CGA"});
		res.push({res: '640x480', name: "VGA"});
		res.push({grp: true, name: "C64"});
		res.push({res: '160x200', name: "Multi Color"});
		res.push({res: '320x200', name: "Hires"});
		res.push({grp: true, name: "Amiga Lowres"});
		res.push({res: '320x200', name: "NTSC"});
		res.push({res: '320x256', name: "PAL"});
		res.push({res: '320x400', name: "NTSC Interlace"});
		res.push({res: '320x512', name: "PAL Interlace"});
		res.push({grp: true, name: "Amiga Hires"});
		res.push({res: '640x200', name: "NTSC"});
		res.push({res: '640x256', name: "PAL"});
		res.push({res: '640x400', name: "NTSC Interlace"});
		res.push({res: '640x512', name: "PAL Interlace"});

		this.modern = [];
		res = this.modern;

		res.push({grp: true, name: "Resolutions"});
		res.push({res: this.currentRes.W + "x" + this.currentRes.H, name: "\"Current\""});
		res.push({res: this.SCRW + "x" + this.SCRH, name: "\"Fit Screen\""});
		res.push({grp: true, name: "VGA"});
		res.push({res: '800x600', name: "SVGA"});
		res.push({res: '1024x600', name: "WSVGA"});
		res.push({res: '1024x768', name: "XGA"});
		res.push({res: '1280x800', name: "WXVGA"});
		res.push({grp: true, name: "Pixel"});
		res.push({res: '1280x720', name: "720p HD"});
		res.push({res: '1920x1080', name: "1080p Full HD"});
		res.push({res: '2560x1440', name: "1440p"});
		res.push({res: '3840x2160', name: "4K"});
		res.push({grp: true, name: "Smartphone"});
		res.push({res: '1080x1920', name: "Resolution 1"});
		res.push({res: '750x1334', name: "Resolution 2"});
		res.push({res: '720x1280', name: "Resolution 3"});


	}


	popUp() {
		var row = 0;
		var b;
		var panel = new Dialog(
			"SelectResolutionDialog",
			"Select Image Resolution",
			this.SCRW, this.SCRH,
			800 , 670,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		panel.makeSubPanelAuto( "left",  SPANEL_THIRDLEFT );
		panel.makeSubPanelAuto( "middle", SPANEL_THIRDMIDDLE );
		panel.makeSubPanelAuto( "right", SPANEL_THIRDRIGHT );

		var subpaneldef = [];
		subpaneldef.push(
			{
				target: "middle",
				label: "modern",
				def: this.modern
			}
		);
		subpaneldef.push(
			{
				target: "right",
				label: "retro",
				def: this.retro
			}
		);

		for( var p=0; p<subpaneldef.length; p++ ) {
			var spd = subpaneldef[ p ];
			b = [];
			row = 0;
			var arr = spd.def;
			var labl = spd.label;
			for( var i=0; i<arr.length; i++ ) {
				var res = arr[ i ];
				if( res.grp == true ) {
					if( i>0 ) {
						row++;
					}

					var style = this.groupStyle;
					if( i == 0 ) {
						style = this.titleStyle;
					}
					b.push(
						new TextLabel( labl + i,
							PANEL_LEFTALIGN,row,4,
							res.name, style
					));
				}
				else {
					b.push(

						new TextLabel( labl + i,
							PANEL_LEFTALIGN,row,4,
							res.name, this.groupStyle

					));

					b.push(
						new Button( res.res , PANEL_LEFTALIGN,row,
							4, 1,
							PPAINTR_BTYPE_CLICK,
							{txt: res.res}  ,
							"res", this,  "changeRes"
							));
				}

				row ++;

			}

			panel.setButtons( b, spd.target );
		}


		b = [];
		row = 0;

		b.push(

			new TextLabel( "options",
				PANEL_LEFTALIGN,row,4,
				"Resize Options", this.titleStyle

		));
		row++;

		this.addOption( b, row, "pixelresize", "Pixel Resize" );row++;
		this.addOption( b, row, "resize",  "Resize" );row++;
		this.addOption( b, row, "clip",  "Clip" );row++;


		var s = new Separator( this.id++, PANEL_LEFTALIGN, row++ );
		b.push( s );


		b.push(
			new TextLabel(  + this.id++,
				PANEL_LEFTALIGN,row,4,
				"Aspect Ration", "12px Arial"
		));

		b.push(
			new Button(  "scale.unlock" ,
				PANEL_LEFTALIGN,row,
				4, 1,
				PPAINTR_BTYPE_TOGGLE,
				{txt: "Unlock" }  ,
				"scale.option", this,  'unlock'
				));

		row++;
		b.push(
			new TextLabel( this.id++,
				PANEL_LEFTALIGN,row,4,
				"", ""
		));

		b.push(
			new Button( "scale.lock" ,
				PANEL_LEFTALIGN,row,
				4, 1,
				PPAINTR_BTYPE_TOGGLE,
				{txt: "Lock" }  ,
				"scale.option", this,  'lock'
				));

		row++;
		var s = new Separator( this.id++, PANEL_LEFTALIGN, row++ );
		b.push( s );


		var sliderHandler = {
			obj: this,
			method: 'handleSlider'
		}

		var maxW = 2840;
		if( this.currentRes.W > maxW ) { maxW = this.currentRes.W; }
		var maxH = 2560;
		if( this.currentRes.H > maxH ) { maxH = this.currentRes.H; }

		this.valueW = new SliderButtonValue( this.currentRes.W, 1, maxW, 1 );
		this.valueH = new SliderButtonValue( this.currentRes.H, 1, maxH, 1 );

		this.aspectRatioW = this.currentRes.W / this.currentRes.H;
		this.aspectRatioH = this.currentRes.H / this.currentRes.W;

		s = new Separator( this.id++, PANEL_LEFTALIGN, row );
		s.setWidth( 1 );
		b.push( s );


		this.sliderWbutton =
				new SliderButton( "BSizeSlider" + this.id++,
					PANEL_LEFTALIGN,row,
					2.5, 12,
					PPAINTR_BTYPE_VSLIDER,
					this.valueW, 'width', sliderHandler );

		b.push( this.sliderWbutton );

		s = new Separator( this.id++, PANEL_LEFTALIGN, row );
		s.setWidth( 3 );
		b.push( s );

		this.sliderHbutton =
				new SliderButton( "BSizeSlider" + this.id++,
					PANEL_LEFTALIGN,row,
					2.5, 12,
					PPAINTR_BTYPE_VSLIDER,
					this.valueH, 'height', sliderHandler );

		b.push( this.sliderHbutton );

		panel.setButtons( b, "left" );

		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog( this.panel );

		panel.selectToggleButton( 'scale.option', 'scale.lock');
		panel.updateRender();

	}

	addOption( buttns, row, id, title ) {

		buttns.push(
			new Button( "sep" + id,
				PANEL_LEFTALIGN,row,
				.5, 1,  PPAINTR_BTYPE_SEPARATOR, null, null, this,  null
		));

		buttns.push(
			new Button( id ,
				PANEL_LEFTALIGN,row,
				8, 1,
				PPAINTR_BTYPE_TOGGLE,
				{txt: title }  ,
				"option", this,  null
				));

	}

	changeRes( bid, bttnId ) {

		console.log( bttnId );

		var wh = bttnId.split("x");

		this.valueW.setValue( wh[0] );
		this.valueH.setValue( wh[1] );
		this.sliderWbutton.renderButton();
		this.sliderHbutton.renderButton();

		this.result={ w: this.valueW.getValue(), h: this.valueH.getValue() };


	}

	popDown( ok ) {

		if( ok ) {

			var resizeOption = this.panel.getToggleButtonId( "option" );
			this.result.resizeOption = resizeOption;

			console.log("result=");
			console.log( this.result );

			this.okObj[ this.okMethod ]( this.result );
		}

		this.layout.removeDialog( this.panel.id );
		this.panel = null;

		this.renderObj[ this.renderMethod ];
	}


	handleSlider( id, value ) {
		console.log("handleSlider");
		console.log(id);
		console.log(value);

		if( id == 'width' && this.lockFlag ) {
			this.valueH.setValue( value * this.aspectRatioH );
			this.sliderHbutton.renderButton();
		}
		if( id == 'height' && this.lockFlag ) {
			this.valueW.setValue( value * this.aspectRatioW );
			this.sliderWbutton.renderButton();
		}

		this.result={ w: this.valueW.getValue(), h: this.valueH.getValue() };

	}

	unlock() {
		this.lockFlag = false;
	}

	lock() {
		this.lockFlag = true;
		var W =  this.valueW.getValue();
		var H =  this.valueH.getValue();
		this.aspectRatioW = W / H;
		this.aspectRatioH = H / W;

	}

}


class SavePictureOptionsDialog {

	constructor( _layout, _okdialogfunction, _renderFunction ) {

		this.SCRW = _layout.scrW;
		this.SCRH = _layout.scrH;
		this.layout = _layout;
		this.renderObj = _renderFunction.obj;
		this.renderMethod = _renderFunction.method;
		this.okObj = _okdialogfunction.obj;
		this.okMethod = _okdialogfunction.method;
		this.panel = null;
		this.gridW = _layout.gridW;
		this.gridH = _layout.gridH;

		this.titleStyle = "bold 14px Arial";
		this.groupStyle = "bold 12px Arial";

		this.result={ w: this.SCRW, h: this.SCRH };

		var opt;

		this.options = [];
		opt = this.options;

		opt.push({grp: true, name: "Options"});
		opt.push({id: "none", 			txt: "None", label: "Transparency"});
		opt.push({id: "background", txt: "Background Color", label: ""});

	}


	popUp() {
		var row = 0;
		var b;
		var panel = new Dialog(
			"SaveOptionsDialog",
			"Select Save Options",
			this.SCRW, this.SCRH,
			300 , 175,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		var subpaneldef = [];
		subpaneldef.push(
			{
				target: "root",
				label: "options",
				def: this.options
			}
		);

		for( var p=0; p<subpaneldef.length; p++ ) {
			var spd = subpaneldef[ p ];
			b = [];
			row = 0;
			var arr = spd.def;
			var labl = spd.label;
			for( var i=0; i<arr.length; i++ ) {
				var opt = arr[ i ];
				if( opt.grp == true ) {
					if( i>0 ) {
						row++;
					}

					var style = this.groupStyle;
					if( i == 0 ) {
						style = this.titleStyle;
					}
					b.push(
						new TextLabel( labl + i,
							PANEL_LEFTALIGN,row,
							4,
							opt.txt,
							style
					));
				}
				else {
					b.push(
						new TextLabel( labl + i,
							PANEL_LEFTALIGN,row,
							4,
							opt.label,
							style
					));

					b.push(
						new Button( opt.id , PANEL_LEFTALIGN,row,
							6, 1,
							PPAINTR_BTYPE_TOGGLE,
							{txt: opt.txt}  ,
							"options", this,  null
							));
				}

				row ++;

			}

			panel.setButtons( b, spd.target );
		}

		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog( this.panel );
	}

	popDown( ok ) {

		if( ok ) {

			var saveOption = this.panel.getToggleButtonId( "options" );

			this.result = {};
			this.result.transparency = saveOption;

			this.okObj[ this.okMethod ]( this.result );
		}

		this.layout.removeDialog( this.panel.id );
		this.panel = null;

		this.renderObj[ this.renderMethod ];
	}

}

class tilesSettingsDialog {

	constructor( _layout, _okdialogfunction, _renderFunction, tilew, tileh ) {

			this.id = 0;

			this.SCRW = _layout.scrW;
			this.SCRH = _layout.scrH;
			this.layout = _layout;
			this.renderObj = _renderFunction.obj;
			this.renderMethod = _renderFunction.method;
			this.okObj = _okdialogfunction.obj;
			this.okMethod = _okdialogfunction.method;
			this.panel = null;
			this.gridW = _layout.gridW;
			this.gridH = _layout.gridH;

			this.SCRW = _layout.scrW;
			this.SCRH = _layout.scrH;
			this.layout = _layout;
			this.renderObj = _renderFunction.obj;
			this.renderMethod = _renderFunction.method;
			this.okObj = _okdialogfunction.obj;
			this.okMethod = _okdialogfunction.method;
			this.panel = null;
			this.gridW = _layout.gridW;
			this.gridH = _layout.gridH;

			this.titleStyle = "bold 14px Arial";
			this.groupStyle = "bold 12px Arial";

			this.result={ value: this.integerValue };

			this.integerValueW = tilew;
			this.integerValueH = tileh;

			this.valueW = new SliderButtonValue( this.integerValueW, 16, 255, 1 );
			this.valueH = new SliderButtonValue( this.integerValueH, 16, 255, 1 );


		}

		popUp() {
			var row = 0;
			var b = [];

			var panel = new Dialog(
				"TileSettingsDialog" + this.id++,
				"Tile Settings",
				this.SCRW, this.SCRH,
				350 , 4*this.gridH ,
				this.gridW, this.gridH,
				this, "popDown",
				this.renderObj, this.renderMethod
			);

			var buttn;

			buttn = new Button(   this.id++,
				PANEL_LEFTALIGN,row,
				4, 1,
				PPAINTR_BTYPE_TEXT,
				{txt: "Tile Width:", txtStyle: "12px Arial" }  ,
				null, this,  null
			);
			buttn.noborder = true;

			b.push( buttn	);
			b.push( new Separator( this.id++, PANEL_LEFTALIGN, row ) );

			b.push(
					new SliderButton( "YesNoDialogSlider" + this.id++,
					 	PANEL_LEFTALIGN,row,
						8, .5,
						PPAINTR_BTYPE_HSLIDER,
						this.valueW, null, null ));

			row++;

			buttn = new Button(   this.id++,
				PANEL_LEFTALIGN,row,
				4, 1,
				PPAINTR_BTYPE_TEXT,
				{txt: "Tile Height:", txtStyle: "12px Arial" }  ,
				null, this,  null
			);
			buttn.noborder = true;
			b.push( buttn	);

			b.push( new Separator( this.id++, PANEL_LEFTALIGN, row ) );

			b.push(
					new SliderButton( "TilesSettings" + this.id++,
					 	PANEL_LEFTALIGN,row,
						8, .5,
						PPAINTR_BTYPE_HSLIDER,
						this.valueH, null, null ));

		  panel.setButtons( b, "root" );

			panel.placeButtons();

			this.panel = panel;
			this.layout.addDialog( this.panel );
		}

		popDown( ok ) {

			if( ok ) {
				var result = {
					tilesW: this.valueW.getValue(),
					tilesH: this.valueH.getValue()
				}

				console.log( "popDown" );
				console.log( this.integerValueW );

				this.okObj[ this.okMethod ]( result );
			}

			this.layout.removeDialog( this.panel.id );
			this.panel = null;

			this.renderObj[ this.renderMethod ];
		}
}

class showImageDialog {

	constructor( _layout, _title, _shortCutsImage, _renderFunction ) {

		this.id = 0;

		this.title = _title;
		this.SCRW = _layout.scrW;
		this.SCRH = _layout.scrH;
		this.image = _shortCutsImage;
		this.panel = null;
		this.gridW = _layout.gridW;
		this.gridH = _layout.gridH;
		this.imgW = _shortCutsImage.iImageStrip.imageW;
		this.imgH = _shortCutsImage.iImageStrip.imageH;
		this.layout = _layout;
		this.renderObj = _renderFunction.obj;
		this.renderMethod = _renderFunction.method;

	}

	popDown( ok ) {

			this.layout.removeDialog( this.panel.id );
			this.panel = null;

			this.renderObj[ this.renderMethod ];
	}

	popUp() {

		var b=[];

		var bWidth = this.imgW / this.gridW;
		var bHeight = this.imgH / this.gridH;

		var panel = new Dialog(
			"showImageDialog" + this.id++,
			this.title,
			this.SCRW, this.SCRH,
			this.imgW + 10 , this.imgH + 36+ 36 ,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		var buttn = new Button(   this.id++,
			PANEL_LEFTALIGN,0,
			bWidth, bHeight,
			PPAINTR_BTYPE_INFOAREA,
			{ico: this.image } ,
			null, this,  null
		);
		buttn.noborder = false;

		b.push( buttn	);
		panel.setButtons( b, "root" );
		panel.placeButtons();
		this.panel = panel;
		this.layout.addDialog( this.panel );
		panel.updateRender();

	}

}

class brushScaleDialog {

	constructor( _layout, _okdialogfunction, _renderFunction, brushw, brushh ) {

			console.log( "brushw=" + brushw);
			console.log( "brushh=" + brushh);

			this.id = 0;

			this.SCRW = _layout.scrW;
			this.SCRH = _layout.scrH;
			this.layout = _layout;
			this.renderObj = _renderFunction.obj;
			this.renderMethod = _renderFunction.method;
			this.okObj = _okdialogfunction.obj;
			this.okMethod = _okdialogfunction.method;
			this.panel = null;
			this.gridW = _layout.gridW;
			this.gridH = _layout.gridH;

			this.titleStyle = "bold 14px Arial";
			this.groupStyle = "bold 12px Arial";

			this.result={ value: this.integerValue };

			this.integerValueW = brushw;
			this.integerValueH = brushh;
			this.aspecyRatio = brushw / brushh;

			var maxx = 256;
			if( brushw > 128 ) {
				maxx = brushw * 2;
			}
			var maxy = 256;
			if( brushh > 128 ) {
				maxy = brushh * 2;
			}

			this.valueW = new SliderButtonValue( this.integerValueW, 1, maxx, 1 );
			this.valueH = new SliderButtonValue( this.integerValueH, 1, maxy, 1 );
		}


		popUp() {
			var row = 0;
			var b = [];

			var sliderHandler = {
				obj: this,
				method: 'handleSlider'
			}

			var panel = new Dialog(
				"BrushScaleDialog" + this.id++,
				"Scale Brush",
				this.SCRW, this.SCRH,
				350 , 8*this.gridH ,
				this.gridW, this.gridH,
				this, "popDown",
				this.renderObj, this.renderMethod
			);

			var buttn;

			buttn = new Button(   this.id++,
				PANEL_LEFTALIGN,row,
				4, 1,
				PPAINTR_BTYPE_TEXT,
				{txt: "Brush Width:", txtStyle: "12px Arial" }  ,
				null, this,  null
			);
			buttn.noborder = true;

			b.push( buttn	);
			b.push( new Separator( this.id++, PANEL_LEFTALIGN, row ) );

			this.sliderWbutton =
					new SliderButton( "BSizeSlider" + this.id++,
					 	PANEL_LEFTALIGN,row,
						8, .5,
						PPAINTR_BTYPE_HSLIDER,
						this.valueW, 'width', sliderHandler );

			b.push( this.sliderWbutton );
			row++;

			buttn = new Button(   this.id++,
				PANEL_LEFTALIGN,row,
				4, 1,
				PPAINTR_BTYPE_TEXT,
				{txt: "Brush Height:", txtStyle: "12px Arial" }  ,
				null, this,  null
			);
			buttn.noborder = true;
			b.push( buttn	);

			b.push( new Separator( this.id++, PANEL_LEFTALIGN, row ) );

			this.sliderHbutton =
					new SliderButton( "BSizeSlider" + this.id++,
					 	PANEL_LEFTALIGN,row,
						8, .5,
						PPAINTR_BTYPE_HSLIDER,
						this.valueH, 'height', sliderHandler );
			b.push( this.sliderHbutton );

			row++;
		  b.push( new Separator( this.id++, PANEL_LEFTALIGN, row ) );

			this.lockFlag = false;
			row++;
			b.push(
				new TextLabel(  + this.id++,
					PANEL_LEFTALIGN,row,4,
					"Aspect Ration", "12px Arial"
			));

			b.push(
				new Button(  "scale.unlock" ,
					PANEL_LEFTALIGN,row,
					4, 1,
					PPAINTR_BTYPE_TOGGLE,
					{txt: "Unlock" }  ,
					"scale.option", this,  'unlock'
					));

			row++;
			b.push(
				new TextLabel( this.id++,
					PANEL_LEFTALIGN,row,4,
					"", ""
			));

			b.push(
				new Button( "scale.lock" ,
					PANEL_LEFTALIGN,row,
					4, 1,
					PPAINTR_BTYPE_TOGGLE,
					{txt: "Lock" }  ,
					"scale.option", this,  'lock'
					));

		  panel.setButtons( b, "root" );
			panel.placeButtons();

			this.panel = panel;
			this.layout.addDialog( this.panel );

			panel.selectToggleButton( 'scale.option', 'scale.lock');
			panel.updateRender();

			this.lock();
		}


		popDown( ok ) {

			if( ok ) {
				var result = {
					brushW: this.valueW.getValue(),
					brushH: this.valueH.getValue()
				}

				console.log( "popDown" );
				console.log( this.integerValueW );

				this.okObj[ this.okMethod ]( result );
			}

			this.layout.removeDialog( this.panel.id );
			this.panel = null;

			this.renderObj[ this.renderMethod ];
		}


		handleSlider( id, value ) {
			console.log("handleSlider");
			console.log(id);
			console.log(value);

			if( id=='width' && this.lockFlag) {
				this.valueH.setValue( value * this.aspectRatioH );
				this.sliderHbutton.renderButton();

			}
			if( id=='height' && this.lockFlag) {
				this.valueW.setValue( value * this.aspectRatioW );
				this.sliderWbutton.renderButton();

			}
		}

		unlock() {
			this.lockFlag = false;
		}

		lock() {
			this.lockFlag = true;
			var brushW =  this.valueW.getValue();
			var brushH =  this.valueH.getValue();
			this.aspectRatioW = brushW / brushH;
			this.aspectRatioH = brushH / brushW;

		}
}


class paletteEditDialog {

	constructor( _layout, _okdialogfunction, _renderFunction, _icons, rgbpalette, _colIndex ) {

			this.id = 0;

			this.rgbpalette = rgbpalette;
			this.SCRW = _layout.scrW;
			this.SCRH = _layout.scrH;
			this.layout = _layout;
			this.renderObj = _renderFunction.obj;
			this.renderMethod = _renderFunction.method;
			this.okObj = _okdialogfunction.obj;
			this.okMethod = _okdialogfunction.method;
			this.panel = null;
			this.gridW = _layout.gridW;
			this.gridH = _layout.gridH;

			this.SCRW = _layout.scrW;
			this.SCRH = _layout.scrH;
			this.layout = _layout;
			this.renderObj = _renderFunction.obj;
			this.renderMethod = _renderFunction.method;
			this.okObj = _okdialogfunction.obj;
			this.okMethod = _okdialogfunction.method;
			this.panel = null;
			this.gridW = _layout.gridW;
			this.gridH = _layout.gridH;
			this.icons = _icons;

			this.titleStyle = "bold 14px Arial";
			this.groupStyle = "bold 12px Arial";

			this.result={ value: this.integerValue };

			this.valueR = new SliderButtonValue( 0, 0, 255, 1 );
			this.valueG = new SliderButtonValue( 0, 0, 255, 1 );
			this.valueB = new SliderButtonValue( 0, 0, 255, 1 );
			this.valueH = new SliderButtonValue( 0, 0, 360, 1 );
			this.valueS = new SliderButtonValue( 0, 0, 100, 1 );
			this.valueV = new SliderButtonValue( 0, 0, 100, 1 );

			this.sliderHandler = { obj: this, method: 'handleSliderChange' }
			this.compControlWidth = 1;

			this.rgb = this.rgbpalette[ 0 ];
			this.makeGradient = false;
			this.makeCopy = false;

			this.colIndex = _colIndex;

			this.colorBox = new ColorBox();

		}

		flagMakeGradient() {
				var i = i = parseInt( this.panel.getToggleButtonId ( "colorbuttons" ).split(":")[1] );
				this.makeGradient = true;
				this.makeCopy = false;
				this.gradientFrom = i;
		}

		flagCopyTo() {
				var i = i = parseInt( this.panel.getToggleButtonId ( "colorbuttons" ).split(":")[1] );
				this.makeCopy = true;
				this.makeGradient = false;
				this.copyFrom = i;
		}

		selectFromPalette( bid ) {
				var i = parseInt( this.panel.getToggleButtonId ( "colorbuttons" ).split(":")[1] );
				console.log( i );

				this.rgb = this.colRenderers[ i ].getColor();

				this.hsv = this.colorBox.RGBtoHSV( this.rgb.r, this.rgb.g, this.rgb.b );

				this.valueH.setValue( this.hsv.h);
				this.valueS.setValue( this.hsv.s * 100);
				this.valueV.setValue( this.hsv.v * 100);

				this.buttonH.renderButton();
				this.buttonS.renderButton();
				this.buttonV.renderButton();

				this.valueR.setValue( this.rgb.r);
				this.valueG.setValue( this.rgb.g);
				this.valueB.setValue( this.rgb.b);

				this.buttonR.renderButton();
				this.buttonG.renderButton();
				this.buttonB.renderButton();

				this.indicator.setColor( this.rgb );
				this.indicatorButton.renderButton();

				if( this.makeCopy ) {
					var from = this.copyFrom;
					var to = i;
					var rgbFrom = this.colRenderers[ from ].getColor( from );

					var newRGB = {
						r: rgbFrom.r,
						g: rgbFrom.g,
						b: rgbFrom.b
					}

					this.colRenderers[ to ].setColor( newRGB );
					this.colButtons[ to ].renderButton();

					this.makeCopy = false;

					/* Select the button, after we changed the color, update sliders */
					this.selectFromPalette( "color:" + i );

				}
				else if( this.makeGradient ) {

					var from = this.gradientFrom;
					var to = i;
					var delta = to - from;
					if( delta < 0 ) {
						delta = -delta;
						var tmp = to;
						to = from;
						from = tmp;
					}

					var rgbFrom = this.colRenderers[ from ].getColor( from );
					var rgbTo = this.colRenderers[ to ].getColor( to );

					var rD = (rgbTo.r - rgbFrom.r ) / delta;
					var gD = (rgbTo.g - rgbFrom.g ) / delta;
					var bD = (rgbTo.b - rgbFrom.b ) / delta;

					var rr = rgbFrom.r + rD;
					var gg = rgbFrom.g + gD;
					var bb = rgbFrom.b + bD;

					console.log( "from=" + from );
					console.log( "to=" + to );
					for( var ci = (from+1); ci< to; ci++  ) {

						console.log( "ci=" + ci );

						var newRGB = {
							r: Math.round(rr),
							g: Math.round(gg),
							b: Math.round(bb)
						}

						this.colRenderers[ ci ].setColor( newRGB );
						this.colButtons[ ci ].renderButton();

						rr += rD;
						gg += gD;
						bb += bD;
					}

					this.makeGradient = false;
			}
		}

		handleSliderChange( sig, slidervalue ) {

					this.hsv = {};
					var colChange = false;
					var rgb = false;
					if( sig == "RED" ) {
						this.rgb.r = slidervalue; colChange = true;
						this.rgb.g = this.valueG.getValue();
						this.rgb.b = this.valueB.getValue();
						rgb = true;
					}
					else if( sig == "GREEN" ) {
						this.rgb.g = slidervalue; colChange = true;
						this.rgb.r = this.valueR.getValue();
						this.rgb.b = this.valueB.getValue();
						rgb = true;
					}
					else if( sig == "BLUE" ) {
						this.rgb.b = slidervalue; colChange = true;
						this.rgb.r = this.valueR.getValue();
						this.rgb.g = this.valueG.getValue();
						rgb = true;
					}
					else if( sig == "HUE" ) {
						this.hsv.h = slidervalue;
						this.hsv.s = this.valueS.getValue() / 100;
						this.hsv.v = this.valueV.getValue() / 100;

						colChange = true;
						rgb = false;
					}
					else if( sig == "SATURATION" ) {
						this.hsv.h = this.valueH.getValue();
						this.hsv.s = slidervalue / 100;
						this.hsv.v = this.valueV.getValue() / 100;
						colChange = true;
						rgb = false;
					}
					else if( sig == "VALUE" ) {
						this.hsv.h = this.valueH.getValue();
						this.hsv.s = this.valueS.getValue() / 100;
						this.hsv.v = slidervalue / 100;

						colChange = true;
						rgb = false;
					}

					if( colChange ) {

						if( rgb ) {
							var hsv = this.colorBox.RGBtoHSV( this.rgb.r, this.rgb.g, this.rgb.b );

							this.valueH.setValue( hsv.h);
							this.valueS.setValue( hsv.s * 100);
							this.valueV.setValue( hsv.v * 100);

							this.buttonH.renderButton();
							this.buttonS.renderButton();
							this.buttonV.renderButton();

						}
						else {
							var rgb = this.colorBox.HSVtoRGB( this.hsv.h, this.hsv.s, this.hsv.v );
							this.rgb = rgb;

							this.valueR.setValue( rgb.r);
							this.valueG.setValue( rgb.g);
							this.valueB.setValue( rgb.b);

							this.buttonR.renderButton();
							this.buttonG.renderButton();
							this.buttonB.renderButton();
						}

						this.indicator.setColor( this.rgb );
						this.indicatorButton.renderButton();

						var i = this.panel.getToggleButtonId ( "colorbuttons" ).split(":")[1];
						this.colRenderers[ i ].setColor( this.rgb );
						this.colButtons[ i ].renderButton();


					}

		}

		label( text, row ) {

			var style1 = "12px Arial";

			return new TextLabel(
				"palettelbl"+(this.id++),
				PANEL_LEFTALIGN,row,
				this.compControlWidth ,
				text, style1 );
		}

		vSlider( value, row, sig ) {

			return(
						new SliderButton( "ColSlider" + this.id++,
							PANEL_LEFTALIGN,row,
							this.compControlWidth , 8,
							PPAINTR_BTYPE_VSLIDER,
							value,
							sig,
							this.sliderHandler ));

		}

		separator( row ) {
			var s = new Separator( this.id++, PANEL_LEFTALIGN, row );
			s.setWidth( 1 );
			return s;
		}

		popUp() {
			var row = 0;
			var b = [];
			var lablsize = 1;

			var panel = new Dialog(
				"PaletteEditor" + this.id++,
				"Edit Palette",
				this.SCRW, this.SCRH,
				300 , 16*this.gridH ,
				this.gridW, this.gridH,
				this, "popDown",
				this.renderObj, this.renderMethod
			);

			var buttn;
			var id = 0;

			b.push( this.label('R', row) );
			b.push( this.label('G', row) );
			b.push( this.label('B', row) );
			b.push( this.separator( row )  );
			b.push( this.label('H', row) );
			b.push( this.label('S', row) );
			b.push( this.label('V', row) );

			row++;

			this.buttonR = this.vSlider(this.valueR, row, "RED");
			b.push( this.buttonR );

			this.buttonG = this.vSlider(this.valueG, row, "GREEN");
			b.push( this.buttonG );

			this.buttonB = this.vSlider(this.valueB, row, "BLUE");
			b.push( this.buttonB );

			b.push( this.separator( row )  );

			this.buttonH = this.vSlider(this.valueH, row, "HUE");
			b.push( this.buttonH ) ;
			this.buttonS = this.vSlider(this.valueS, row, "SATURATION");
			b.push( this.buttonS ) ;
			this.buttonV = this.vSlider(this.valueV, row, "VALUE");
			b.push( this.buttonV ) ;

			b.push( this.separator( row )  );

			var colIndicatorW = 64;
			var colIndicatorH = 64;
			var cir = new ColorButtonRenderer (
				panel.getContext(), 0, 0, 0,
				0,0,colIndicatorW,colIndicatorH,
				null, null);

			this.indicator = cir;

			this.indicatorButton =
				new Button(
						this.id++,
						PANEL_LEFTALIGN,row,
						colIndicatorW/this.gridW, colIndicatorH/this.gridH,
						PPAINTR_BTYPE_INFOAREA,
						{robj: cir },
						null, null, null
				);
			b.push( this.indicatorButton );

			row=10;

			var colbuttonW = 18;
			var colbuttonH = 24;
			this.colRenderers = [];
			this.colButtons = [];
			for( var i=0; i< 32; i++ ) {

				if( i == 16 ) {row ++; }

				var rgb = this.rgbpalette[ i ];

				this.colRenderers[ i ] = new ColorButtonRenderer (
					panel.getContext(), rgb.r, rgb.g, rgb.b,
					0,0,colbuttonW,colbuttonH,
					null);

				this.colButtons[ i ] = new Button(
						"color:" + i,
						PANEL_LEFTALIGN,row,
						colbuttonW/this.gridW, colbuttonH/this.gridH,
						PPAINTR_BTYPE_TOGGLE,
						{robj: this.colRenderers[ i ] },
						"colorbuttons", this, 'selectFromPalette'
				);

				b.push( this.colButtons[ i ] );

			}

			row++;
			b.push(
				new Button(
						"CopyTo",
						PANEL_LEFTALIGN,row,
						5, .85,
						PPAINTR_BTYPE_CLICK,
						{txt: 'Copy to', ico: this.icons['copyto'] },
						null, this, 'flagCopyTo'
				)
			);


			b.push(
				new Button(
						"Gradient",
						PANEL_LEFTALIGN,row,
						5, .85,
						PPAINTR_BTYPE_CLICK,
						{txt: 'Gradient to', ico: this.icons['gradient'] },
						null, this, 'flagMakeGradient'
				)
			);

		  panel.setButtons( b, "root" );
			panel.placeButtons();

			this.panel = panel;
			this.layout.addDialog( this.panel );

			this.layout.handlePanelsAutoClickEvent( "color:" + this.colIndex );
			//this.panelsManager.handlePanelsAutoClickEvent(

			this.selectFromPalette("left");
		}


		popDown( ok ) {

			if( ok ) {
				var result = [];

				for( var i=0; i<this.colRenderers.length; i++ ) {
						var rgb = this.colRenderers[i].getColor();
						console.log( "addColortoResult" );
						result.push( rgb );
				}

				console.log( "popDown" );
				this.okObj[ this.okMethod ]( result );
			}

			this.layout.removeDialog( this.panel.id );
			this.panel = null;

			this.renderObj[ this.renderMethod ];
		}
}

class YesNoDialog {

	constructor( _layout, _question, _okdialogfunction, _renderFunction ) {

			this.SCRW = _layout.scrW;
			this.SCRH = _layout.scrH;
			this.layout = _layout;
			this.question = _question;
			this.renderObj = _renderFunction.obj;
			this.renderMethod = _renderFunction.method;
			this.okObj = _okdialogfunction.obj;
			this.okMethod = _okdialogfunction.method;
			this.panel = null;
			this.gridW = _layout.gridW;
			this.gridH = _layout.gridH;

			this.SCRW = _layout.scrW;
			this.SCRH = _layout.scrH;
			this.layout = _layout;
			this.renderObj = _renderFunction.obj;
			this.renderMethod = _renderFunction.method;
			this.okObj = _okdialogfunction.obj;
			this.okMethod = _okdialogfunction.method;
			this.panel = null;
			this.gridW = _layout.gridW;
			this.gridH = _layout.gridH;

			this.titleStyle = "bold 14px Arial";
			this.groupStyle = "bold 12px Arial";

			this.result={ w: this.SCRW, h: this.SCRH };

			this.id = 0;

		}

		popUp() {
			var row = 0;
			var b = [];

			var panel = new Dialog(
				"YesNoDialog" + this.id,
				"Alert",
				this.SCRW, this.SCRH,
				800 , 150,
				this.gridW, this.gridH,
				this, "popDown",
				this.renderObj, this.renderMethod
			);

			var lines = this.question.split("\n");

			for( var i=0; i<lines.length; i++) {
				b.push(

					new TextLabel( "YesNoDialogTxt" + this.id,
						PANEL_LEFTALIGN,row,
						20,
						lines[ i ] ,
						null
				));

				row ++;
				this.id++;
			}

			panel.setButtons( b, "root" );
			panel.placeButtons();

			this.panel = panel;
			this.layout.addDialog( this.panel );
		}

		popDown( ok ) {

			if( ok ) {

				this.okObj[ this.okMethod ]( null );
			}

			this.layout.removeDialog( this.panel.id );
			this.panel = null;

			this.renderObj[ this.renderMethod ];
		}
}

class ColourSelectDialog {}
