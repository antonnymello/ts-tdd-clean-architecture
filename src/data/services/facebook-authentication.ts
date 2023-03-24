import { AuthenticationError } from "@/domain/errors";
import { type FacebookAuthentication } from "@/domain/features";
import { type LoadFacebookUserApi } from "@/data/contracts/apis";
import { type LoadUserAccountRepository } from "@/data/contracts/repositories";

export class FacebookAuthenticationService {
  constructor(
    private readonly loadFacebookUserApi: LoadFacebookUserApi,
    private readonly loadUserAccountRepository: LoadUserAccountRepository
  ) {}

  async perform(
    params: FacebookAuthentication.Params
  ): Promise<AuthenticationError> {
    const facebookData = await this.loadFacebookUserApi.loadUser(params);

    if (facebookData === undefined) return new AuthenticationError();

    await this.loadUserAccountRepository.load({ email: facebookData.email });

    return new AuthenticationError();
  }
}
