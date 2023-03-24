import { mock, type MockProxy } from "jest-mock-extended";
import { AuthenticationError } from "@/domain/errors";
import { FacebookAuthenticationService } from "@/data/services";
import { type LoadFacebookUserApi } from "@/data/contracts/apis";
import {
  type CreateFacebookAccountRepository,
  type LoadUserAccountRepository,
} from "@/data/contracts/repositories";

describe("FacebookAuthenticationService", () => {
  const token = "any_token";

  let facebookApi: MockProxy<LoadFacebookUserApi>;
  let userAccountRepository: MockProxy<
    LoadUserAccountRepository & CreateFacebookAccountRepository
  >;
  let sut: FacebookAuthenticationService;

  beforeEach(() => {
    facebookApi = mock<LoadFacebookUserApi>();

    facebookApi.loadUser.mockResolvedValue({
      name: "any_name",
      email: "any_email",
      facebookId: "any_facebook_id",
    });

    userAccountRepository = mock();

    sut = new FacebookAuthenticationService(facebookApi, userAccountRepository);
  });

  it("should call LoadFacebookUserAPI with correct params", async () => {
    await sut.perform({ token });

    expect(facebookApi.loadUser).toHaveBeenCalledWith({
      token,
    });
    expect(facebookApi.loadUser).toHaveBeenCalledTimes(1);
  });

  it("should return AuthenticationError when LoadFacebookUserApi returns undefined", async () => {
    facebookApi.loadUser.mockResolvedValueOnce(undefined);

    const authResult = await sut.perform({ token });

    expect(authResult).toEqual(new AuthenticationError());
  });

  it("should call loadUserAccountRepository when LoadFacebookUserApi returns data", async () => {
    await sut.perform({ token });

    expect(userAccountRepository.load).toHaveBeenCalledWith({
      email: "any_email",
    });
    expect(userAccountRepository.load).toHaveBeenCalledTimes(1);
  });

  it("should call createFacebookAccountRepository when LoadFacebookUserApi returns undefined", async () => {
    userAccountRepository.load.mockResolvedValueOnce(undefined);

    await sut.perform({ token });

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledWith({
      facebookId: "any_facebook_id",
      name: "any_name",
      email: "any_email",
    });

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledTimes(1);
  });
});
