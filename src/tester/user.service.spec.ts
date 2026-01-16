import { Userservice } from "../service/Userservice";

describe("Userservice", () => {
  it("should create service instance", () => {
    const repo = {} as any;
    const service = new Userservice(repo);

    expect(service).toBeDefined();
  });
});
