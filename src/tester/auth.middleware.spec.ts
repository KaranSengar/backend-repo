import authentiction from "../middleware/authentiction";

describe("authentiction middleware", () => {
  it("should be a function", () => {
    expect(typeof authentiction).toBe("function");
  });
});
