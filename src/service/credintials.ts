import bcrypt from "bcrypt";
export class Credentials {
  async comparePassword(userPassword: string, passwordhash: string) {
    return await bcrypt.compare(userPassword, passwordhash);
  }
}
