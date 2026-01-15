import { Request } from "express";
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  tenantId?:number
}

export interface RegisterRequest extends Request {
  body: UserData;
}

export interface TokenPayload {
  sab: string;
  role: string;
}

export interface Logindata {
  email: string;
  password: string;
}

export interface LoginRequest extends Request {
  body: Logindata;
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    jti: string; // ✅ THIS IS THE KEY
  };
}

export type AuthCookie = {
  accessToken: string;
  refreshToken: string;
};

export interface IRefreshTokenPayload {
  jti: string;
}

export interface ITenant {
  name: string;
  address: string;
}

export interface CreateTenantRequest extends Request {
  body: ITenant;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}

export interface LimitedUserData {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  tenantId: number;
}

export interface UpdateUserRequest extends Request {
  body: LimitedUserData;
}

export interface UserQueryParams {
  perPage: number;
  currentPage: number;
  q: string;
  role: string;
}

export interface TenantQueryParams {
  q: string;
  perPage: number;
  currentPage: number;
}

export interface CreateUserRequest extends Request {
  body: UserData;
}
