import { newDb } from "pg-mem";
import { Column, Entity, PrimaryGeneratedColumn, getRepository } from "typeorm";

import { type LoadUserAccountRepository } from "@/data/contracts/repositories";

class PostgresUserAccountRepository implements LoadUserAccountRepository {
  async load(
    params: LoadUserAccountRepository.Params
  ): Promise<LoadUserAccountRepository.Result> {
    const postgresUserRepository = getRepository(PostgresUser);
    const postgresUser = await postgresUserRepository.findOne({
      email: params.email,
    });

    if (postgresUser === undefined) return;

    return {
      id: postgresUser.id.toString(),
      name: postgresUser.name ?? undefined,
    };
  }
}

@Entity({ name: "users" })
class PostgresUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  name?: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  facebookId?: string;
}

describe("PostgresUserAccountRepository", () => {
  describe("load", () => {
    it("should return an account if email exists", async () => {
      const db = newDb();

      const connection = await db.adapters.createTypeormConnection({
        type: "postgres",
        entities: [PostgresUser],
      });

      await connection.synchronize();

      const postgresUserRepository = getRepository(PostgresUser);
      await postgresUserRepository.save({
        email: "existing_email",
      });

      const sut = new PostgresUserAccountRepository();

      const account = await sut.load({ email: "existing_email" });

      expect(account).toEqual({ id: "1" });
    });
  });
});
