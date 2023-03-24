import { type LoadFacebookUserApi } from "@/data/contracts/apis";
import { AuthenticationError } from "@/domain/errors";
import { FacebookAuthenticationService } from "@/data/services";

class LoadFacebookUseApiSpy implements LoadFacebookUserApi {
  token?: string;
  result = undefined;

  async loadUser(
    params: LoadFacebookUserApi.Params
  ): Promise<LoadFacebookUserApi.Result> {
    this.token = params.token;
    return this.result;
  }
}

describe("FacebookAuthenticationService", () => {
  it("should call LoadFacebookUserAPI with correct params", async () => {
    const loadFacebookUserApi = new LoadFacebookUseApiSpy();
    const sut = new FacebookAuthenticationService(loadFacebookUserApi);

    await sut.perform({ token: "any_token" });

    expect(loadFacebookUserApi.token).toBe("any_token");
  });

  it("should return AuthenticationError when LoadFacebookUserApi returns undefined", async () => {
    const loadFacebookUserApi = new LoadFacebookUseApiSpy();
    loadFacebookUserApi.result = undefined;
    const sut = new FacebookAuthenticationService(loadFacebookUserApi);

    const authResult = await sut.perform({ token: "any_token" });

    expect(authResult).toEqual(new AuthenticationError());
  });
});
