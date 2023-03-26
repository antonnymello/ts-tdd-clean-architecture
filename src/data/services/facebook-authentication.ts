import { AuthenticationError } from "@/domain/errors";
import { type FacebookAuthentication } from "@/domain/features";
import { type LoadFacebookUserApi } from "@/data/contracts/apis";
import {
  type LoadUserAccountRepository,
  type SaveFacebookAccountRepository,
} from "@/data/contracts/repositories";

export class FacebookAuthenticationService {
  constructor(
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository &
      SaveFacebookAccountRepository
  ) {}

  async perform(
    params: FacebookAuthentication.Params
  ): Promise<AuthenticationError> {
    const facebookData = await this.facebookApi.loadUser(params);

    if (facebookData === undefined) return new AuthenticationError();

    const account = await this.userAccountRepository.load({
      email: facebookData.email,
    });

    await this.userAccountRepository.saveWithFacebook({
      id: account?.id,
      name: account?.name ?? facebookData.name,
      email: facebookData.email,
      facebookId: facebookData.facebookId,
    });

    return new AuthenticationError();
  }
}
