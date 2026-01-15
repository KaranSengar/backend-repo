/// is middlaware ka kam hai phlle ham get krenge database refresh token ko agr bo hai to nhi hai new create karenge

import { expressjwt } from "express-jwt";
import { Request } from "express";
import { appConfig } from "../config";

import { AuthCookie } from "../types";
export default expressjwt({
  secret: appConfig.REFRESH_TOKEN_SECRET,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
});
