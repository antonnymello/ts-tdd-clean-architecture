import { type IBackup, newDb } from "pg-mem";
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type Repository,
  getConnection,
  getRepository,
} from "typeorm";

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
    let sut: PostgresUserAccountRepository;
    let postgresUserRepository: Repository<PostgresUser>;
    let backup: IBackup;

    beforeAll(async () => {
      const db = newDb();

      const connection = await db.adapters.createTypeormConnection({
        type: "postgres",
        entities: [PostgresUser],
      });

      await connection.synchronize();

      backup = db.backup();

      postgresUserRepository = getRepository(PostgresUser);
    });

    afterAll(async () => {
      await getConnection().close();
    });

    beforeEach(() => {
      backup.restore();
      sut = new PostgresUserAccountRepository();
    });

    it("should return an account if email exists", async () => {
      await postgresUserRepository.save({ email: "any_email" });

      const account = await sut.load({ email: "any_email" });

      expect(account).toEqual({ id: "1" });
    });

    it("should return undefined if email does not exists", async () => {
      const account = await sut.load({ email: "any_email" });

      expect(account).toBeUndefined();
    });
  });
});
