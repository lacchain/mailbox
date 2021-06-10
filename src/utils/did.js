import axios from 'axios';
import sodium from "libsodium-wrappers";
import config from "../config.js";

export async function resolve( did ) {
	return await axios.get( config.resolver + did ).then( result => result.data );
}

export function findKeyAgreement( doc, algorithm ) {
	const key = doc.keyAgreement.find( ka => ka.type === algorithm );
	if( !key ) return null;
	if( key.publicKeyHex ) return sodium.from_hex( key.publicKeyHex );
	if( key.publicKeyBase64 ) return sodium.from_base64( key.publicKeyBase64 );
	return null;
}

export function findAuthenticationMethod( doc, id ) {
	const key = doc.authentication.find( am => am.id === id );
	if( !key ) return null;
	if( key.publicKeyHex ) return Buffer.from( key.publicKeyHex, 'hex' );
	if( key.publicKeyBase64 ) return Buffer.from( key.publicKeyBase64, 'base64' );
	return null;
}