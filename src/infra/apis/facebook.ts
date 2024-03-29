import { type HttpGetClient } from "@/infra/http";
import { type LoadFacebookUserApi } from "@/data/contracts/apis";

type AppToken = {
  access_token: string;
};

type DebugToken = {
  data: { user_id: string };
};

type UserInfo = {
  id: string;
  name: string;
  email: string;
};

type Params = LoadFacebookUserApi.Params;
type Result = LoadFacebookUserApi.Result;

export class FacebookApi implements LoadFacebookUserApi {
  private readonly baseUrl = "https://graph.facebook.com";
  constructor(
    private readonly httpClient: HttpGetClient,
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {}

  async loadUser({ token }: Params): Promise<Result> {
    return this.getUserInfo(token)
      .then(({ id, name, email }) => ({ facebookId: id, name, email }))
      .catch(() => undefined);
  }

  private async getAppToken(): Promise<AppToken> {
    const params = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "client_credentials",
    };

    return this.httpClient.get({
      url: `${this.baseUrl}/oauth/access_token`,
      params,
    });
  }

  private async getDebugToken(clientToken: string): Promise<DebugToken> {
    const appToken = await this.getAppToken();

    const params = {
      access_token: appToken.access_token,
      input_token: clientToken,
    };

    return this.httpClient.get({ url: `${this.baseUrl}/debug_token`, params });
  }

  private async getUserInfo(clientToken: string): Promise<UserInfo> {
    const debugToken = await this.getDebugToken(clientToken);
    const fields = ["id", "name", "email"].join(",");
    const params = { fields, access_token: clientToken };

    return this.httpClient.get({
      url: `${this.baseUrl}/${debugToken.data.user_id}`,
      params,
    });
  }
}
