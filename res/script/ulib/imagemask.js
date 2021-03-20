class ImageMask {

	//improve performance with https://www.w3schools.com/js/js_bitwise.asp
	constructor ( w, h ) {

    this.w = w;
    this.h = h;
    this.size = w * h;
    this.bitbuffer = new BitBuffer( this.size );

    this.minx = 999999;
    this.miny = 999999;
    this.maxx = -1;
    this.maxy = -1;

	}

  anyPixelsSet() {
    if ( this.maxx != -1 ) {
      return true;
    }
  }

  getArea() {
    return {
      minx: this.minx,
      miny: this.miny,
      maxx: this.maxx,
      maxy: this.maxy,
      h: (this.maxy - this.miny) + 1,
      w: (this.maxx - this.minx) + 1
    }
  }

  getPixel( x, y ) {
    var offset = x + (y * this.w);

    return this.bitbuffer.getBit( offset );
  }

  setPixel( x, y ) {
    this.setPixelValue( x, y , true );
  }

  setPixelValue( x, y, value ) {
    var offset = x + (y * this.w);

    if( x < this.minx ) { this.minx = x ; }
    if( x > this.maxx ) { this.maxx = x ; }
    if( y < this.miny ) { this.miny = y ; }
    if( y > this.maxy ) { this.maxy = y ; }

    return this.bitbuffer.setBit( offset, value );
  }

  calculateVLines() {
    this.vLines = [];
    var area = this.getArea();
    for( var x=area.minx; x<=area.maxx; x++) {
      var lines = [];
      var inline = false;
      var y0 = null;
      for( var y=area.miny; y<=area.maxy; y++) {

          var pixelMask = this.getPixel( x, y ) ;
          if( pixelMask ) {
              if( !inline ) {
                inline = true;
                y0 = y;
              }
          }
          else
          {
            if( inline ) {
              inline = false;
              lines.push( { y0: y0, y1: y-1, dbg:0 } );
            }
          }

          if( pixelMask && y==area.maxy) {
              lines.push( { y0: y0, y1: y, dbg: 1 } );
          }
      }
      this.vLines[ x ] = lines;
    }
  }

  calculateHLines() {
    this.hLines = [];
    var area = this.getArea();
    for( var y=area.miny; y<=area.maxy; y++) {
      var lines = [];
      var inline = false;
      var x0 = null;
      for( var x=area.minx; x<=area.maxx; x++) {
        var pixelMask = this.getPixel( x, y ) ;
        if( pixelMask ) {
            if( !inline ) {
              inline = true;
              x0 = x;
            }
        }
        else
        {
          if( inline ) {
            inline = false;
            lines.push( { x0: x0, x1: x-1 } );
          }
        }

        if( pixelMask && x==area.maxx) {
            lines.push( { x0: x0, x1: x } );
        }
      }
      this.hLines[ y ] = lines;
    }
  }

  findXRange( ranges, x ) {
    for( var i=0; i<ranges.length; i++) {
      var r=ranges[i];
      if( x>=r.x0 && x<=r.x1 ) {
        return r;
      }
    }
    return null;
  }

  findYRange( ranges, y ) {
    for( var i=0; i<ranges.length; i++) {
      var r=ranges[i];
      if( y>=r.y0 && y<=r.y1 ) {
        return r;
      }
    }
    return null;
  }


  findYRange2( ranges, y ) {
    var result = { rangePercents: [] };
    var totalRange = 0;
    var rangeSize;
    var foundRangeIx = -1;
    var foundRangeSizeBefore = -1;
    var foundRangeSize = -1;

    for( var i=0; i<ranges.length; i++) {
      var r=ranges[i];
      rangeSize = ( r.y1 - r.y0 ) - 1;

      if( y>=r.y0 && y<=r.y1 ) {
        result.range = r;
        foundRangeIx = i;
        foundRangeSizeBefore = totalRange;
        foundRangeSize = rangeSize;
      }
      totalRange += range;
    }

    result.startTotal = foundRangeSizeBefore;
    result.currentSize = foundRangeSize
    result.totalSize = totalRange;
    result.sizeAfter = totalRange;
    result.rangeIx = foundRangeIx;

    return null;
  }


  getLocalAreaXDims( x, y ) {

    var lines = this.hLines[ y ];
    var xline = this.findXRange( lines, x );

    if( xline == null ) {
      return null;
    }

    var w = ( xline.x1 - xline.x0 ) + 1;
    var dist = x - xline.x0;
    var percent = (dist / w );

    return { x0: xline.x0, x1: xline.x1, w: w, percent: percent };
  }


  getLocalAreaYDims( x, y ) {

    var lines = this.vLines[ x ];
    var yline = this.findYRange( lines, y );

    if( yline == null ) {
      return null;
    }

    var h = (yline.y1 - yline.y0) + 1;
    var dist = y - yline.y0;
    var percent = (dist / h);

    return { y0: yline.y0, y1: yline.y1, h: h, percent: percent };
  }


  getLocalAreaWidth( x, y ) {

    return 0;

    var xTest;
    var x0 = x;
    var x1 = x;

    xTest = x - 1;
    while( xTest > 0 ) {
      if( this.getPixel( xTest , y) == true ) {
        x0 = xTest;
      }
      else {
        break;
      }
      xTest--;
    }

    xTest = x + 1;
    while( xTest < this.w ) {
      if( this.getPixel( xTest , y) == true ) {
        x1 = xTest;
      }
      else {
        break;
      }
      xTest++;
    }

    return x1 - x0;
  }

  getPixelsAsList() {
    return new ImageMaskPixelList( this );
  }

}


class ImageMaskPixelList {

  constructor ( mask ) {

    this.mask = mask;

  }

  getPixelXY( cursor ) {
    var p = this.mask.getPixel( cursor.x, cursor.y );
    if( ! p ) {
      return null
    }
    return {
      x: cursor.x,
      y: cursor.y
    }
  }

  start() {
    this.area = this.mask.getArea();

    var x = this.area.minx;
    var y = this.area.miny;
    this.cursor = { x:x-1, y:y };

    return this.next();
  }

  next() {

    var pix = null;
    while( pix == null ) {

        this.cursor.x++;
        if( this.cursor.x > this.area.maxx ) {
          this.cursor.x = this.area.minx;
          this.cursor.y++;
          if( this.cursor.y > this.area.maxy ) {
            return null;
          }
        }
        pix = this.getPixelXY( this.cursor );
    }
    return pix;
  }

}
