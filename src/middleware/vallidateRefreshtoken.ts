/// is middlaware ka kam hai phlle ham get krenge database refresh token ko agr bo hai to nhi hai new create karenge

import { expressjwt } from "express-jwt";
import { Request } from "express";
import { appConfig } from "../config";
import { AppDataSource } from "../data-source";
import { RefreshToken } from "../entity/Refreshtoken";
import logger from "../config/logger";
import { AuthCookie, IRefreshTokenPayload } from "../types";
export default expressjwt({
  secret: appConfig.REFRESH_TOKEN_SECRET,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie;
    return refreshToken;
  },
  // yaha ham database me check karenge ki database me hai ya nhi ya user ne reboke kiya hua hai ya user us token se logout kiya hua hai

  async isRevoked(req: Request, token) {
    //console.log(token, "token");
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const refreshtoken = await refreshTokenRepo.findOne({
        where: {
          id: Number((token?.payload as IRefreshTokenPayload).jti),
          user: { id: Number(token?.payload.sub) },
        },
      });
      return refreshtoken === null;
    } catch (err) {
      logger.error("error while the refresh token", {
        id: (token.payload as IRefreshTokenPayload).jti,
      });
    }
    return true;
  },
});
