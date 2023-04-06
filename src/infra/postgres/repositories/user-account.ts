/* eslint-disable @typescript-eslint/brace-style */
import { getRepository } from "typeorm";
import { PostgresUser } from "@/infra/postgres/entities";
import {
  type SaveFacebookAccountRepository,
  type LoadUserAccountRepository,
} from "@/data/contracts/repositories";

export class PostgresUserAccountRepository
  implements LoadUserAccountRepository
{
  private readonly postgresUserRepository = getRepository(PostgresUser);

  async load(
    params: LoadUserAccountRepository.Params
  ): Promise<LoadUserAccountRepository.Result> {
    const postgresUser = await this.postgresUserRepository.findOne({
      email: params.email,
    });

    if (postgresUser === undefined) return;

    return {
      id: postgresUser.id.toString(),
      name: postgresUser.name ?? undefined,
    };
  }

  async saveWithFacebook(
    params: SaveFacebookAccountRepository.Params
  ): Promise<SaveFacebookAccountRepository.Result> {
    if (params.id !== undefined) {
      await this.postgresUserRepository.update(
        { id: Number(params.id) },
        { name: params.name, facebookId: params.facebookId }
      );

      return { id: params.id };
    }

    const user = await this.postgresUserRepository.save({
      email: params.email,
      name: params.name,
      facebookId: params.facebookId,
    });

    return { id: String(user.id) };
  }
}
