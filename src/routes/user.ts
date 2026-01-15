import express, { NextFunction } from "express";
import { TenantController } from "../controllers/TenantController";
import { Request, Response } from "express";
import {
  CreateTenantRequest,
  CreateUserRequest,
  ITenant,
  UpdateUserRequest,
} from "../types";
import { TenantService } from "../service/TenantService";
import { AppDataSource } from "../data-source";
import { Tenant } from "../entity/Tenantcreate";
import authentiction from "../middleware/authentiction";
import { canAccess } from "../middleware/canAccess";
import { Role } from "../constants";
import tenantValidator from "../validators/tenant-validator";
import { validate } from "../validators/empty/validatetenantemptybody";
import listUsersValidator from "../validators/list-users-validator";
import { UserController } from "../controllers/userController";
import { Userservice } from "../service/Userservice";
import { User } from "../entity/User";
import createUserValidator from "../validators/users-validation/create-user-validator";
import updateUserValidation from "../validators/users-validation/update-user-validation";

const router = express.Router();
const userrepo = AppDataSource.getRepository(User);
const userService = new Userservice(userrepo);
const userController = new UserController(userService);

router.post(
  "/",
  authentiction,
  canAccess([Role.ADMIN]),
  createUserValidator,
  (req: CreateUserRequest, res: Response, next: NextFunction) =>
    userController.create(req, res, next),
);

router.patch(
  "/:id",
  authentiction,
  canAccess([Role.ADMIN]),
  updateUserValidation,
  (req: UpdateUserRequest, res: Response, next: NextFunction) =>
    userController.update(req, res, next),
);

router.get(
  "/",
  authentiction,
  canAccess([Role.ADMIN]),
  listUsersValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next),
);

router.get("/:id", authentiction, canAccess([Role.ADMIN]), (req, res, next) =>
  userController.getOne(req, res, next),
);
router.delete(
  "/:id",
  authentiction,
  canAccess([Role.ADMIN]),
  (req, res, next) => userController.destroy(req, res, next),
);
export default router;
