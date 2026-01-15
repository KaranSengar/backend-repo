import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    trim: true,
    errorMessage: "Email is Required",
    notEmpty: true,
    isEmail: {
      errorMessage: "email should be a valid email",
    },
  },
  password: {
    trim: true,
    errorMessage: "Last name is Required",
    notEmpty: true,
  },
});
