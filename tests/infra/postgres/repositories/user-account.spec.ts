import { type Repository, getConnection, getRepository } from "typeorm";
import { type IBackup } from "pg-mem";

import { makeFakeDatabase } from "@/tests/infra/postgres/mocks";
import { PostgresUserAccountRepository } from "@/infra/postgres/repositories";
import { PostgresUser } from "@/infra/postgres/entities";

describe("PostgresUserAccountRepository", () => {
  describe("load", () => {
    let sut: PostgresUserAccountRepository;
    let postgresUserRepository: Repository<PostgresUser>;
    let backup: IBackup;

    beforeAll(async () => {
      const db = await makeFakeDatabase([PostgresUser]);
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
