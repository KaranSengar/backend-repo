import { Brackets, Repository } from "typeorm";
import { User } from "../entity/User";
import { LimitedUserData, UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import { Role } from "../constants";
import bcrypt from "bcrypt";

export class Userservice {
  constructor(private userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData): Promise<User> {
    //  find the exists email
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (user) {
      const err = createHttpError(400, "email already exits!");
      throw err;
    }
    //hash the  password
    const hashpassword = await bcrypt.hash(password, 10);
    try {
      const user = this.userRepository.create({
        firstName,
        lastName,
        email,
        password: hashpassword,
        role: role,
        tenant: tenantId ? { id: tenantId } : undefined,
      });

      return await this.userRepository.save(user); // ✅ RETURN USER
    } catch (err) {
      if (err.code === "23503") {
        // PostgreSQL FK violation
        throw createHttpError(400, "Invalid tenantId");
      }
      throw createHttpError(500, "Failed to store the data in the database");
    }
  }
  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: ["id", "firstName", "lastName", "email", "role", "password"],
      relations: {
        tenant: true,
      },
    });
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { tenant: true },
    });

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    return user;
  }

  async update(
    userId: number,
    { firstName, lastName, role, email, tenantId }: LimitedUserData,
  ) {
    try {
      const result = await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
        email,
        tenant: tenantId ? { id: tenantId } : null,
      });

      if (result.affected === 0) {
        throw createHttpError(404, "User not found"); // ✅ 404 throw
      }

      return result;
    } catch (err) {
      if ((err as any).status) throw err; // pass custom errors
      throw createHttpError(500, "Failed to update the user in the database");
    }
  }

  async getAll(validatedQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm,
          }).orWhere("user.email ILike :q", { q: searchTerm });
        }),
      );
    }

    if (validatedQuery.role) {
      queryBuilder.andWhere("user.role = :role", {
        role: validatedQuery.role,
      });
    }

    const result = await queryBuilder
      .leftJoinAndSelect("user.tenant", "tenant")
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy("user.id", "DESC")
      .getManyAndCount();
    return result;
  }

  async deleteById(userId: number) {
    // 1️⃣ Check if user exists
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    // 2️⃣ Delete user
    try {
      await this.userRepository.delete(userId);
    } catch (err) {
      throw createHttpError(500, "Failed to delete user");
    }
  }
}
