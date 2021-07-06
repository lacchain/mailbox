import { generateKeyPair } from "./utils/crypt.js";
import { DID } from "@lacchain/did";

const did = new DID( {
	registry: '0xCC77A5e709cB473F49c943D9b40B989f986E5F2F',
	rpcUrl: 'https://writer.lacchain.net',
	network: 'main'
} );

generateKeyPair().then( async keyPair => {
	await did.addKeyAgreement( {
		algorithm: 'x25519ka',
		encoding: 'hex',
		publicKey: `0x${keyPair.publicKey}`,
		controller: did.id,
	} );
	await did.addService( {
		type: 'DIDComm',
		endpoint: 'https://mailbox.lacchain.net'
	} );
	console.log( 'DID: ', did.id );
	console.log( 'DID Private Key: ', did.config.controllerPrivateKey );
	console.log( 'Encryption Public Key: ', keyPair.publicKey );
	console.log( 'Encryption Private Key: ', keyPair.privateKey );
} );