import { PostgresUserAccountRepository } from "@/infra/postgres/repositories";

export const makePostgresUserAccountRepository =
  (): PostgresUserAccountRepository => {
    return new PostgresUserAccountRepository();
  };
