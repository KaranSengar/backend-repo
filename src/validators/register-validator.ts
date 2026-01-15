import { checkSchema, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const registerValidator = [
  ...checkSchema({
    email: {
      notEmpty: {
        errorMessage: "email is required",
      },
      isEmail: {
        errorMessage: "invalid email format",
      },
      trim: true,
    },
    password: {
      notEmpty: {
        errorMessage: "password is required",
      },
      isLength: {
        options: { min: 6 },
        errorMessage: "password must be at least 6 characters",
      },
    },
  }),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    next();
  },
];

export default registerValidator;
