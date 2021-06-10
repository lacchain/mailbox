import chai from 'chai';
import { DID } from '@lacchain/did';
import chaiAsPromised from "chai-as-promised";
import { didCommService } from "../../src/services/index.js";
import config from "../../src/config.js";
import didJWT from "did-jwt";
import moment from "moment";
import { generateKeyPair } from "../../src/utils/crypt.js";
import axios from "axios";

const expect = chai.expect;
chai.use( chaiAsPromised );
chai.should();

const DID_CONFIG = {
	registry: '0xCC77A5e709cB473F49c943D9b40B989f986E5F2F',
	rpcUrl: 'https://writer.lacchain.net',
	network: 'main'
};

describe( 'Mediator', () => {
	const message = 'Test Message';

	const alice = {};
	const bob = {};

	before( async() => {
		const aliceKeyPair = await generateKeyPair();
		const aliceDID = new DID( { ...DID_CONFIG } );
		await aliceDID.addKeyAgreement( {
			algorithm: 'x25519ka',
			encoding: 'hex',
			publicKey: `0x${aliceKeyPair.publicKey}`,
			controller: aliceDID.id,
		} )

		alice.did = aliceDID.id;
		alice.privateKey = aliceDID.config.controllerPrivateKey;
		alice.keyPair = aliceKeyPair;

		const bobKeyPair = await generateKeyPair();
		const bobDID = new DID( { ...DID_CONFIG } );
		await bobDID.addKeyAgreement( {
			algorithm: 'x25519ka',
			encoding: 'hex',
			publicKey: `0x${bobKeyPair.publicKey}`,
			controller: bobDID.id,
		} );

		bob.did = bobDID.id;
		bob.privateKey = bobDID.config.controllerPrivateKey;
		bob.keyPair = bobKeyPair;
	} );

	it( 'alice should send a message to bob', async() => {
		const token = await didJWT.createJWT(
			{ sub: alice.did, aud: config.did.id, exp: moment().add( 1, 'days' ).valueOf() },
			{ issuer: alice.did, signer: didJWT.ES256KSigner( alice.privateKey ) },
			{ alg: 'ES256K' }
		);

		const encryptedToBob = await didCommService.encrypt( message, alice.keyPair, bob.did, true );

		const envelope = {
			"type": "https://didcomm.org/routing/2.0/forward",
			"to": [config.did.id],
			"expires_time": 1516385931,
			"body":{
				"next": bob.did,
				"payloads~attach": [
					encryptedToBob
				]
			}
		}
		const encryptedToMailbox = await didCommService.encrypt( envelope, alice.keyPair, config.did.id, true );
		const result = await axios.post( 'http://localhost:8080/vc', encryptedToMailbox, { headers: { token } } );

		expect( result.data ).to.not.be.null;
	} );

	it( 'bob should receive the message from alice', async() => {
		const token = await didJWT.createJWT(
			{ sub: bob.did, aud: config.did.id, exp: moment().add( 1, 'days' ).valueOf() },
			{ issuer: bob.did, signer: didJWT.ES256KSigner( bob.privateKey ) },
			{ alg: 'ES256K' }
		);

		const result = await axios.get( 'http://localhost:8080/vc', { headers: { token } } );
		const decrypted = await didCommService.decrypt( result.data[0], bob.keyPair );

		expect( decrypted.message ).to.equals( message );
	} );

} );