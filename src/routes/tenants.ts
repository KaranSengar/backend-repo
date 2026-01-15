import express, { NextFunction, RequestHandler } from "express";
import { TenantController } from "../controllers/TenantController";
import { Request, Response } from "express";
import { CreateTenantRequest, ITenant } from "../types";
import { TenantService } from "../service/TenantService";
import { AppDataSource } from "../data-source";
import { Tenant } from "../entity/Tenantcreate";
import authentiction from "../middleware/authentiction";
import { canAccess } from "../middleware/canAccess";
import { Role } from "../constants";
import tenantValidator from "../validators/tenant-validator";
import { validate } from "../validators/empty/validatetenantemptybody";
import listUsersValidator from "../validators/list-users-validator";

const router = express.Router();
const tenantrepo = AppDataSource.getRepository(Tenant);
const tenantservice = new TenantService(tenantrepo);
const tenantController = new TenantController(tenantservice);
router.post(
  "/",
  authentiction as RequestHandler,
  canAccess([Role.ADMIN]),
  tenantValidator,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next) as unknown as RequestHandler,
);

router.patch(
  "/:id",
  authentiction,
  canAccess([Role.ADMIN]),
  tenantValidator,
  validate,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next),
);

router.get(
  "/",
  listUsersValidator,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getAll(req, res, next),
);

router.get("/:id", authentiction, canAccess([Role.ADMIN]), (req, res, next) =>
  tenantController.getOne(req, res, next),
);
router.delete(
  "/:id",
  authentiction,
  canAccess([Role.ADMIN]),
  (req, res, next) => tenantController.destroy(req, res, next),
);
export default router;
