import { AuthController } from "../controllers/AuthControllers";

describe("AuthController", () => {
  it("should be defined", () => {
    const controller = new AuthController({} as any, {} as any, {} as any);

    expect(controller).toBeDefined();
  });
});
