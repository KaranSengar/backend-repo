import { JwtPayload, sign } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import { appConfig } from "../config";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { RefreshToken } from "../entity/Refreshtoken";
import { Repository } from "typeorm";
export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;

    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, "../certs/private.pem"), // ✅ file ka exact path
      );
      console.log(privateKey, "yahi hai private key");
    } catch (err) {
      const error = createHttpError(500, "Error while reading private key");
      throw error;
    }
    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "backend",
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, appConfig.REFRESH_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "backend",
      jwtid: String(payload.tokenId),
    });
    return refreshToken;
  }

  async persistRefreshtoken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
    // persist the refreshdata

    const newRefreshtoken = await this.refreshTokenRepository.save({
      user,
      expireAt: new Date(Date.now() + MS_IN_YEAR),
    });
    return newRefreshtoken;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.refreshTokenRepository.delete({ id: tokenId });
  }
}
