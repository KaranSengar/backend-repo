import { MigrationInterface, QueryRunner } from "typeorm";

export class Tenantcreate1768056716640 implements MigrationInterface {
    name = 'Tenantcreate1768056716640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenant" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "address" character varying(255) NOT NULL, "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da8c6efd67bb301e810e56ac139" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tenant"`);
    }

}
