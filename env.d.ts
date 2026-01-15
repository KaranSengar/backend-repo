// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string; // ya string (agar strict nahi chahte)
    DB_HOST: string;
    DP_PORT: string; // ⚠ typo same rakha hai as .env
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    PORT: string;
    JWKS_URI: string;
    REFRESH_TOKEN_SECRET: string;
    PRIVATE_KEY:string
  }
}
