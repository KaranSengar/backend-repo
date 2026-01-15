import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  // 🔴 EMPTY BODY CHECK (PATCH ke liye compulsory)
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "At least one field is required",
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  next();
};
