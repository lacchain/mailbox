import express from 'express';
import http from 'http';
import https from "https";
import cors from 'cors';
import MediatorRouter from "./routes/mediator.js";
import fs from "fs";

const app = express();
const mediatorRouter = new MediatorRouter();

app.use( cors() );
app.use( express.json( { limit: '50mb' }) );
app.use( express.urlencoded( { extended: false, limit: '50mb' } ) );

app.use( function( req, res, next ) {
	res.setHeader( 'Strict-Transport-Security', 'max-age=15724800; includeSubDomains' );
	next();
} );

app.use( '/', mediatorRouter.getRouter() );

if( !process.env.SSL ) {
	const server = http.createServer( app );

	server.listen( process.env.MEDIATOR_PORT, function() {
		console.log( 'LACChain ID | API Server v2.0 HTTP port', process.env.MEDIATOR_PORT );
	} );
} else {
	const privateKey = fs.readFileSync( process.env.CERT_KEY, 'utf8' );
	const certificate = fs.readFileSync( process.env.CERT_CRT, 'utf8' );
	const credentials = { key: privateKey, cert: certificate };
	const ssl = https.createServer( credentials, app );

	ssl.listen( process.env.MEDIATOR_PORT, '0.0.0.0', function() {
		console.log( 'LACChain ID | API Server v1.0 HTTPS port', process.env.MEDIATOR_PORT );
	} );
}