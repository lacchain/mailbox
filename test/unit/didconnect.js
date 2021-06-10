import chai from 'chai';
import didJWT from "did-jwt";

import chaiAsPromised from "chai-as-promised";
import DIDConnectService from "../../src/services/didconnect.js";
import moment from "moment";

const expect = chai.expect;
chai.use( chaiAsPromised );
chai.should();

describe( 'DIDConnect', () => {

	const issuer1 = {
		did: 'did:lac:main:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74',
		privateKey: '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
	}
	const issuer2 = {
		did: 'did:lac:main:0x4a5a6460d00c4d8c2835a3067f53fb42021d5bb9',
		privateKey: '09288ce70513941f8a859361aeb243c56d5b7a653c1c68374a70385612fe0c2a'
	}
	const mailbox = {
		did: 'did:lac:main:0x4222ec932c5a68b80e71f4ddebb069fa02518b8a'
	}

	const didconnect = new DIDConnectService( mailbox );

	const signer1 = didJWT.ES256KSigner( issuer1.privateKey );

	it( 'should fail due sub != iss', async() => {
		const token = await didJWT.createJWT(
			{ sub: issuer2.did, aud: mailbox.did, exp: moment().add( 1, 'days' ).valueOf() },
			{ issuer: issuer1.did, signer: signer1 },
			{ alg: 'ES256K' }
		);
		try {
			await didconnect.authenticate( token );
		} catch( e ) {
			expect( e.message ).to.equals( 'The sub field must be equal to iss' );
		}
	} );

	it( 'should fail expired token', async() => {
		const token = await didJWT.createJWT(
			{ sub: issuer1.did, aud: mailbox.did, exp: moment().subtract( 1, 'days' ).valueOf() },
			{ issuer: issuer1.did, signer: signer1 },
			{ alg: 'ES256K' }
		);
		try {
			await didconnect.authenticate( token );
		} catch( e ) {
			expect( e.message ).to.equals( 'Expired JWT' );
		}
	} );

	it( 'should fail due invalid audience', async() => {
		const token = await didJWT.createJWT(
			{ sub: issuer1.did, aud: issuer2.did, exp: moment().add( 1, 'days' ).valueOf() },
			{ issuer: issuer1.did, signer: signer1 },
			{ alg: 'ES256K' }
		);
		try {
			await didconnect.authenticate( token );
		} catch( e ) {
			expect( e.message ).to.equals( 'JWT audience does not match your DID or callback url' );
		}
	} );

	it( 'should fail token signature', async() => {
		const token = await didJWT.createJWT(
			{ sub: issuer2.did, aud: mailbox.did, exp: moment().add( 1, 'days' ).valueOf() },
			{ issuer: issuer2.did, signer: signer1 },
			{ alg: 'ES256K' }
		);
		try {
			await didconnect.authenticate( token );
		} catch( e ) {
			expect( e.message ).to.equals( 'Signature invalid for JWT' );
		}
	} );

	it( 'should fail due unsupported JWS algorithm', async() => {
		const token = await didJWT.createJWT(
			{ sub: issuer1.did, aud: mailbox.did, exp: moment().add( 1, 'days' ).valueOf() },
			{ issuer: issuer1.did, signer: signer1 },
			{ alg: 'EdDSA' }
		);
		try {
			await didconnect.authenticate( token );
		} catch( e ) {
			expect( e.message ).to.equals( 'Unsupported JWS algorithm' );
		}
	} );

	it( 'should success validate the token', async() => {
		const token = await didJWT.createJWT(
			{ sub: issuer1.did, aud: mailbox.did, exp: moment().add( 1, 'days' ).valueOf() },
			{ issuer: issuer1.did, signer: signer1 },
			{ alg: 'ES256K' }
		);
		const did = await didconnect.authenticate( token );
		expect( did ).to.equals( issuer1.did );
	} );

} );