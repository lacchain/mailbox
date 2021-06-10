import chai from 'chai';
import { DID } from '@lacchain/did';

import chaiAsPromised from "chai-as-promised";
import DIDCommService from "../../src/services/didcomm.js";
import { generateKeyPair } from "../../src/utils/crypt.js";

const expect = chai.expect;
chai.use( chaiAsPromised );
chai.should();

const DID_CONFIG = {
	registry: '0xCC77A5e709cB473F49c943D9b40B989f986E5F2F',
	rpcUrl: 'https://writer.lacchain.net',
	network: 'main'
};

describe( 'DIDComm', () => {
	const didcomm = new DIDCommService();

	const message = 'Test Message';

	const alice = {};
	const bob = {};

	before( async() => {
		const aliceKeyPair = await generateKeyPair();
		const bobKeyPair = await generateKeyPair();
		const aliceDID = new DID( { ...DID_CONFIG } );
		const bobDID = new DID( { ...DID_CONFIG } );
		await aliceDID.addKeyAgreement( {
			algorithm: 'x25519ka',
			encoding: 'hex',
			publicKey: `0x${aliceKeyPair.publicKey}`,
			controller: aliceDID.id,
		} );
		await bobDID.addKeyAgreement( {
			algorithm: 'x25519ka',
			encoding: 'hex',
			publicKey: `0x${bobKeyPair.publicKey}`,
			controller: bobDID.id,
		} );
		alice.did = aliceDID.id
		alice.keyPair = aliceKeyPair;

		bob.did = bobDID.id;
		bob.keyPair = bobKeyPair;
	} );

	it( 'should send message with authenticated encryption', async() => {
		const encrypted = await didcomm.encrypt( message, alice.keyPair, bob.did, true );
		const decrypted = await didcomm.decrypt( encrypted, bob.keyPair );
		expect( decrypted.message ).to.equals( message );
	} );

	it( 'should send message with regular encryption', async() => {
		const encrypted = await didcomm.encrypt( message, alice.keyPair, bob.did, false );
		const decrypted = await didcomm.decrypt( encrypted, bob.keyPair );
		expect( decrypted.message ).to.equals( message );
	} );

} );