import { AuthenticationError } from "@/domain/errors";
import { type FacebookAuthentication } from "@/domain/features";
import { type LoadFacebookUserApi } from "@/data/contracts/apis";
import { AccessToken, FacebookAccount } from "@/domain/models";
import { type TokenGenerator } from "@/data/contracts/crypto";
import {
  type LoadUserAccountRepository,
  type SaveFacebookAccountRepository,
} from "@/data/contracts/repositories";

export class FacebookAuthenticationService {
  constructor(
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository &
      SaveFacebookAccountRepository,
    private readonly crypto: TokenGenerator
  ) {}

  async perform(
    params: FacebookAuthentication.Params
  ): Promise<AuthenticationError> {
    const facebookData = await this.facebookApi.loadUser(params);

    if (facebookData === undefined) return new AuthenticationError();

    const account = await this.userAccountRepository.load({
      email: facebookData.email,
    });

    const facebookAccount = new FacebookAccount(facebookData, account);

    const { id } = await this.userAccountRepository.saveWithFacebook(
      facebookAccount
    );

    await this.crypto.generateToken({
      key: id,
      expirationInMs: AccessToken.expirationInMs,
    });

    return new AuthenticationError();
  }
}
