import { type Repository, getConnection, getRepository } from "typeorm";
import { type IBackup } from "pg-mem";

import { makeFakeDatabase } from "@/tests/infra/postgres/mocks";
import { PostgresUserAccountRepository } from "@/infra/postgres/repositories";
import { PostgresUser } from "@/infra/postgres/entities";

type PostgresUserRepository = Repository<PostgresUser>;

describe("PostgresUserAccountRepository", () => {
  let sut: PostgresUserAccountRepository;
  let postgresUserRepository: PostgresUserRepository;
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

  describe("load", () => {
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

  describe("saveWithFacebook", () => {
    it("should create a new account if id is undefined", async () => {
      const accountData = {
        email: "any_email",
        name: "any_name",
        facebookId: "any_facebook_id",
      };

      const account = await sut.saveWithFacebook(accountData);

      const user = await postgresUserRepository.findOne({ email: "any_email" });

      expect(user?.id).toBe(1);
      expect(account.id).toBe("1");
    });

    it("should update account if id is defined", async () => {
      await postgresUserRepository.save({
        email: "any_email",
        name: "any_name",
        facebookId: "any_facebook_id",
      });

      const { id } = await sut.saveWithFacebook({
        id: "1",
        email: "new_email",
        name: "new_name",
        facebookId: "new_facebook_id",
      });

      const user = await postgresUserRepository.findOne({ id: 1 });

      expect(user).toEqual({
        id: 1,
        email: "any_email",
        name: "new_name",
        facebookId: "new_facebook_id",
      });
      expect(id).toBe("1");
    });
  });
});
