import { checkSchema } from "express-validator";

export default checkSchema({
  name: {
    optional: true,
    trim: true,
    notEmpty: {
      errorMessage: "Tenant name cannot be empty",
    },
  },
  address: {
    optional: true,
    trim: true,
    notEmpty: {
      errorMessage: "Tenant address cannot be empty",
    },
  },
});
