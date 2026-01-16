import { TokenService } from "../service/tokenservice";

describe("TokenService", () => {
  it("should create token service", () => {
    const repo = {} as any;
    const service = new TokenService(repo);

    expect(service).toBeDefined();
  });
});
