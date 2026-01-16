import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Empty body check (PATCH / PUT ke liye)
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "At least one field is required",
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  next();
};
