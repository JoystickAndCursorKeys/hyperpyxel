
class AppEventBusEvent {
	
	constructor( _contextid, _id, _data ) {
		
		this.contextid 	= _contextid;
		this.id 		= _id;
		this.data 		= _data;
		
	}
	
}

class CallBackData {
	
	constructor( _obj, _callfunction, _prio ) {
		
		this.obj 			= _obj;
		this.callfunction 	= _callfunction;
		this.prio 			= _prio;

	}

}

class AppEventBus {

    constructor( ) {
		
		this.agents = [];
		
	}
	
	register( _agent, _interests, _destination ) {

		this.agents.push( { agent: _agent, interests: _interests, destination: _destination } );
	
	}

	post( appSig ) {
		
		//console.log( "POST >> " + appSig[ 0 ] + "/" + appSig[ 1 ]+ " /d:" + appSig['destination'] );
		for (var i = 0; i < this.agents.length; i++) {
			var agent = this.agents[ i ];
			
			if( appSig[ 'destination' ] != undefined ) {
				if ( appSig[ 'destination' ] != agent.destination && agent.destination != '*' ) {
					continue;
				}
			}
			
			var foundInt = false;
			for (var j = 0; j < agent.interests.length; j++) {
				var interest = agent.interests[ j ];
				if( interest == appSig[ 0 ]) {
					foundInt = true;
					break;
				}
			}
			if ( foundInt == false ) {
				continue;
			}
			
			//console.log( "<RECIPIENT-AGENT> " +  agent.agent.getId() );
			agent.agent.handleInputSignal( appSig );
		}
		
	}
	
}