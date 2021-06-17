export default {
	resolver: process.env.DID_RESOLVER_URL || 'https://resolver.lacchain.net/',
	did: {
		id: process.env.DID,
		encryptionKeyPair: {
			publicKey: process.env.ENCRYPTION_PUBLIC_KEY,
			privateKey: process.env.ENCRYPTION_PRIVATE_KEY,
		}
	},
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		port: process.env.REDIS_PORT || 6379,
	}
}