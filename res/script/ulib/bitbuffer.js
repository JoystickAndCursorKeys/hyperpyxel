class BitBuffer {

	//improve performance with https://www.w3schools.com/js/js_bitwise.asp
	constructor ( size ) {
	
		this.bitSize = size;
		this.byteSize = Math.ceil( size / 8 );
		
		this.uint8 = new Uint8Array( this.byteSize );
		this.bitVals = [ 1, 2, 4, 8, 16, 32, 64, 128 ];
		this.bits = [];
		
		var bits = this.bits;
		bits[ 0 ] = 0 ;
		bits[ 1 ] = 0 ;
		bits[ 2 ] = 0 ;
		bits[ 3 ] = 0 ;
		bits[ 4 ] = 0 ;
		bits[ 5 ] = 0 ;
		bits[ 6 ] = 0 ;
		bits[ 7 ] = 0 ;
		
		this.length = size;
		this.byteLength = this.byteSize;
		
	}
	
	intByteFromBits() {

		var bits = this.bits;
		var v=0;

		for( var i=0; i<8 ; i++) {
			v += bits[ i ];	
		}			
		return v;
	}
	
	intBitsFromByte( byteVal ) {
	
		var bits = this.bits;
		
		bits[ 0 ] = 1; 
		bits[ 1 ] = 2; 
		bits[ 2 ] = 4; 
		bits[ 3 ] = 8; 
		bits[ 4 ] = 16; 
		bits[ 5 ] = 32; 
		bits[ 6 ] = 64; 
		bits[ 7 ] = 128; 
		
		var byteVal2 = byteVal;
		
		for( var i=7; i>=0 ; i--) {
			var v = this.bitVals[ i ];			
			byteVal2 -= v;
			if( byteVal2 < 0 ) {
				byteVal2 += v;
				bits[ i ] = 0;
			}
		
		}

	}

	getBit( pos ) {

		var byOffset = Math.floor( pos / 8 );
		var biOffset = pos - ( 8 * byOffset );
		var origValue = this.uint8[ byOffset ];

		this.intBitsFromByte( origValue );
		
		return this.bits[ biOffset ] > 0;
	}
	
	setBit( pos, value ) {

		var byOffset = Math.floor( pos / 8 );
		var biOffset = pos - ( 8 * byOffset );
		var origValue = this.uint8[ byOffset ];

		this.intBitsFromByte( origValue );
		
		var bv = 0; 
		if( value ) {
			bv = this.bitVals[ biOffset ];
		}
		
		this.bits[ biOffset ] = bv;

		var newValue = this.intByteFromBits();
		
		this.uint8[ byOffset ] = newValue; 
	}
	
	getBytes() {
		return this.uint8;
	}
	
	getByte( offset ) {
		return this.uint8[ offset ];
	}
	
	setByte( offset, val ) {
		this.uint8[ offset ] = val;
	}
}
