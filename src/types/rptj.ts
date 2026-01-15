declare module "rsa-pem-to-jwk" {
  export interface RsaPemToJwkOptions {
    use?: string;   // "sig"
    kid?: string;
    alg?: string;
  }

  export interface Jwk {
    kty: string;
    n: string;
    e: string;
    use?: string;
    kid?: string;
    alg?: string;
  }

  function rsaPemToJwk(
    pem: string,
    options?: RsaPemToJwkOptions,
    type?: "public" | "private"
  ): Jwk;

  export default rsaPemToJwk;
}
