import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ManyToOne } from "typeorm";
import { Tenant } from "./Tenantcreate";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  firstName: string;

  @Column({ type: "varchar", length: 100 })
  lastName: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "varchar", default: "USER" })
  role: string;

  @Column({ type: "varchar", nullable: true })
  name?: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;
}
