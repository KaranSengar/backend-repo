import { NextFunction, Response, Request } from "express";
import { CreateTenantRequest, ITenant, TenantQueryParams } from "../types";
import { TenantService } from "../service/TenantService";
import logger from "../config/logger";
import createHttpError from "http-errors";
import { matchedData, validationResult } from "express-validator";

export class TenantController {
  constructor(private tenantService: TenantService) {}
  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const { name, address } = req.body;
    logger.debug("error the data condition", req.body);
    try {
      const tenant = await this.tenantService.create({ name, address });
      logger.info("tenant has been created", { id: tenant.id });
      res.status(201).json({ id: tenant.id });
    } catch (err) {
      next(err);
    }
  }

  async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    logger.debug("Request for updating a tenant", req.body);

    try {
      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      });

      logger.info("Tenant has been updated", { id: tenantId });

      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true });
    try {
      const [tenants, count] = await this.tenantService.getAll(
        validatedQuery as TenantQueryParams,
      );

      logger.info("All tenant have been fetched");
      res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
        data: tenants,
      });

      res.json(tenants);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      const tenant = await this.tenantService.getById(Number(tenantId));

      if (!tenant) {
        next(createHttpError(400, "Tenant does not exist."));
        return;
      }

      logger.info("Tenant has been fetched");
      res.json(tenant);
    } catch (err) {
      next(err);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      await this.tenantService.deleteById(Number(tenantId));

      logger.info("Tenant has been deleted", {
        id: Number(tenantId),
      });
      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
    }
  }
}
