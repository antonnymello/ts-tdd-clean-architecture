import { AuthenticationError } from "@/domain/errors";
import { type FacebookAuthentication } from "@/domain/features";
import { type LoadFacebookUserApi } from "../contracts/apis";

export class FacebookAuthenticationService {
  constructor(private readonly loadFacebookUserApi: LoadFacebookUserApi) {}

  async perform(
    params: FacebookAuthentication.Params
  ): Promise<AuthenticationError> {
    await this.loadFacebookUserApi.loadUser(params);
    return new AuthenticationError();
  }
}
