import { getRepository } from "typeorm";
import { PostgresUser } from "@/infra/postgres/entities";
import { type LoadUserAccountRepository } from "@/data/contracts/repositories";

export class PostgresUserAccountRepository
  implements LoadUserAccountRepository {
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
