import { expressjwt, GetVerificationKey } from "express-jwt";
import jwksClient from "jwks-rsa";
import { Request } from "express";
import { appConfig } from "../config";
import axios from "axios";
import { AuthCookie } from "../types";

//console.log("JWT middleware file loaded",appConfig.JWKS_URI); // ✅ check if file loaded

 export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: appConfig.JWKS_URI,
    cache: true,
    rateLimit: true,
  }) as GetVerificationKey,

  algorithms: ["RS256"],

  getToken(req: Request) {
   // console.log("getToken called"); // ✅ check if middleware is running

    // Bearer ghdydtkjfdiysrtkdj
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.split(" ")[1] !== "undefined") {
      const token = authHeader.split(" ")[1];
      if (token) {
        return token;
      }
    }

  
    const { accessToken } = req.cookies as AuthCookie;
    return accessToken
  },
});
