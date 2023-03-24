import { AuthenticationError } from "@/domain/errors";
import { type FacebookAuthentication } from "@/domain/features";
import { type LoadFacebookUserApi } from "@/data/contracts/apis";
import {
  type CreateFacebookAccountRepository,
  type LoadUserAccountRepository,
} from "@/data/contracts/repositories";

export class FacebookAuthenticationService {
  constructor(
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository &
      CreateFacebookAccountRepository
  ) {}

  async perform(
    params: FacebookAuthentication.Params
  ): Promise<AuthenticationError> {
    const facebookData = await this.facebookApi.loadUser(params);

    if (facebookData === undefined) return new AuthenticationError();

    await this.userAccountRepository.load({ email: facebookData.email });
    await this.userAccountRepository.createFromFacebook(facebookData);

    return new AuthenticationError();
  }
}
