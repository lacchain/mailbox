import { promisify } from "util";
import redis from "redis";
import config from "../config.js";

export default class RedisService {

	constructor( db ) {
		const redisClient = redis.createClient( {
			host: config.redis.host,
			port: config.redis.port,
			db
		} );
		this.set = promisify( redisClient.setex ).bind( redisClient );
		this.hset = promisify( redisClient.hset ).bind( redisClient );
		this.hdel = promisify( redisClient.hdel ).bind( redisClient );
		this.get = promisify( redisClient.get ).bind( redisClient );
		this.hvals = promisify( redisClient.hvals ).bind( redisClient );
		this.del = promisify( redisClient.del ).bind( redisClient );
	}

}