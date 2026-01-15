import express, { Request, Response, NextFunction } from "express";
import { Userservice } from "../service/Userservice";
import { AuthController } from "../controllers/AuthControllers";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import registerValidator from "../validators/register-validator";
import { TokenService } from "../service/tokenservice";

import { AuthRequest } from "../types";
import vallidateRefreshtoken from "../middleware/vallidateRefreshtoken";
import { RefreshToken } from "../entity/Refreshtoken";
import loginvalidator from "../validators/loginvalidator";
import { Credentials } from "../service/credintials";
import authentiction from "../middleware/authentiction";
import logoutmiddleware from "../middleware/logoutmiddleware";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new Userservice(userRepository);
const refreshtokenrepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshtokenrepository);
const credentailsService = new Credentials();
const authController = new AuthController(
  userService,
  tokenService,
  credentailsService,
);

router.post(
  "/register",
  registerValidator,
  (req: Request, res: Response, next: NextFunction) => {
    // console.log("🔥 ROUTE HIT");
    //console.log("📦 BODY FROM POSTMAN:", req.body);
    //console.log("📨 HEADERS:", req.headers["content-type"]);

    return authController.register(req, res, next);
  },
);

router.post(
  "/login",
  loginvalidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
);

router.get(
  "/self",
  authentiction,
  (req: AuthRequest, res: Response, next: NextFunction) =>
    authController.self(req, res, next),
);

router.post(
  "/refresh",
  vallidateRefreshtoken,
  (req: AuthRequest, res: Response, next: NextFunction) =>
    authController.refresh(req, res, next),
);

router.post(
  "/logout",
  authentiction,
  logoutmiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as AuthRequest, res, next),
);

export default router;
