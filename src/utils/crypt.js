import sodium from "libsodium-wrappers";
import DIDComm from "DIDComm-js";

export const generateKeyPair = async() => {
	const didcomm = new DIDComm.DIDComm();
	await didcomm.ready;
	const keyPair = await didcomm.generateKeyPair();
	return {
		publicKey: new Buffer( keyPair.publicKey ).toString( 'hex' ),
		privateKey: new Buffer( keyPair.privateKey ).toString( 'hex' )
	}
}

export const getKeyPairFromHex = keyPairHex => {
	return {
		keyType: 'ed25519',
		publicKey: sodium.from_hex( keyPairHex.publicKey ),
		privateKey: sodium.from_hex( keyPairHex.privateKey )
	};
}