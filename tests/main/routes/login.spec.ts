import request from "supertest";
import { type IBackup } from "pg-mem";
import { getConnection } from "typeorm";

import { app } from "@/main/config/app";
import { PostgresUser } from "@/infra/postgres/entities";
import { makeFakeDatabase } from "@/tests/infra/postgres/mocks";
import { UnauthorizedError } from "@/application/errors";

describe("Login Routes", () => {
  describe("POST /login/facebook", () => {
    let backup: IBackup;

    const loadUserSpy = jest.fn();
    jest.mock("@/infra/apis/facebook", () => {
      return {
        FacebookApi: jest.fn().mockReturnValue({
          loadUser: loadUserSpy,
        }),
      };
    });

    beforeAll(async () => {
      const db = await makeFakeDatabase([PostgresUser]);
      backup = db.backup();
    });

    afterAll(async () => {
      await getConnection().close();
    });

    beforeEach(() => {
      backup.restore();
    });

    it("should return 200 with AccessToken", async () => {
      loadUserSpy.mockResolvedValue({
        facebookId: "any_id",
        name: "any_name",
        email: "any_email",
      });

      const { status, body } = await request(app)
        .post("/api/login/facebook")
        .send({ token: "valid_token" });

      expect(status).toBe(200);
      expect(body.accessToken).toBeDefined();
    });

    it("should return 401 with UnauthorizedError", async () => {
      loadUserSpy.mockResolvedValue(undefined);

      const { status, body } = await request(app)
        .post("/api/login/facebook")
        .send({ token: "invalid_token" });

      expect(status).toBe(401);
      expect(body.error).toBe(new UnauthorizedError().message);
    });
  });
});
