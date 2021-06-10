import DIDConnectService from "./didconnect.js";
import DIDCommService from "./didcomm.js";
import RedisService from "./redis.js";

export const didConnectService = new DIDConnectService();
export const didCommService = new DIDCommService();
export const vcService = new RedisService( 1 );