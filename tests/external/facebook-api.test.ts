import { FacebookApi } from "@/infra/apis";
import { AxiosHttpClient } from "@/infra/http";
import { env } from "@/main/config/env";

describe("", () => {
  it("should return a Facebook User if token is valid", async () => {
    const axiosClient = new AxiosHttpClient();
    const sut = new FacebookApi(
      axiosClient,
      env.facebookApi.clientId,
      env.facebookApi.clientSecret
    );

    const fbUser = await sut.loadUser({ token: "valid_token" });

    expect(fbUser).toEqual({
      facebookId: "",
      email: "",
      name: "",
    });
  });

  it("should return undefined if token is invalid", async () => {
    const axiosClient = new AxiosHttpClient();
    const sut = new FacebookApi(
      axiosClient,
      env.facebookApi.clientId,
      env.facebookApi.clientSecret
    );

    const fbUser = await sut.loadUser({ token: "invalid_token" });

    expect(fbUser).toBeUndefined();
  });
});
