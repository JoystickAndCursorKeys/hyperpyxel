class SelectResolutionDialog {

	constructor(_layout, _curRes, _okdialogfunction, _renderFunction) {

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

		this.result = { w: this.currentRes.W, h: this.currentRes.H };

		this.colorBox = new ColorBox();

		var res;

		this.retro = [];
		res = this.retro;
		res.push({ grp: true, name: "Retro Style Resolutions" });
		res.push({ res: '320x200', name: "CGA" });
		res.push({ res: '640x480', name: "VGA" });
		res.push({ grp: true, name: "C64" });
		res.push({ res: '160x200', name: "Multi Color" });
		res.push({ res: '320x200', name: "Hires" });
		res.push({ grp: true, name: "Amiga Lowres" });
		res.push({ res: '320x200', name: "NTSC" });
		res.push({ res: '320x256', name: "PAL" });
		res.push({ res: '320x400', name: "NTSC Interlace" });
		res.push({ res: '320x512', name: "PAL Interlace" });
		res.push({ grp: true, name: "Amiga Hires" });
		res.push({ res: '640x200', name: "NTSC" });
		res.push({ res: '640x256', name: "PAL" });
		res.push({ res: '640x400', name: "NTSC Interlace" });
		res.push({ res: '640x512', name: "PAL Interlace" });

		this.modern = [];
		res = this.modern;

		res.push({ grp: true, name: "Resolutions" });
		res.push({ res: this.currentRes.W + "x" + this.currentRes.H, name: "\"Current\"" });
		res.push({ res: this.SCRW + "x" + this.SCRH, name: "\"Fit Screen\"" });
		res.push({ grp: true, name: "VGA" });
		res.push({ res: '800x600', name: "SVGA" });
		res.push({ res: '1024x600', name: "WSVGA" });
		res.push({ res: '1024x768', name: "XGA" });
		res.push({ res: '1280x800', name: "WXVGA" });
		res.push({ grp: true, name: "Pixel" });
		res.push({ res: '1280x720', name: "720p HD" });
		res.push({ res: '1920x1080', name: "1080p Full HD" });
		res.push({ res: '2560x1440', name: "1440p" });
		res.push({ res: '3840x2160', name: "4K" });
		res.push({ grp: true, name: "Smartphone" });
		res.push({ res: '1080x1920', name: "Resolution 1" });
		res.push({ res: '750x1334', name: "Resolution 2" });
		res.push({ res: '720x1280', name: "Resolution 3" });


	}


	popUp() {
		var row = 0;
		var b;
		var panel = new Dialog(
			"SelectResolutionDialog",
			"Select Image Resolution",
			this.SCRW, this.SCRH,
			800, 670,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		panel.makeSubPanelAuto("left", SPANEL_THIRDLEFT);
		panel.makeSubPanelAuto("middle", SPANEL_THIRDMIDDLE);
		panel.makeSubPanelAuto("right", SPANEL_THIRDRIGHT);

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

		for (var p = 0; p < subpaneldef.length; p++) {
			var spd = subpaneldef[p];
			b = [];
			row = 0;
			var arr = spd.def;
			var labl = spd.label;
			for (var i = 0; i < arr.length; i++) {
				var res = arr[i];
				if (res.grp == true) {
					if (i > 0) {
						row++;
					}

					var style = this.groupStyle;
					if (i == 0) {
						style = this.titleStyle;
					}
					b.push(
						new TextLabel(labl + i,
							PANEL_LEFTALIGN, row, 4,
							res.name, style
						));
				}
				else {
					b.push(

						new TextLabel(labl + i,
							PANEL_LEFTALIGN, row, 4,
							res.name, this.groupStyle

						));

					b.push(
						new Button(res.res, PANEL_LEFTALIGN, row,
							4, 1,
							PPAINTR_BTYPE_CLICK,
							{ txt: res.res },
							"res", this, "changeRes"
						));
				}

				row++;

			}

			panel.setButtons(b, spd.target);
		}


		b = [];
		row = 0;

		b.push(

			new TextLabel("options",
				PANEL_LEFTALIGN, row, 4,
				"Resize Options", this.titleStyle

			));
		row++;

		this.addOption(b, row, "pixelresize", "Pixel Resize"); row++;
		this.addOption(b, row, "resize", "Resize"); row++;
		this.addOption(b, row, "clip", "Clip"); row++;


		var s = new Separator(this.id++, PANEL_LEFTALIGN, row++);
		b.push(s);


		b.push(
			new TextLabel(+ this.id++,
				PANEL_LEFTALIGN, row, 4,
				"Aspect Ration", "12px Arial"
			));

		b.push(
			new Button("scale.unlock",
				PANEL_LEFTALIGN, row,
				4, 1,
				PPAINTR_BTYPE_TOGGLE,
				{ txt: "Unlock" },
				"scale.option", this, 'unlock'
			));

		row++;
		b.push(
			new TextLabel(this.id++,
				PANEL_LEFTALIGN, row, 4,
				"", ""
			));

		b.push(
			new Button("scale.lock",
				PANEL_LEFTALIGN, row,
				4, 1,
				PPAINTR_BTYPE_TOGGLE,
				{ txt: "Lock" },
				"scale.option", this, 'lock'
			));

		row++;
		var s = new Separator(this.id++, PANEL_LEFTALIGN, row++);
		b.push(s);


		var sliderHandler = {
			obj: this,
			method: 'handleSlider'
		}

		var maxW = 2840;
		if (this.currentRes.W > maxW) { maxW = this.currentRes.W; }
		var maxH = 2560;
		if (this.currentRes.H > maxH) { maxH = this.currentRes.H; }

		this.valueW = new SliderButtonValue(this.currentRes.W, 1, maxW, 1);
		this.valueH = new SliderButtonValue(this.currentRes.H, 1, maxH, 1);

		this.aspectRatioW = this.currentRes.W / this.currentRes.H;
		this.aspectRatioH = this.currentRes.H / this.currentRes.W;

		s = new Separator(this.id++, PANEL_LEFTALIGN, row);
		s.setWidth(1);
		b.push(s);


		this.sliderWbutton =
			new SliderButton("BSizeSlider" + this.id++,
				PANEL_LEFTALIGN, row,
				2.5, 12,
				PPAINTR_BTYPE_VSLIDER,
				this.valueW, 'width', sliderHandler);

		b.push(this.sliderWbutton);

		s = new Separator(this.id++, PANEL_LEFTALIGN, row);
		s.setWidth(3);
		b.push(s);

		this.sliderHbutton =
			new SliderButton("BSizeSlider" + this.id++,
				PANEL_LEFTALIGN, row,
				2.5, 12,
				PPAINTR_BTYPE_VSLIDER,
				this.valueH, 'height', sliderHandler);

		b.push(this.sliderHbutton);

		panel.setButtons(b, "left");

		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog(this.panel);

		panel.selectToggleButton('scale.option', 'scale.lock');
		panel.updateRender();

	}

	addOption(buttns, row, id, title) {

		buttns.push(
			new Button("sep" + id,
				PANEL_LEFTALIGN, row,
				.5, 1, PPAINTR_BTYPE_SEPARATOR, null, null, this, null
			));

		buttns.push(
			new Button(id,
				PANEL_LEFTALIGN, row,
				8, 1,
				PPAINTR_BTYPE_TOGGLE,
				{ txt: title },
				"option", this, null
			));

	}

	changeRes(bid, bttnId) {

		console.log(bttnId);

		var wh = bttnId.split("x");

		this.valueW.setValue(wh[0]);
		this.valueH.setValue(wh[1]);
		this.sliderWbutton.renderButton();
		this.sliderHbutton.renderButton();

		this.result = { w: this.valueW.getValue(), h: this.valueH.getValue() };


	}

	popDown(ok) {

		if (ok) {

			var resizeOption = this.panel.getToggleButtonId("option");
			this.result.resizeOption = resizeOption;

			console.log("result=");
			console.log(this.result);

			this.okObj[this.okMethod](this.result);
		}

		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod];
	}


	handleSlider(id, value) {
		console.log("handleSlider");
		console.log(id);
		console.log(value);

		if (id == 'width' && this.lockFlag) {
			this.valueH.setValue(value * this.aspectRatioH);
			this.sliderHbutton.renderButton();
		}
		if (id == 'height' && this.lockFlag) {
			this.valueW.setValue(value * this.aspectRatioW);
			this.sliderWbutton.renderButton();
		}

		this.result = { w: this.valueW.getValue(), h: this.valueH.getValue() };

	}

	unlock() {
		this.lockFlag = false;
	}

	lock() {
		this.lockFlag = true;
		var W = this.valueW.getValue();
		var H = this.valueH.getValue();
		this.aspectRatioW = W / H;
		this.aspectRatioH = H / W;

	}

}

class ExportTileOptionsDialogPreview {

	constructor(w, h, parent, result) {

		this.w = w;
		this.h = h;

		this.col = 0;
		this.row = 0;
		this.result = result;
		this.parent = parent;

		this.maxCol = -1;
		this.maxRow = -1;
	}

	setMaxDimensions(maxCol, maxRow) {
		this.maxCol = maxCol;
		this.maxRow = maxRow;

		console.log("maxCol " + this.maxCol + " maxRow " + this.maxRow);


	}

	draw(ctx, x, y) {

		var size = 9;
		var line = 0;
		var xoff = 4;
		var yoff = 4 + (size * 1.5);
		var yoff0 = 4 + (size * 8);

		ctx.font = size + 'px arial';
		ctx.textBaseline = 'bottom';
		ctx.fillStyle = "#000000";

		var iW, iH;
		iW = this.parent.tilesW;
		iH = this.parent.tilesH;

		var previewW = this.w * .48;
		var previewH = this.h * .48;

		if (this.parent.tilesW < previewW &&
			this.parent.tilesH < previewH) {
			if (2 * this.parent.tilesW < previewW &&
				2 * this.parent.tilesH < previewH) {
				previewW = 2 * iW;
				previewH = 2 * iH;
			}
			else {
				previewW = this.iW;
				previewH = this.iH;
			}
		}


		var tmp = ctx.imageSmoothingEnabled;
		ctx.imageSmoothingEnabled = false;

		ctx.drawImage(this.parent.paintbuffer.canvas,
			//src
			this.parent.tilesW * this.result.colix, this.parent.tilesH * this.result.rowix,
			iW, iH,
			//dst
			x + xoff, y + yoff0,
			previewW, previewH
		);

		ctx.imageSmoothingEnabled = tmp;

		var w = this.w * .33 * .48;
		var h = this.h * .33 * .75;

		for (var yy = -1; yy < 2; yy++) {
			for (var xx = -1; xx < 2; xx++) {
				var X = xx + this.result.colix;
				var Y = yy + this.result.rowix;
				var xxoff = ((xx + 1) * w) + 1 + xoff + x + (this.w * .48);
				var yyoff = ((yy + 1) * h) + 1 + yoff + y;

				if (X < 0 || X > this.maxCol ||
					Y < 0 || Y > this.maxRow) {
					ctx.fillStyle = "#88ee88";
					ctx.fillRect(xxoff, yyoff, w, h);
				}
				else {
					ctx.drawImage(this.parent.paintbuffer.canvas,
						this.parent.tilesW * X,
						this.parent.tilesH * Y,
						iW, iH,
						xxoff, yyoff,
						w, h
					);

					if (xx == 0 && yy == 0) {
						dmCMU.rect(ctx, xxoff, yyoff,
							w, h,
							'rgba(128,255,128,1)', 1);

					}
				}
			}
		}
		ctx.fillStyle = "#000000";

		var tileInfo = "Tile Size: " + this.parent.tilesW + "x" + this.parent.tilesH;

		var tileIndex = "Select Tile: ????";

		if (this.result.rangeType == 'range') {

			tileIndex = "Selected Tiles: " +
				"[" + this.result.range.scolix + "," + this.result.range.srowix + "] -> " +
				"[" + this.result.range.ecolix + "," + this.result.range.erowix + "]";

		}
		else if (this.result.rangeType == 'single') {
			tileIndex = "Selected Tile: " + this.result.colix + "," + this.result.rowix;
		}



		var colorInfo = " " + this.result.coldisplay;
		var colorInfo2 = " " + this.result.coldisplay2;
		var exportInfo = "Export as: ";
		var exportInfo2 = " " + this.result.exportdatatype + " / " + this.result.exportdatapresentation;
		var exportInfo3 = " line starts at " + this.result.datastart + ",step " + this.result.datastep;

		ctx.fillText(tileInfo, x + xoff, y + yoff + (line * size));
		ctx.fillText("Color Info:", x + xoff, y + yoff + ((line + 1) * size));
		ctx.fillText(colorInfo, x + xoff, y + yoff + ((line + 2) * size));
		ctx.fillText(colorInfo2, x + xoff, y + yoff + ((line + 3) * size));
		ctx.fillText(exportInfo, x + xoff, y + yoff + ((line + 4) * size));
		ctx.fillText(exportInfo2, x + xoff, y + yoff + ((line + 5) * size));
		ctx.fillText(exportInfo3, x + xoff, y + yoff + ((line + 6) * size));


		ctx.fillText(tileIndex, (this.w / 2) + x + xoff, y + yoff + (line * size)); //line++;
	}
}



function __ExportTileOptionsDialog_notblack(r, g, b) {
	return r + g + b > 0;
}

function __ExportTileOptionsDialog_iswhite(r, g, b) {
	return (r + g + b) == 255 * 3;
}

function __ExportTileOptionsDialog_getColorIndex(r, g, b, palette) {
	for (var i = 0; i < palette.length && i < 16; i++) {
		var c = palette[i];
		if (c.r == r && c.b == b && c.g == g) {
			return i;
		}
	}
	return 0;
}

class ExportTileOptionsDialog {


	constructor(_layout, _okdialogfunction, _renderFunction, _tileSettingsCallback, parent) {

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
		this.tileSettingsCallback = _tileSettingsCallback;

		this.result = {
			rowix: 0, colix: 0,
			rangeType: 'single',
			range: { srowix: 0, scolix: 0, erowix: 0, ecolix: 0 },
			gridW: 16, gridH: 16,
			isOpaqueFunction: __ExportTileOptionsDialog_notblack,
			getColorIndexFunction: undefined,
			exportdatatype: 'basic',
			exportdatapresentation: 'decimal'
		};

		this.parent = parent;

		this.setFunNotBlack();
		this.setBasicDataDec();
		this.setBasicLN5000Step1();

	}


	popUp() {
		var row = 0;
		var b = [], id = 0;
		var panel = new Dialog(
			"ExportTileOptionsDialog",
			"Export Tile Options (Monochrome)",
			this.SCRW, this.SCRH,
			335, 485,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		var infoW = 13, infoH = 5;

		this.previewRenderer =
			new ExportTileOptionsDialogPreview(
				infoW * this.gridW,
				infoH * this.gridH,
				this.parent,
				this.result);

		this.previewArea = new ToolButton(id++, PANEL_LEFTALIGN, row,
			infoW, infoH, PPAINTR_BTYPE_INFOAREA, { robj: this.previewRenderer }, null, null, null)

		this.previewArea.noborder = false;

		b.push(this.previewArea);
		row += (infoH);

		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row, 4.5));
		b.push(new Button(this.id++,
			PANEL_LEFTALIGN, row,
			2, 1,
			PPAINTR_BTYPE_CLICK,
			{ txt: "Up", txtStyle: "12px Arial" },
			null, this, 'rowMin'
		));
		row++;

		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row, 4.5));
		b.push(new Button(this.id++,
			PANEL_LEFTALIGN, row,
			2, 1,
			PPAINTR_BTYPE_CLICK,
			{ txt: "Down", txtStyle: "12px Arial" },
			null, this, 'rowPlus'
		));
		row++;

		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row, 1.5));
		b.push(new Button(this.id++,
			PANEL_LEFTALIGN, row,
			4, 1,
			PPAINTR_BTYPE_CLICK,
			{ txt: "<---", txtStyle: "12px Arial" },
			null, this, 'colMin'
		));


		b.push(new Button(this.id++,
			PANEL_LEFTALIGN, row,
			4, 1,
			PPAINTR_BTYPE_CLICK,
			{ txt: "--->", txtStyle: "12px Arial" },
			null, this, 'colPlus'
		));

		row++;
		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row));
		row++;

		b.push(new Button(this.id++,
			PANEL_LEFTALIGN, row,
			3.75, 1,
			PPAINTR_BTYPE_TOGGLE,
			{ txt: "Single" },
			"expselect", this, 'setTileModeSingle'
		));

		b.push(new Button(this.id++,
			PANEL_LEFTALIGN, row,
			3.75, 1,
			PPAINTR_BTYPE_TOGGLE,
			{ txt: "Start Range" },
			"expselect", this, 'setTileModeRangeStart'
		));

		b.push(new Button(this.id++,
			PANEL_LEFTALIGN, row,
			3.75, 1,
			PPAINTR_BTYPE_TOGGLE,
			{ txt: "End Range" },
			"expselect", this, 'setTileModeRangeEnd'
		));

		row++;
		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row));
		row++;

		b.push(new Button(this.id++,
			PANEL_LEFTALIGN, row,
			4.75, 1,
			PPAINTR_BTYPE_CLICK,
			{ txt: "Change Tile Size" },
			null, this, 'tileSettings'
		));

		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row));
		//row++;

		var buttonDefs;
		var menumanager;

		buttonDefs = [];
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "Basic, 'DATA' Decimal" }, callfunction: [this, 'setBasicDataDec'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "Basic, 'DATA' Hexadecimal" }, callfunction: [this, 'setBasicDataHex'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "Basic, 'DATA' Decimal with comment" }, callfunction: [this, 'setBasicDataDecRem'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "Basic, 'DATA' Hexadecimal with comment" }, callfunction: [this, 'setBasicDataHexRem'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "Array, [] Hexadecimal" }, callfunction: [this, 'setArrayDataHex'] });

		var format = new ToolButton(id++, PANEL_LEFTALIGN, row, 4.75, 1, PPAINTR_BTYPE_CLICK, { txt: "Export Format" }, null, null, null);
		menumanager = new MenuManager("menu:format", this.gridW * 12, this.gridH,
			buttonDefs, this.renderObj, this.renderMethod);
		format.addMenuManager(menumanager);
		b.push(format);
		row++;

		buttonDefs = [];
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "2 Colors - Not Black as Foreground" }, callfunction: [this, 'setFunNotBlack'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "2 Colors - White as Foreground" }, callfunction: [this, 'setFunIsWhite'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "16 Colors" }, callfunction: [this, 'setFun16Color'] });

		var quickpalette = new ToolButton(id++, PANEL_LEFTALIGN, row, 4.75, 1, PPAINTR_BTYPE_CLICK, { txt: "Color Format" }, null, null, null);
		menumanager = new MenuManager("menu:managequickpalette", this.gridW * 10, this.gridH,
			buttonDefs, this.renderObj, this.renderMethod);
		quickpalette.addMenuManager(menumanager);
		b.push(quickpalette);
		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row));


		buttonDefs = [];
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "1000 step 1" }, callfunction: [this, 'setBasicLN1000Step1'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "1000 step 10" }, callfunction: [this, 'setBasicLN1000Step10'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "2000 step 1" }, callfunction: [this, 'setBasicLN2000Step1'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "2000 step 10" }, callfunction: [this, 'setBasicLN2000Step10'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "3000 step 1" }, callfunction: [this, 'setBasicLN3000Step1'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "3000 step 10" }, callfunction: [this, 'setBasicLN3000Step10'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "4000 step 1" }, callfunction: [this, 'setBasicLN4000Step1'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "4000 step 10" }, callfunction: [this, 'setBasicLN4000Step10'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "5000 step 1" }, callfunction: [this, 'setBasicLN5000Step1'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "5000 step 10" }, callfunction: [this, 'setBasicLN5000Step10'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "6000 step 1" }, callfunction: [this, 'setBasicLN6000Step1'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "6000 step 10" }, callfunction: [this, 'setBasicLN6000Step10'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "7000 step 1" }, callfunction: [this, 'setBasicLN7000Step1'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "7000 step 10" }, callfunction: [this, 'setBasicLN7000Step10'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "8000 step 1" }, callfunction: [this, 'setBasicLN8000Step1'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "8000 step 10" }, callfunction: [this, 'setBasicLN8000Step10'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "9000 step 1" }, callfunction: [this, 'setBasicLN9000Step1'] });
		buttonDefs.push({ type: PPAINTR_BTYPE_CLICK, render: { txt: "9000 step 10" }, callfunction: [this, 'setBasicLN9000Step10'] });

		var format = new ToolButton(id++, PANEL_LEFTALIGN, row, 4.75, 1, PPAINTR_BTYPE_CLICK, { txt: "Line Numbers" }, null, null, null);
		menumanager = new MenuManager("menu:format", this.gridW * 8, this.gridH,
			buttonDefs, this.renderObj, this.renderMethod);
		format.addMenuManager(menumanager);
		b.push(format);

		this.calculateMaxDimensions();

		panel.setButtons(b, "root");
		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog(this.panel);
	}

	setTileModeSingle() {
		this.result.rangeType = 'single';
	}

	setTileModeRangeStart() {
		this.result.rangeType = 'range';
		this.rangeSelect = 'start';
		this.updateRange();
	}

	setTileModeRangeEnd() {
		this.result.rangeType = 'range';
		this.rangeSelect = 'end';
		this.updateRange();
	}

	updateRange() {
		if (this.result.rangeType == 'range') {
			if (this.rangeSelect == 'start') {
				this.result.range.srowix = this.result.rowix;
				this.result.range.scolix = this.result.colix;
				this.render();
			}
			else if (this.rangeSelect == 'end') {
				this.result.range.erowix = this.result.rowix;
				this.result.range.ecolix = this.result.colix;
				this.render();
			}
			else if (this.rangeSelect == 'single') {
				this.result.range.srowix = this.result.rowix;
				this.result.range.scolix = this.result.colix;
				this.result.range.erowix = this.result.rowix;
				this.result.range.ecolix = this.result.colix;
			}

		}
	}

	setFunNotBlack() {
		this.result.colormode = "1bpp";
		this.result.coldisplay = "2 colors";
		this.result.coldisplay2 = "foreground='non black pixels'";
		this.result.isOpaqueFunction = __ExportTileOptionsDialog_notblack;
		this.result.getColorIndexFunction = undefined;
		this.render();
	}

	setFunIsWhite() {
		this.result.colormode = "1bpp";
		this.result.coldisplay = "2 colors";
		this.result.coldisplay2 = "foreground='white pixels'";
		this.result.isOpaqueFunction = __ExportTileOptionsDialog_iswhite;
		this.result.getColorIndexFunction = undefined;
		this.render();
	}

	setFun16Color() {
		this.result.colormode = "4bpp";
		this.result.coldisplay = "16 colors";
		this.result.coldisplay2 = "background='color 0'";
		this.result.getColorIndexFunction = __ExportTileOptionsDialog_getColorIndex;
		this.result.isOpaqueFunction = undefined;
		this.render();
	}

	setBasicLN1000Step1() { this.setBasicDataInfo(1000, 1); }
	setBasicLN1000Step10() { this.setBasicDataInfo(1000, 10); }
	setBasicLN2000Step1() { this.setBasicDataInfo(2000, 1); }
	setBasicLN2000Step10() { this.setBasicDataInfo(2000, 10); }
	setBasicLN3000Step1() { this.setBasicDataInfo(3000, 1); }
	setBasicLN3000Step10() { this.setBasicDataInfo(3000, 10); }
	setBasicLN4000Step1() { this.setBasicDataInfo(4000, 1); }
	setBasicLN4000Step10() { this.setBasicDataInfo(4000, 10); }
	setBasicLN5000Step1() { this.setBasicDataInfo(5000, 1); }
	setBasicLN5000Step10() { this.setBasicDataInfo(5000, 10); }
	setBasicLN6000Step1() { this.setBasicDataInfo(6000, 1); }
	setBasicLN6000Step10() { this.setBasicDataInfo(6000, 10); }
	setBasicLN7000Step1() { this.setBasicDataInfo(7000, 1); }
	setBasicLN7000Step10() { this.setBasicDataInfo(7000, 10); }
	setBasicLN8000Step1() { this.setBasicDataInfo(8000, 1); }
	setBasicLN8000Step10() { this.setBasicDataInfo(8000, 10); }
	setBasicLN9000Step1() { this.setBasicDataInfo(9000, 1); }
	setBasicLN9000Step10() { this.setBasicDataInfo(9000, 10); }

	setBasicDataDec() {
		this.result.exportdatatype = 'basic';
		this.result.exportdatapresentation = 'decimal';
		this.result.comment = false;
		this.render();
	}

	setBasicDataHex() {
		this.result.exportdatatype = 'basic';
		this.result.exportdatapresentation = 'hexadecimal';
		this.result.comment = false;
		this.render();
	}

	setBasicDataDecRem() {
		this.result.exportdatatype = 'basic+comment';
		this.result.exportdatapresentation = 'decimal';
		this.result.comment = true;
		this.render();
	}

	setBasicDataHexRem() {
		this.result.exportdatatype = 'basic+comment';
		this.result.exportdatapresentation = 'hexadecimal';
		this.result.comment = true;
		this.render();
	}

	setArrayDataHex() {
		this.result.exportdatatype = '[]array';
		this.result.exportdatapresentation = 'hexadecimal';
		this.result.comment = true;
		this.render();
	}

	setBasicDataInfo(x, y) {
		this.result.datastart = x; this.result.datastep = y;
		this.render();
	}

	popDown(ok) {

		if (ok) {

			var saveOption = this.panel.getToggleButtonId("options");

			this.okObj[this.okMethod](this.result);
		}

		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod](this.result);
	}

	calculateMaxDimensions() {

		this.maxCols = Math.floor(this.parent.infoRenderer.imgW / this.parent.tilesW);
		this.maxRows = Math.floor(this.parent.infoRenderer.imgH / this.parent.tilesH);

		console.log("maxCols " + this.maxCols + " maxRows " + this.maxRows);

		this.previewRenderer.setMaxDimensions(this.maxCol(), this.maxRow());
	}

	maxRow() { return this.maxRows - 1; }
	maxCol() { return this.maxCols - 1; }

	rowMin() { this.result.rowix--; if (this.result.rowix < 0) { this.result.rowix = 0; }; this.updateRange(); this.render(); }
	rowPlus() { this.result.rowix++; if (this.result.rowix > this.maxRow()) { this.result.rowix = this.maxRow(); }; this.updateRange(); this.render(); }
	colMin() { this.result.colix--; if (this.result.colix < 0) { this.result.colix = 0; }; this.updateRange(); this.render(); }
	colPlus() { this.result.colix++; if (this.result.colix > this.maxCol()) { this.result.colix = this.maxCol(); }; this.updateRange(); this.render(); }

	render() {
		if (!this.previewArea) { return; }
		this.previewArea.renderButton();
	}

	tileSettings() {
		console.log("_tileSettings");
		this.tileSettingsCallback.obj[
			this.tileSettingsCallback.method
		]({ obj: this, method: 'tileSettingsOk' });
	}

	tileSettingsOk(result) {
		console.log("_tileSettingsOk", result);
		this.tileSettingsCallback.obj[
			this.tileSettingsCallback.methodOk
		](result);

		this.calculateMaxDimensions();
		this.render();
	}
}



class tilesSettingsDialog {
	constructor(_layout, _okdialogfunction, _renderFunction, tilew, tileh, _icons) {

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
		this.icons = _icons;

		this.titleStyle = "bold 14px Arial";
		this.groupStyle = "bold 12px Arial";

		this.result = { value: this.integerValue };

		this.integerValueW = tilew;
		this.integerValueH = tileh;

		this.valueW = new SliderButtonValue(this.integerValueW, 8, 256, 1);
		this.valueH = new SliderButtonValue(this.integerValueH, 8, 256, 1);

		this.sliderX = null;
		this.sliderY = null;


	}

	popUp() {
		var row = 0;
		var b = [];

		var panel = new Dialog(
			"TileSettingsDialog" + this.id++,
			"Tile Settings",
			this.SCRW, this.SCRH,
			350, 10 * this.gridH,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		var buttn;

		buttn = new Button(this.id++,
			PANEL_LEFTALIGN, row,
			4, 1,
			PPAINTR_BTYPE_TEXT,
			{ txt: "Tile Width:", txtStyle: "12px Arial" },
			null, this, null
		);
		buttn.noborder = true;

		b.push(buttn);
		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row));

		this.sliderX =
			new SliderButton("YesNoDialogSlider" + this.id++,
				PANEL_LEFTALIGN, row,
				8, .5,
				PPAINTR_BTYPE_HSLIDER,
				this.valueW, null, null);

		b.push(this.sliderX);

		row++;

		buttn = new Button(this.id++,
			PANEL_LEFTALIGN, row,
			4, 1,
			PPAINTR_BTYPE_TEXT,
			{ txt: "Tile Height:", txtStyle: "12px Arial" },
			null, this, null
		);
		buttn.noborder = true;
		b.push(buttn);

		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row));

		this.sliderY =
			new SliderButton("TilesSettings" + this.id++,
				PANEL_LEFTALIGN, row,
				8, .5,
				PPAINTR_BTYPE_HSLIDER,
				this.valueH, null, null);

		b.push(this.sliderY);

		row++; row++;

		var buttnWidth = 3.8;
		b.push(
			new Button(
				"8x8",
				PANEL_LEFTALIGN, row,
				buttnWidth, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: '8x8', ico: this.icons['tiles'] },
				null, this, 'setSizes'
			)
		);
		b.push(
			new Button(
				"16x16",
				PANEL_LEFTALIGN, row,
				buttnWidth, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: '16x16', ico: this.icons['tiles'] },
				null, this, 'setSizes'
			)
		);
		b.push(
			new Button(
				"24x24",
				PANEL_LEFTALIGN, row,
				buttnWidth, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: '24x24', ico: this.icons['tiles'] },
				null, this, 'setSizes'
			)
		);
		row++;
		b.push(
			new Button(
				"32x32",
				PANEL_LEFTALIGN, row,
				buttnWidth, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: '32x32', ico: this.icons['tiles'] },
				null, this, 'setSizes'
			)
		);
		b.push(
			new Button(
				"48x48",
				PANEL_LEFTALIGN, row,
				buttnWidth, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: '48x48', ico: this.icons['tiles'] },
				null, this, 'setSizes'
			)
		);
		b.push(
			new Button(
				"64x64",
				PANEL_LEFTALIGN, row,
				buttnWidth, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: '64x64', ico: this.icons['tiles'] },
				null, this, 'setSizes'
			)
		);
		row++;
		b.push(
			new Button(
				"128x128",
				PANEL_LEFTALIGN, row,
				buttnWidth, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: '128x128', ico: this.icons['tiles'] },
				null, this, 'setSizes'
			)
		);
		b.push(
			new Button(
				"256x256",
				PANEL_LEFTALIGN, row,
				buttnWidth, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: '256x256', ico: this.icons['tiles'] },
				null, this, 'setSizes'
			)
		);

		row++;
		b.push(
			new Button(
				"24x21",
				PANEL_LEFTALIGN, row,
				buttnWidth, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: '24x21', ico: this.icons['tiles'] },
				null, this, 'setSizes'
			)
		);


		row++;
		b.push(
			new Button(
				"ManageTiles",
				PANEL_LEFTALIGN, row,
				buttnWidth * 1.5, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: 'Manage Tiles', ico: this.icons['gear'] },
				null, this, 'manageTiles'
			)
		);

		panel.setButtons(b, "root");

		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog(this.panel);
	}

	popDown(ok) {

		if (ok) {
			var result = {
				type: "tilesize",
				tilesW: this.valueW.getValue(),
				tilesH: this.valueH.getValue()
			}

			console.log("popDown");
			console.log(this.integerValueW);

			this.okObj[this.okMethod](result);
		}

		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod];
	}


	setSizes(method, buttnId) {

		var wh = buttnId.split("x");

		this.valueW.setValue(wh[0]);
		this.sliderX.renderButton();

		this.valueH.setValue(wh[1]);
		this.sliderY.renderButton();


	}



	manageTiles(method, buttnId) {


		var result = {
			type: "managetiles"
		}



		this.okObj[this.okMethod](result);


		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod];

	}
}




class SavePictureOptionsDialog {

	constructor(_layout, _okdialogfunction, _renderFunction) {

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

		this.result = { w: this.SCRW, h: this.SCRH };

		var opt;

		this.options = [];
		opt = this.options;

		opt.push({ grp: true, name: "Options" });
		opt.push({ id: "none", txt: "None", label: "Transparency" });
		opt.push({ id: "background", txt: "Background Color", label: "" });

	}


	popUp() {
		var row = 0;
		var b;
		var panel = new Dialog(
			"SaveOptionsDialog",
			"Select Save Options",
			this.SCRW, this.SCRH,
			300, 175,
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

		for (var p = 0; p < subpaneldef.length; p++) {
			var spd = subpaneldef[p];
			b = [];
			row = 0;
			var arr = spd.def;
			var labl = spd.label;
			for (var i = 0; i < arr.length; i++) {
				var opt = arr[i];
				if (opt.grp == true) {
					if (i > 0) {
						row++;
					}

					var style = this.groupStyle;
					if (i == 0) {
						style = this.titleStyle;
					}
					b.push(
						new TextLabel(labl + i,
							PANEL_LEFTALIGN, row,
							4,
							opt.txt,
							style
						));
				}
				else {
					b.push(
						new TextLabel(labl + i,
							PANEL_LEFTALIGN, row,
							4,
							opt.label,
							style
						));

					b.push(
						new Button(opt.id, PANEL_LEFTALIGN, row,
							6, 1,
							PPAINTR_BTYPE_TOGGLE,
							{ txt: opt.txt },
							"options", this, null
						));
				}

				row++;

			}

			panel.setButtons(b, spd.target);
		}

		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog(this.panel);
	}

	popDown(ok) {

		if (ok) {

			var saveOption = this.panel.getToggleButtonId("options");

			this.result = {};
			this.result.transparency = saveOption;

			this.okObj[this.okMethod](this.result);
		}

		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod];
	}

}


class tilesManageArea {

	constructor(w, h, parent, cursor) {

		this.w = w;
		this.h = h;

		console.log("tilesManageArea w=",w);
		console.log("tilesManageArea h=",h);

		this.col = 0;
		this.row = 0;
		this.cursor = cursor;
		this.parent = parent;

	}



	draw(ctx, area_x, area_y) {

		var size = 9;
		//var line = 0;
		//var xoff = 4;
		//var yoff = 4 + (size * 1.5);
		//var yoff0 = 4 + (size * 8);

		//ctx.font = size + 'px arial';
		//ctx.textBaseline = 'bottom';
		//ctx.fillStyle = "#000000";

		//var previewW = this.parent.tilesW;
		//var previewH = this.parent.tilesH;

		var tileW = this.parent.tilesW;
		var tileH = this.parent.tilesH;

		//var previewCols = 10;
		//var previewCols0 = -Math.floor(previewCols / 2);
		//var previewColsLast = Math.floor(previewCols / 2);
		//var previewRows = 10;
		//var previewRows0 = -Math.floor(previewRows / 2);
		//var previewRowsLast = Math.floor(previewRows / 2);


		ctx.fillStyle = "#666666";
		ctx.fillRect(area_x, area_y, this.w, this.h);				

		var maxScreenXIndex = Math.floor(this.w / tileW)-1;
		var maxScreenYIndex = Math.floor(this.h / tileH)-1;

		var LeftOfCursorOffet = Math.floor(maxScreenXIndex / 2);
		var TopOfCursorOffet  = Math.floor(maxScreenYIndex / 2);

		for (var screenYIndex = 0; screenYIndex <= maxScreenYIndex; screenYIndex++) {
			for (var screenXIndex = 0; screenXIndex <= maxScreenXIndex; screenXIndex++) {

				var sourceXIndex = screenXIndex - LeftOfCursorOffet + this.cursor.colix;
				var sourceYIndex = screenYIndex - TopOfCursorOffet + this.cursor.rowix;

				var pixelX = screenXIndex * tileW + area_x;
				var pixelY = screenYIndex * tileH + area_y;

				if (sourceXIndex < 0 || sourceXIndex > (this.cursor.maxCols-1) ||
					sourceYIndex < 0 || sourceYIndex > (this.cursor.maxRows-1) ) {

					ctx.fillStyle = "#8888ee";
					ctx.fillRect(pixelX, pixelY, tileW, tileH);						
						
				}
				else {

					ctx.drawImage(this.cursor.paintBuffer.canvas,
						tileW * sourceXIndex,
						tileH * sourceYIndex,
						tileW, tileH,
						pixelX, pixelY,
						tileW, tileH
					);



					if (sourceXIndex == this.cursor.colix && sourceYIndex == this.cursor.rowix) {
						dmCMU.rect(ctx, pixelX, pixelY,
							tileW, tileH,
							'rgba(255,255,128,1)', 1);

						if( this.cursor.copied ) {
							ctx.drawImage( this.cursor.buffer.canvas ,
									0,
									0,
									tileW, tileH,
									pixelX, pixelY,
									tileW/2, tileH/2
							);						
							dmCMU.rect(ctx, pixelX, pixelY,
								tileW/2, tileH/2,
								'rgba(255,255,128,1)', 1);							
						}

					}
					else {
						dmCMU.rect(ctx, pixelX, pixelY,
							tileW, tileH,
							'rgba(64,64,64,1)', 1);						
					}

				}
			}
		}


	}

}

class tilesManageDialog {


	constructor(_layout, _okdialogfunction, _renderFunction, tilew, tileh, _icons, _parent) {

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
		this.icons = _icons;

		this.titleStyle = "bold 14px Arial";
		this.groupStyle = "bold 12px Arial";

		this.parent = _parent;

		this.tileW = this.parent.tilesW;
		this.tileH = this.parent.tilesH;

		this.rows = Math.floor(this.parent.infoRenderer.imgH / this.parent.tilesH);
		this.cols = Math.floor(this.parent.infoRenderer.imgW / this.parent.tilesW);

		this.imgW = this.parent.infoRenderer.imgW;
		this.imgH = this.parent.infoRenderer.imgH;
	
		this.iCC = new ImageCanvasContext();
		this.iCC.initNewCanvas( this.tileW, this.tileH );		

		this.paintBufferCopy = new ImageCanvasContext();
		this.paintBufferCopy.initNewCanvas( this.imgW, this.imgH );		

		this.paintBufferCopy.context.drawImage( 
			this.parent.paintbuffer.canvas,
			0, 0, this.imgW, this.imgH,
			0, 0, this.imgW, this.imgH
		);

		this.tileAreaData = { colix: 5, rowix: 5, buffer: this.iCC, paintBuffer: this.paintBufferCopy , copied: false };

		if( this.tileAreaData.colix >= this.cols ) {
			this.tileAreaData.colix = this.cols - 1;
		}
		if( this.tileAreaData.rowix >= this.rows ) {
			this.tileAreaData.rowix = this.rows - 1;
		}


	}

	popUp() {
		var row = 0;
		var b = [];

		var infoW = 13, infoH = 5;
		var id = this.id;

		var panel = new Dialog(
			"TileManageDialog" + this.id++,
			"Organize Tiles",
			this.SCRW, this.SCRH,
			700, 600,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		panel.attachEventHandler( this, 'keyboardEvent' );



		var tileAreaW = 688;
		var tileAreaH = 500;
		this.previewRenderer =
			new tilesManageArea(
				tileAreaW,
				tileAreaH,
				this.parent,
				this.tileAreaData);

		this.previewArea = new ToolButton(id++, PANEL_LEFTALIGN, row,
			tileAreaW / this.gridW, tileAreaH / this.gridH, PPAINTR_BTYPE_INFOAREA, { robj: this.previewRenderer }, null, null, null)

		this.previewArea.noborder = false;

		b.push(this.previewArea);

		
		var buttn;
		var buttnWidth = 3.8;
		b.push(
			new Button(
				"Copy",
				PANEL_LEFTALIGN, Math.ceil( tileAreaH / this.gridH),
				buttnWidth * 1.5, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: 'Copy', ico: this.icons['tiles'] },
				null, this, 'copy'
			)
		);

		b.push(
			new Button(
				"pasteSwap",
				PANEL_LEFTALIGN, Math.ceil( tileAreaH / this.gridH),
				buttnWidth * 1.5, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: 'Swap/Paste', ico: this.icons['tiles'] },
				null, this, 'pasteSwap'
			)
		);		

		panel.setButtons(b, "root");

		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog(this.panel);


		this.update();
	}


	/*
		Swap logic
		copy 	-> copies src to buf
		past.a 	-> copies dst to src
		past.b	-> copies buf to dst
	*/
	pasteSwap() {
		if( !this.tileAreaData.copied ) {
			return;
		}

		this.tileAreaData.copied = false;

		var tileW = this.tileW;
		var tileH = this.tileH;

		/* dst to src */
		this.paintBufferCopy.context.drawImage( 
			this.paintBufferCopy.canvas,
			tileW * (this.tileAreaData.colix),
			tileH * (this.tileAreaData.rowix),
			tileW, tileH,
			tileW * (this.tileAreaData.copyXSrc),
			tileH * (this.tileAreaData.copyYSrc),
			tileW, tileH
		);

		/* buf to dest */
		this.paintBufferCopy.context.drawImage( 
			this.iCC.canvas,
			0,
			0,
			tileW, tileH,
			tileW * (this.tileAreaData.colix),
			tileH * (this.tileAreaData.rowix),
			tileW, tileH
		);

		this.panel.updateRender();

	}



	copy() {

		var tileW = this.tileW;
		var tileH = this.tileH;

		this.tileAreaData.copied = true;
		this.tileAreaData.copyXSrc  = this.tileAreaData.colix;
		this.tileAreaData.copyYSrc  = this.tileAreaData.rowix;

		this.iCC.context.drawImage( 
			this.paintBufferCopy.canvas,
			tileW * (this.tileAreaData.colix),
			tileH * (this.tileAreaData.rowix),
			tileW, tileH,
			0,0,
			tileW, tileH
		);

		this.panel.updateRender();

	}

	keyboardEvent( evt ) {
		console.log( "Dialog keyboard event", evt );

		if( evt[1] == "arrowup" && this.tileAreaData.rowix>0) {
			this.tileAreaData.rowix--;
			this.panel.updateRender();
		}
		else if( evt[1] == "arrowdown"  && this.tileAreaData.rowix < (this.maxRows-1) ) {
			this.tileAreaData.rowix++;
			this.panel.updateRender();
		}
		else if( evt[1] == "arrowleft"  && this.tileAreaData.colix>0) {
			this.tileAreaData.colix--;
			this.panel.updateRender();
		}
		else if( evt[1] == "arrowright" && this.tileAreaData.colix < (this.maxCols-1) )  {
			this.tileAreaData.colix++;
			this.panel.updateRender();
		}
		else if( evt[1] == "CTRL-c" ) {
			this.copy();
		}
		else if( evt[1] == "CTRL-v" ) {
			this.pasteSwap();
		}

	}

	update() {

		this.maxCols = Math.ceil(this.parent.infoRenderer.imgW / this.parent.tilesW);
		this.maxRows = Math.ceil(this.parent.infoRenderer.imgH / this.parent.tilesH);

		this.tileAreaData.maxCols = this.maxCols;
		this.tileAreaData.maxRows = this.maxRows;

		console.log("maxCols " + this.maxCols + " maxRows " + this.maxRows);

		this.panel.updateRender();

	}

	popDown(ok) {

		if (ok) {
			var result = {
				newBitmap: this.paintBufferCopy
			}

			this.okObj[this.okMethod](result);
		}

		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod];
	}



}

class showImageDialog {

	constructor(_layout, _title, _shortCutsImage, _renderFunction) {

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

	popDown(ok) {

		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod];
	}

	popUp() {

		var b = [];

		var bWidth = this.imgW / this.gridW;
		var bHeight = this.imgH / this.gridH;

		var panel = new Dialog(
			"showImageDialog" + this.id++,
			this.title,
			this.SCRW, this.SCRH,
			this.imgW + 10, this.imgH + 36 + 36,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		var buttn = new Button(this.id++,
			PANEL_LEFTALIGN, 0,
			bWidth, bHeight,
			PPAINTR_BTYPE_INFOAREA,
			{ ico: this.image },
			null, this, null
		);
		buttn.noborder = false;

		b.push(buttn);
		panel.setButtons(b, "root");
		panel.placeButtons();
		this.panel = panel;
		this.layout.addDialog(this.panel);
		panel.updateRender();

	}

}

class brushScaleDialog {

	constructor(_layout, _okdialogfunction, _renderFunction, brushw, brushh) {

		console.log("brushw=" + brushw);
		console.log("brushh=" + brushh);

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

		this.result = { value: this.integerValue };

		this.integerValueW = brushw;
		this.integerValueH = brushh;
		this.aspecyRatio = brushw / brushh;

		var maxx = 256;
		if (brushw > 128) {
			maxx = brushw * 2;
		}
		var maxy = 256;
		if (brushh > 128) {
			maxy = brushh * 2;
		}

		this.valueW = new SliderButtonValue(this.integerValueW, 1, maxx, 1);
		this.valueH = new SliderButtonValue(this.integerValueH, 1, maxy, 1);
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
			350, 8 * this.gridH,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		var buttn;

		buttn = new Button(this.id++,
			PANEL_LEFTALIGN, row,
			4, 1,
			PPAINTR_BTYPE_TEXT,
			{ txt: "Brush Width:", txtStyle: "12px Arial" },
			null, this, null
		);
		buttn.noborder = true;

		b.push(buttn);
		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row));

		this.sliderWbutton =
			new SliderButton("BSizeSlider" + this.id++,
				PANEL_LEFTALIGN, row,
				8, .5,
				PPAINTR_BTYPE_HSLIDER,
				this.valueW, 'width', sliderHandler);

		b.push(this.sliderWbutton);
		row++;

		buttn = new Button(this.id++,
			PANEL_LEFTALIGN, row,
			4, 1,
			PPAINTR_BTYPE_TEXT,
			{ txt: "Brush Height:", txtStyle: "12px Arial" },
			null, this, null
		);
		buttn.noborder = true;
		b.push(buttn);

		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row));

		this.sliderHbutton =
			new SliderButton("BSizeSlider" + this.id++,
				PANEL_LEFTALIGN, row,
				8, .5,
				PPAINTR_BTYPE_HSLIDER,
				this.valueH, 'height', sliderHandler);
		b.push(this.sliderHbutton);

		row++;
		b.push(new Separator(this.id++, PANEL_LEFTALIGN, row));

		this.lockFlag = false;
		row++;
		b.push(
			new TextLabel(+ this.id++,
				PANEL_LEFTALIGN, row, 4,
				"Aspect Ration", "12px Arial"
			));

		b.push(
			new Button("scale.unlock",
				PANEL_LEFTALIGN, row,
				4, 1,
				PPAINTR_BTYPE_TOGGLE,
				{ txt: "Unlock" },
				"scale.option", this, 'unlock'
			));

		row++;
		b.push(
			new TextLabel(this.id++,
				PANEL_LEFTALIGN, row, 4,
				"", ""
			));

		b.push(
			new Button("scale.lock",
				PANEL_LEFTALIGN, row,
				4, 1,
				PPAINTR_BTYPE_TOGGLE,
				{ txt: "Lock" },
				"scale.option", this, 'lock'
			));

		panel.setButtons(b, "root");
		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog(this.panel);

		panel.selectToggleButton('scale.option', 'scale.lock');
		panel.updateRender();

		this.lock();
	}


	popDown(ok) {

		if (ok) {
			var result = {
				brushW: this.valueW.getValue(),
				brushH: this.valueH.getValue()
			}

			console.log("popDown");
			console.log(this.integerValueW);

			this.okObj[this.okMethod](result);
		}

		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod];
	}


	handleSlider(id, value) {
		console.log("handleSlider");
		console.log(id);
		console.log(value);

		if (id == 'width' && this.lockFlag) {
			this.valueH.setValue(value * this.aspectRatioH);
			this.sliderHbutton.renderButton();

		}
		if (id == 'height' && this.lockFlag) {
			this.valueW.setValue(value * this.aspectRatioW);
			this.sliderWbutton.renderButton();

		}
	}

	unlock() {
		this.lockFlag = false;
	}

	lock() {
		this.lockFlag = true;
		var brushW = this.valueW.getValue();
		var brushH = this.valueH.getValue();
		this.aspectRatioW = brushW / brushH;
		this.aspectRatioH = brushH / brushW;

	}
}


class paletteEditDialog {

	constructor(_layout, _okdialogfunction, _renderFunction, _icons, rgbpalette, _colIndex) {

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

		this.result = { value: this.integerValue };

		this.valueR = new SliderButtonValue(0, 0, 255, 1);
		this.valueG = new SliderButtonValue(0, 0, 255, 1);
		this.valueB = new SliderButtonValue(0, 0, 255, 1);
		this.valueH = new SliderButtonValue(0, 0, 360, 1);
		this.valueS = new SliderButtonValue(0, 0, 100, 1);
		this.valueV = new SliderButtonValue(0, 0, 100, 1);

		this.sliderHandler = { obj: this, method: 'handleSliderChange' }
		this.compControlWidth = 1;

		this.rgb = this.rgbpalette[0];
		this.makeGradient = false;
		this.makeCopy = false;

		this.colIndex = _colIndex;

		this.colorBox = new ColorBox();

	}

	flagMakeGradient() {
		var i = i = parseInt(this.panel.getToggleButtonId("colorbuttons").split(":")[1]);
		this.makeGradient = true;
		this.makeCopy = false;
		this.gradientFrom = i;
	}

	flagCopyTo() {
		var i = i = parseInt(this.panel.getToggleButtonId("colorbuttons").split(":")[1]);
		this.makeCopy = true;
		this.makeGradient = false;
		this.copyFrom = i;
	}

	selectFromPalette(bid) {
		var i = parseInt(this.panel.getToggleButtonId("colorbuttons").split(":")[1]);
		console.log(i);

		this.rgb = this.colRenderers[i].getColor();

		this.hsv = this.colorBox.RGBtoHSV(this.rgb.r, this.rgb.g, this.rgb.b);

		this.valueH.setValue(this.hsv.h);
		this.valueS.setValue(this.hsv.s * 100);
		this.valueV.setValue(this.hsv.v * 100);

		this.buttonH.renderButton();
		this.buttonS.renderButton();
		this.buttonV.renderButton();

		this.valueR.setValue(this.rgb.r);
		this.valueG.setValue(this.rgb.g);
		this.valueB.setValue(this.rgb.b);

		this.buttonR.renderButton();
		this.buttonG.renderButton();
		this.buttonB.renderButton();

		this.indicator.setColor(this.rgb);
		this.indicatorButton.renderButton();

		if (this.makeCopy) {
			var from = this.copyFrom;
			var to = i;
			var rgbFrom = this.colRenderers[from].getColor(from);

			var newRGB = {
				r: rgbFrom.r,
				g: rgbFrom.g,
				b: rgbFrom.b
			}

			this.colRenderers[to].setColor(newRGB);
			this.colButtons[to].renderButton();

			this.makeCopy = false;

			/* Select the button, after we changed the color, update sliders */
			this.selectFromPalette("color:" + i);

		}
		else if (this.makeGradient) {

			var from = this.gradientFrom;
			var to = i;
			var delta = to - from;
			if (delta < 0) {
				delta = -delta;
				var tmp = to;
				to = from;
				from = tmp;
			}

			var rgbFrom = this.colRenderers[from].getColor(from);
			var rgbTo = this.colRenderers[to].getColor(to);

			var rD = (rgbTo.r - rgbFrom.r) / delta;
			var gD = (rgbTo.g - rgbFrom.g) / delta;
			var bD = (rgbTo.b - rgbFrom.b) / delta;

			var rr = rgbFrom.r + rD;
			var gg = rgbFrom.g + gD;
			var bb = rgbFrom.b + bD;

			console.log("from=" + from);
			console.log("to=" + to);
			for (var ci = (from + 1); ci < to; ci++) {

				console.log("ci=" + ci);

				var newRGB = {
					r: Math.round(rr),
					g: Math.round(gg),
					b: Math.round(bb)
				}

				this.colRenderers[ci].setColor(newRGB);
				this.colButtons[ci].renderButton();

				rr += rD;
				gg += gD;
				bb += bD;
			}

			this.makeGradient = false;
		}
	}

	handleSliderChange(sig, slidervalue) {

		this.hsv = {};
		var colChange = false;
		var rgb = false;
		if (sig == "RED") {
			this.rgb.r = slidervalue; colChange = true;
			this.rgb.g = this.valueG.getValue();
			this.rgb.b = this.valueB.getValue();
			rgb = true;
		}
		else if (sig == "GREEN") {
			this.rgb.g = slidervalue; colChange = true;
			this.rgb.r = this.valueR.getValue();
			this.rgb.b = this.valueB.getValue();
			rgb = true;
		}
		else if (sig == "BLUE") {
			this.rgb.b = slidervalue; colChange = true;
			this.rgb.r = this.valueR.getValue();
			this.rgb.g = this.valueG.getValue();
			rgb = true;
		}
		else if (sig == "HUE") {
			this.hsv.h = slidervalue;
			this.hsv.s = this.valueS.getValue() / 100;
			this.hsv.v = this.valueV.getValue() / 100;

			colChange = true;
			rgb = false;
		}
		else if (sig == "SATURATION") {
			this.hsv.h = this.valueH.getValue();
			this.hsv.s = slidervalue / 100;
			this.hsv.v = this.valueV.getValue() / 100;
			colChange = true;
			rgb = false;
		}
		else if (sig == "VALUE") {
			this.hsv.h = this.valueH.getValue();
			this.hsv.s = this.valueS.getValue() / 100;
			this.hsv.v = slidervalue / 100;

			colChange = true;
			rgb = false;
		}

		if (colChange) {

			if (rgb) {
				var hsv = this.colorBox.RGBtoHSV(this.rgb.r, this.rgb.g, this.rgb.b);

				this.valueH.setValue(hsv.h);
				this.valueS.setValue(hsv.s * 100);
				this.valueV.setValue(hsv.v * 100);

				this.buttonH.renderButton();
				this.buttonS.renderButton();
				this.buttonV.renderButton();

			}
			else {
				var rgb = this.colorBox.HSVtoRGB(this.hsv.h, this.hsv.s, this.hsv.v);
				this.rgb = rgb;

				this.valueR.setValue(rgb.r);
				this.valueG.setValue(rgb.g);
				this.valueB.setValue(rgb.b);

				this.buttonR.renderButton();
				this.buttonG.renderButton();
				this.buttonB.renderButton();
			}

			this.indicator.setColor(this.rgb);
			this.indicatorButton.renderButton();

			var i = this.panel.getToggleButtonId("colorbuttons").split(":")[1];
			this.colRenderers[i].setColor(this.rgb);
			this.colButtons[i].renderButton();


		}

	}

	label(text, row) {

		var style1 = "12px Arial";

		return new TextLabel(
			"palettelbl" + (this.id++),
			PANEL_LEFTALIGN, row,
			this.compControlWidth,
			text, style1);
	}

	vSlider(value, row, sig) {

		return (
			new SliderButton("ColSlider" + this.id++,
				PANEL_LEFTALIGN, row,
				this.compControlWidth, 8,
				PPAINTR_BTYPE_VSLIDER,
				value,
				sig,
				this.sliderHandler));

	}

	separator(row) {
		var s = new Separator(this.id++, PANEL_LEFTALIGN, row);
		s.setWidth(1);
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
			300, 16 * this.gridH,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		var buttn;
		var id = 0;

		b.push(this.label('R', row));
		b.push(this.label('G', row));
		b.push(this.label('B', row));
		b.push(this.separator(row));
		b.push(this.label('H', row));
		b.push(this.label('S', row));
		b.push(this.label('V', row));

		row++;

		this.buttonR = this.vSlider(this.valueR, row, "RED");
		b.push(this.buttonR);

		this.buttonG = this.vSlider(this.valueG, row, "GREEN");
		b.push(this.buttonG);

		this.buttonB = this.vSlider(this.valueB, row, "BLUE");
		b.push(this.buttonB);

		b.push(this.separator(row));

		this.buttonH = this.vSlider(this.valueH, row, "HUE");
		b.push(this.buttonH);
		this.buttonS = this.vSlider(this.valueS, row, "SATURATION");
		b.push(this.buttonS);
		this.buttonV = this.vSlider(this.valueV, row, "VALUE");
		b.push(this.buttonV);

		b.push(this.separator(row));

		var colIndicatorW = 64;
		var colIndicatorH = 64;
		var cir = new ColorButtonRenderer(
			panel.getContext(), 0, 0, 0,
			0, 0, colIndicatorW, colIndicatorH,
			null, null);

		this.indicator = cir;

		this.indicatorButton =
			new Button(
				this.id++,
				PANEL_LEFTALIGN, row,
				colIndicatorW / this.gridW, colIndicatorH / this.gridH,
				PPAINTR_BTYPE_INFOAREA,
				{ robj: cir },
				null, null, null
			);
		b.push(this.indicatorButton);

		row = 10;

		var colbuttonW = 18;
		var colbuttonH = 24;
		this.colRenderers = [];
		this.colButtons = [];
		for (var i = 0; i < 32; i++) {

			if (i == 16) { row++; }

			var rgb = this.rgbpalette[i];

			this.colRenderers[i] = new ColorButtonRenderer(
				panel.getContext(), rgb.r, rgb.g, rgb.b,
				0, 0, colbuttonW, colbuttonH,
				null);

			this.colButtons[i] = new Button(
				"color:" + i,
				PANEL_LEFTALIGN, row,
				colbuttonW / this.gridW, colbuttonH / this.gridH,
				PPAINTR_BTYPE_TOGGLE,
				{ robj: this.colRenderers[i] },
				"colorbuttons", this, 'selectFromPalette'
			);

			b.push(this.colButtons[i]);

		}

		row++;
		b.push(
			new Button(
				"CopyTo",
				PANEL_LEFTALIGN, row,
				5, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: 'Copy to', ico: this.icons['copyto'] },
				null, this, 'flagCopyTo'
			)
		);


		b.push(
			new Button(
				"Gradient",
				PANEL_LEFTALIGN, row,
				5, .85,
				PPAINTR_BTYPE_CLICK,
				{ txt: 'Gradient to', ico: this.icons['gradient'] },
				null, this, 'flagMakeGradient'
			)
		);

		panel.setButtons(b, "root");
		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog(this.panel);

		this.layout.handlePanelsAutoClickEvent("color:" + this.colIndex);
		//this.panelsManager.handlePanelsAutoClickEvent(

		this.selectFromPalette("left");
	}


	popDown(ok) {

		if (ok) {
			var result = [];

			for (var i = 0; i < this.colRenderers.length; i++) {
				var rgb = this.colRenderers[i].getColor();
				console.log("addColortoResult");
				result.push(rgb);
			}

			console.log("popDown");
			this.okObj[this.okMethod](result);
		}

		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod];
	}
}

class YesNoDialog {

	constructor(_layout, _question, _okdialogfunction, _renderFunction) {

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

		this.result = { w: this.SCRW, h: this.SCRH };

		this.id = 0;

	}

	popUp() {
		var row = 0;
		var b = [];

		var panel = new Dialog(
			"YesNoDialog" + this.id,
			"Alert",
			this.SCRW, this.SCRH,
			800, 150,
			this.gridW, this.gridH,
			this, "popDown",
			this.renderObj, this.renderMethod
		);

		var lines = this.question.split("\n");

		for (var i = 0; i < lines.length; i++) {
			b.push(

				new TextLabel("YesNoDialogTxt" + this.id,
					PANEL_LEFTALIGN, row,
					20,
					lines[i],
					null
				));

			row++;
			this.id++;
		}

		panel.setButtons(b, "root");
		panel.placeButtons();

		this.panel = panel;
		this.layout.addDialog(this.panel);
	}

	popDown(ok) {

		if (ok) {

			this.okObj[this.okMethod](null);
		}

		this.layout.removeDialog(this.panel.id);
		this.panel = null;

		this.renderObj[this.renderMethod];
	}
}

class ColourSelectDialog { }
