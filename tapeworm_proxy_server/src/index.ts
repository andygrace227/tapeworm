/**
 * Tapeworm Proxy Server
 * ©️ Andy Grace 2025. All Rights Reserved.
 * 
 * Tapeworm is a framework for building agents in Typescript and in JavaScript, and it runs in the browser and in Node or another server runtime.
 *
 * Tapeworm's Proxy Servers cater to the browser use case and allow you to securely provide access to an LLM of your choosing, using
 * Tapeworm's models.
 * 
 * This implementation seeks to be very dev-friendly and has these features:
 * - Rate limiting per user - allows you to securely give limited access to LLMs.
 * - Keeps your API keys secure by proxying instead of giving users direct access to your keys
 * 
 * @module
 */
import { Model, ModelRequest } from "@atgs/tapeworm";

/**
 * A reference, ready-to-go implementation of a proxy server for TapeWorm.
 * 
 * This can be used with Tapeworm's TapewormProxyServer class so you can run in-browser agentic AI.
 * 
 * While this implementation of Tapeworm assumes you will be using an Express.JS server setup, it's not enforced,
 * and you can use wrapper classes to get around this assumption.
 */
export default class TapewormProxyServer {
    model : Model;
    rateLimiter? : TapewormRateLimiter;

    /**
     * Invoke the model synchronously.
     */
    invokeSync(modelRequest : ModelRequest, connectionInfo: TapewormConnectionInformation) {
        if (this.rateLimiter == undefined || this.rateLimiter.attemptGrant(connectionInfo)) {
            return this.model.invoke(modelRequest);
        }
        throw new Error("Too many clients using the model right now. Please try again later.");
    }

}

/**
 * TapewormConnectionInformation is designed to let you use any framework for your server.
 */
export class TapewormConnectionInformation {
    ip!: string;
    user!: string;
}


/**
 * The Rate Limiter for Tapeworm provides an interface for rate limiting clients.
 * 
 * There is one function: `attemptGrant`.
 * 
 * THIS IS JUST A BASE CLASS. You will need to bring your own implementation for load balancing across multiple servers.
 */
export class TapewormRateLimiter {

    /**
     * Attempt to grant the client access to the model. 
     * @param connectionInfo a TapewormConnectionInformation object with either the user ID or the IP address.
     * @returns a boolean. TRUE if the connection is accepted.
     */
    attemptGrant(connectionInfo: TapewormConnectionInformation) : boolean {
        throw new TapewormRateLimiterNotDefinedError("attemptGrant was not defined by this implementation.");
    }
}

/**
 * An error that occurs when you don't override methods on the base class.
 */
class TapewormRateLimiterNotDefinedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TapewormRateLimiterNotDefinedError";
  }
}

export const TapewormConnectionInformationGranularity = {
  Username: "username",
  IP: "ip"
};

export type TapewormConnectionInformationGranularity =
  (typeof TapewormConnectionInformationGranularity)[keyof typeof TapewormConnectionInformationGranularity];

/**
 * A ProcessLocalRateLimiter is a mechanism that can prevent users from sending too many requests per second.
 * 
 * It only works per server process, so if you have a fleet of servers, then you probably should not be using this.
 */
export class ProcessLocalRateLimiter extends TapewormRateLimiter {
    granularity!: TapewormConnectionInformationGranularity;
    grantedRequestsPerSecondReciprocal!: number;
    clients!: any;

    constructor(){
        super();
    }

    /**
     * Attempt to grant the client access to the model. 
     */
    attemptGrant(connectionInfo: TapewormConnectionInformation) : boolean {
        let identifier = connectionInfo.ip;
        switch (this.granularity) {
            case TapewormConnectionInformationGranularity.Username:
                identifier = connectionInfo.user;
            break;
            default:
                identifier = connectionInfo.ip;
            break;
        }

        if (identifier in this.clients == false) {
            this.clients[identifier] = 0;
        }

        if (this.grantedRequestsPerSecondReciprocal + this.clients[identifier] > Date.now()) {
            this.clients[identifier] = Date.now();
            return true;
        }

        return false;
    }
}