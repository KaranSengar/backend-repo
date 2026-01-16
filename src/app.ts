import { type NextFunction, type Request, type Response } from "express";
import express from "express";
import logger from "./config/logger";
import type { HttpError } from "http-errors";
import path from "node:path";
import createHttpError from "http-errors";
import Routeauth from "./routes/auth";
import cookieParser from "cookie-parser";
import { appConfig } from "./config";
import authentiction from "./middleware/authentiction";
import TenantRoute from "./routes/tenants";
import UserRoute from "./routes/user";

export const app = express();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  // return next(createHttpError(401, "you can not access this route"));
  res.status(200).send("honey ");
});
console.log(appConfig.JWKS_URI);

app.use(cookieParser());
app.use(express.json());
app.use("/users", UserRoute);
app.use("/auth", Routeauth);
app.use("/tenants", TenantRoute);
app.use(express.static("public"));
app.use("./api", authentiction);
app.get("/.well-known/jwks.json", (req, res) => {
  res.json({
    keys: [
      {
        kty: "RSA",
        use: "sig",
        alg: "RS256",
        kid: "auth-key-1",
        n: "AKZ9xLmdsOK9-R2BM37EP7sLcoTYdtmheKfaVkauMDsgcw6ExYlpic_7YCMImbapui3_qfIwzfpBzO_tqngVZQL4Dj41IB_4JYlRfgz5Wr8LTdyu8vgSn_f3v4hvHfIedndvkjs0r0COP9hW0oBBbF2I_CB6WXDKkCvBfaZ4mzh1_t8OLIh37u_77Adl6cnyUNGeNojAd6xRqzOl_EVrXqfe0VpcXFHePXCOPf0PbUKb1XBYfwnEclO9hYchzSvds32u5BvBsTnTXfFd_kB2DoTbcYhpzC-PIUKQ-FxNhPOMy8oox5pzK9aQpLG8PBDzx1_riO1KFl5Lm4JXzrnbGtk",
        e: "AQAB",
      },
    ],
  });
});

//global error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // console.log(err, res);
  // 🔐 JWT / Auth error
  if (err.name === "UnauthorizedError") {
    logger.warn(err.message);
    console.log(err.message);
    return res.status(401).json({
      errors: [
        {
          type: "Unauthorized",
          msg: err.message,
          path: "",
          location: "header",
        },
      ],
    });
  }

  // ❌ Baaki sab server error
  const statusCode = err.statusCode || err.status || 500;

  logger.error(err.message);
  console.log(statusCode, "app ji aap fail huye");

  res.status(statusCode).json({
    errors: [
      {
        type: err.name || "InternalServerError",
        msg: err.message || "Internal Server Error",
        path: "",
        location: "",
      },
    ],
  });
});
