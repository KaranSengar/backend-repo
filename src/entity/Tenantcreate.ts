import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";

@Entity({ name: "tenant" })
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 100 })
  name: string;

  @Column("varchar", { length: 255 })
  address: string;

  @UpdateDateColumn()
  updateAt: number;

  @CreateDateColumn()
  createdAt: number;
}
