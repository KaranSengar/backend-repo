import createHttpError from "http-errors";
import { Response, Request, NextFunction } from "express";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";

import { Userservice } from "../service/Userservice";
import { RegisterRequest, LoginRequest, AuthRequest } from "../types";
import logger from "../config/logger";
import { RefreshToken } from "../entity/Refreshtoken";
import { TokenService } from "../service/tokenservice";
import { User } from "../entity/User";
import { Credentials } from "../service/credintials";
import { AppDataSource } from "../data-source";
import { Role } from "../constants";

export class AuthController {
  constructor(
    private userService: Userservice,
    private tokenService: TokenService,
    private credentailsService: Credentials,
  ) {}

  // ================= REGISTER =================
  async register(req: RegisterRequest, res: Response, _next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const { firstName, lastName, email, password } = req.body;

      const userRepo = AppDataSource.getRepository(User);
      const existingUser = await userRepo.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Role.CUSTOMER,
      });

      // ❌ GALTI:
      // Tum yahan `id` use kar rahe the
      // JWT standard me user identity ke liye `sub` hota hai

      // ❌ OLD
      // const payload: JwtPayload = {
      //   id: String(user.id),
      //   role: user.role,
      // };

      // ✅ FIX (STANDARD JWT CLAIM)
      const payload: JwtPayload = {
        sub: String(user.id), // ✅ correct
        role: user.role,
      };

      // accesstoken me generateaccesstoken hai bo token service me logic implement hua hai
      const accessToken = this.tokenService.generateAccessToken(payload);

      // persist the refreshdata
      const newrefreshToken = await this.tokenService.persistRefreshtoken(user);
      /*  const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
       
      const refreshRepo = AppDataSource.getRepository(RefreshToken);


      const savedToken = await refreshRepo.save({
        user,
        expireAt: new Date(Date.now() + MS_IN_YEAR),
      });
*/
      // ❌ GALTI:
      // refresh token me `id` overwrite ho raha tha

      // ❌ OLD
      // const refreshToken = this.tokenService.generateRefreshToken({
      //   ...payload,
      //   id: String(savedToken.id),
      // });

      // ✅ FIX
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        tokenId: String(newrefreshToken.id), // ✅ separate field
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });

      return res.status(201).json({
        success: true,
        id: user.id,
        message: "User registered successfully",
      });
    } catch (error: any) {
      logger.error("REGISTER ERROR 👉", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // ================= LOGIN =================
  async login(req: LoginRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }
    try {
      if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "Email or password missing" });
      }

      const { email, password } = req.body;
      logger.debug("new request to login a user", {
        email,
        password: "******",
      });
      /// check if username(email) exists in database
      //compare password
      //Generate tokens
      // add tokens to cookies
      // return the reponse(id)
      const user = await this.userService.findByEmail(email);

      if (!user) {
        const error = createHttpError(400, "email match not in database");
        next(error);
        return;
      }
      const passwordMatch = await this.credentailsService.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatch) {
        const error = createHttpError(400, "password  not in match database");
        next(error);
        return;
      }

      // ✅ FIX (STANDARD JWT CLAIM)
      const payload: JwtPayload = {
        sub: String(user.id), // ✅ correct
        role: user.role,
      };

      // accesstoken me generateaccesstoken hai bo token service me logic implement hua hai
      const accessToken = this.tokenService.generateAccessToken(payload);

      // persist the refreshdata
      const newrefreshToken = await this.tokenService.persistRefreshtoken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        tokenId: String(newrefreshToken.id), // ✅ separate field
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
      logger.info("user has been  login", { id: user.id });
      return res.status(200).json({
        user,
        success: true,
        id: user.id,
        message: "User login successfully",
      });
    } catch (error: any) {
      logger.error("REGISTER ERROR 👉", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // ================= SELF =================
  async self(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log("AUTH PAYLOAD 👉", req.auth);

      const userId = req.auth?.sub;

      if (!userId) {
        return res.status(401).json({ message: "Invalid token payload" });
      }

      const user = await this.userService.findById(Number(userId));

      return res.status(200).json({ ...user, password: undefined });
    } catch (err) {
      next(err); // 404 or other errors
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sub = req.auth?.sub;
      const jti = req.auth?.jti;

      if (!sub || !jti) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const userId = Number(sub);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user id in token" });
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        return next(createHttpError(404, "User not found"));
      }

      // ✅ delete OLD refresh token
      await this.tokenService.deleteRefreshToken(Number(jti));

      // ✅ create NEW refresh token
      const newRefreshToken = await this.tokenService.persistRefreshtoken(user);

      const payload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        tokenId: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });

      return res.status(200).json({
        success: true,
        id: user.id,
        message: "Token refreshed successfully",
      });
    } catch (error) {
      logger.error("REFRESH ERROR", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.jti));

      logger.info("Refresh token has been deleted", {
        jti: req.auth.jti,
      });
      logger.info("User has been logged out", { id: req.auth.sub });
      res.status(200).json({
        success: true,
        message: "logout successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}
