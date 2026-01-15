import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

/* ---------- READ PRIVATE KEY ---------- */
const privateKeyPath = fs.readFileSync("./certs/private.pem");

/* ---------- GENERATE JWK ---------- */
const jwk = rsaPemToJwk(privateKeyPath, { use: "sig" }, "public");

/* ---------- WRITE TO PUBLIC FOLDER ---------- */
console.log(JSON.stringify(jwk));
