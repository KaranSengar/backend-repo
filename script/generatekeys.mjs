import crypto from "crypto";
import fs from "fs";
import path from "path";

// ensure certs folder exists
const certsDir = path.resolve("certs");
if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir);

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
});

fs.writeFileSync(path.join(certsDir, "public.pem"), publicKey);
fs.writeFileSync(path.join(certsDir, "private.pem"), privateKey);

//console.log("✅ RSA key pair generated in certs/ folder");
