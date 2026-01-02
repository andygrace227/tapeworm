import { Model } from "@atgs/tapeworm";
import {ProcessLocalRateLimiter, TapewormConnectionInformationGranularity, TapewormConnectionInformation} from "./index"
class FakeModel extends Model {
  requests: any[] = [];
  private responses: any[];

  constructor(responses: any[]) {
    super();
    this.responses = [...responses];
  }

  async invoke(request: any) {
    this.requests.push(request);
    return this.responses.shift() as any;
  }
}


describe("Process Local Limiter works as expected", () => {

    it("rejects when user sends too many requests", () => {
        let rateLimiter = new ProcessLocalRateLimiter(TapewormConnectionInformationGranularity.IP, 1);

        let connectionInfo = new TapewormConnectionInformation();
        connectionInfo.ip = "fakeIP";

        expect(rateLimiter.attemptGrant(connectionInfo)).toBe(true);
        expect(rateLimiter.attemptGrant(connectionInfo)).toBe(false);
    });
    
    it("does not reject when user sends rate limited requests", async () => {
        let rateLimiter = new ProcessLocalRateLimiter(TapewormConnectionInformationGranularity.IP, 1);
        let connectionInfo = new TapewormConnectionInformation();
        connectionInfo.ip = "fakeIP";

        expect(rateLimiter.attemptGrant(connectionInfo)).toBe(true);
        await new Promise((r) => setTimeout(r, 1001));
        expect(rateLimiter.attemptGrant(connectionInfo)).toBe(true);
    });

    it("can handle multiple users", async () => {
        let rateLimiter = new ProcessLocalRateLimiter(TapewormConnectionInformationGranularity.IP, 1);

        let connectionInfo1 = new TapewormConnectionInformation();
        connectionInfo1.ip = "fakeIP";

        let connectionInfo2 = new TapewormConnectionInformation();
        connectionInfo2.ip = "fakeIP2";

        expect(rateLimiter.attemptGrant(connectionInfo1)).toBe(true);
        expect(rateLimiter.attemptGrant(connectionInfo2)).toBe(true);
        
        expect(rateLimiter.attemptGrant(connectionInfo1)).toBe(false);
        expect(rateLimiter.attemptGrant(connectionInfo2)).toBe(false);
        await new Promise((r) => setTimeout(r, 1001));
        expect(rateLimiter.attemptGrant(connectionInfo1)).toBe(true);
        expect(rateLimiter.attemptGrant(connectionInfo2)).toBe(true);
        
    });

});
