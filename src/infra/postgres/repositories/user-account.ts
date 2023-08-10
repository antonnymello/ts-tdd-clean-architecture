/* eslint-disable @typescript-eslint/brace-style */
import { getRepository } from "typeorm";
import { PostgresUser } from "@/infra/postgres/entities";
import {
  type SaveFacebookAccountRepository,
  type LoadUserAccountRepository,
} from "@/data/contracts/repositories";

export class PostgresUserAccountRepository
  implements LoadUserAccountRepository, SaveFacebookAccountRepository
{
  private readonly postgresUserRepository = getRepository(PostgresUser);

  async load({
    email,
  }: LoadUserAccountRepository.Params): Promise<LoadUserAccountRepository.Result> {
    const postgresUser = await this.postgresUserRepository.findOne({
      email,
    });

    if (postgresUser === undefined) return;

    return {
      id: postgresUser.id.toString(),
      name: postgresUser.name ?? undefined,
    };
  }

  async saveWithFacebook({
    id,
    name,
    email,
    facebookId,
  }: SaveFacebookAccountRepository.Params): Promise<SaveFacebookAccountRepository.Result> {
    if (id !== undefined) {
      await this.postgresUserRepository.update(
        { id: Number(id) },
        { name, facebookId }
      );

      return { id };
    }

    const user = await this.postgresUserRepository.save({
      email,
      name,
      facebookId,
    });

    return { id: String(user.id) };
  }
}
