import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "refreshTokens" })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp" })
  expireAt: Date;

  @ManyToOne(() => User)
  user: User;

  @UpdateDateColumn()
  updateAt: number;

  @CreateDateColumn()
  createdAt: number;
}
