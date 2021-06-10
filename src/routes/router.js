import express from 'express';
import { didConnectService } from "../services/index.js";

export default class Router {

	constructor() {
		this.router = express.Router();
		this.init();
	}

	init() {
	}

	get( path, permission, ...callbacks ) {
		this.router.get( path, this._bindCustomResponses, this._checkAuthorization( permission ), this._getCallbacks( callbacks ) );
	}

	post( path, permission, ...callbacks ) {
		this.router.post( path, this._bindCustomResponses, this._checkAuthorization( permission ), this._getCallbacks( callbacks ) );
	}

	delete( path, permission, ...callbacks ) {
		this.router.delete( path, this._bindCustomResponses, this._checkAuthorization( permission ), this._getCallbacks( callbacks ) );
	}

	getRouter() {
		return this.router;
	}

	_checkAuthorization( permission ) {
		return async( req, res, next ) => {
			if( permission === 'PUBLIC' ) return next();
			if( permission === 'AUTHENTICATED' ) {
				const { token } = req.headers;
				req.did = await didConnectService.authenticate( token );
				return next();
			}
		}
	}

	_getCallbacks( callbacks ) {
		return callbacks.map( ( callback ) => async( ...params ) => {
			try {
				const response = await callback.apply( this, params )
				params[1].sendSuccess( response );
			} catch( error ) {
				params[1].sendError( error + '' );
			}
		} );
	}

	_bindCustomResponses( req, res, next ) {
		res.sendSuccess = ( payload ) => {
			res.status( 200 ).json( payload );
		};
		res.sendError = ( error ) => {
			res.status( 500 ).json( error );
		};
		next();
	}
}