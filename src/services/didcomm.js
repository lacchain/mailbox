import DIDComm from "DIDComm-js";
import { findKeyAgreement, resolve } from "../utils/did.js";
import { getKeyPairFromHex } from "../utils/crypt.js";

export default class DIDCommService {

	constructor() {
		this.didcomm = new DIDComm.DIDComm();
	}

	async encrypt( message, senderKeyPair, recipientDID, nonRepudiable = false ) {
		await this.didcomm.ready;
		const recipientDIDDocument = await resolve( recipientDID );
		const recipientPublicKey = findKeyAgreement( recipientDIDDocument, 'X25519KeyAgreementKey2019' );
		const sodiumKeyPair = getKeyPairFromHex( senderKeyPair );
		const result = await this.didcomm.pack_auth_msg_for_recipients(
			typeof message === 'string' ? message : JSON.stringify( message ),
			[recipientPublicKey], sodiumKeyPair, nonRepudiable
		);
		return JSON.parse( result );
	}

	async decrypt( message, recipientKeyPair ) {
		await this.didcomm.ready;
		return await this.didcomm.unpackMessage( message, getKeyPairFromHex( recipientKeyPair ) ).catch( error => {
			console.log( error );
			return null;
		} );
	}

}