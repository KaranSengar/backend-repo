import logoutmiddleware from "../middleware/logoutmiddleware";

describe("logout middleware", () => {
  it("should be defined", () => {
    expect(logoutmiddleware).toBeDefined();
  });
});
