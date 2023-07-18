import { v4 } from 'uuid';
import Router from './router.js';
import { didCommService, vcService } from '../services/index.js';
import config from "../config.js";

export default class MediatorRouter extends Router {

	init() {

		this.get( '/vc', 'AUTHENTICATED', async req => {
			const { did } = req;
			const ids = await vcService.hkeys( did );
			const credentials = await vcService.hvals( did );
			return credentials.map( (vc, index) => ({ ['@mid']: ids[index], ...JSON.parse( vc ) }) );
		} );

		this.post( '/vc', 'AUTHENTICATED', async (req, res) => {
			res.setHeader('Access-Control-Allow-Origin','*');
			const { body } = req;
			const id = v4();
			const message = await didCommService.decrypt( body, config.did.encryptionKeyPair );
			const envelope = JSON.parse( message.message );
			await vcService.hset( envelope.body.next, id, JSON.stringify( envelope.body["payloads~attach"][0] ) );
			return id;
		} );

		this.delete( '/vc', 'AUTHENTICATED', async req => {
			const { did } = req;
			return await vcService.del( did );
		} );

		this.delete( '/vc/:id', 'AUTHENTICATED', async req => {
			const { did, params: { id } } = req;
			return await vcService.hdel( did, id );
		} );
	}
}