import { mock, type MockProxy } from "jest-mock-extended";
import { AuthenticationError } from "@/domain/errors";
import { FacebookAuthenticationService } from "@/data/services";
import { type LoadFacebookUserApi } from "@/data/contracts/apis";
import {
  type LoadUserAccountRepository,
  type SaveFacebookAccountRepository,
} from "@/data/contracts/repositories";

describe("FacebookAuthenticationService", () => {
  const token = "any_token";

  let facebookApi: MockProxy<LoadFacebookUserApi>;
  let userAccountRepository: MockProxy<
    LoadUserAccountRepository & SaveFacebookAccountRepository
  >;
  let sut: FacebookAuthenticationService;

  beforeEach(() => {
    facebookApi = mock<LoadFacebookUserApi>();

    facebookApi.loadUser.mockResolvedValue({
      name: "any_facebook_name",
      email: "any_facebook_email",
      facebookId: "any_facebook_id",
    });

    userAccountRepository = mock();
    userAccountRepository.load.mockResolvedValue(undefined);
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

  it("should call LoadUserAccountRepository when LoadFacebookUserApi returns data", async () => {
    await sut.perform({ token });

    expect(userAccountRepository.load).toHaveBeenCalledWith({
      email: "any_facebook_email",
    });
    expect(userAccountRepository.load).toHaveBeenCalledTimes(1);
  });

  it("should create account with facebook data", async () => {
    await sut.perform({ token });

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledWith({
      facebookId: "any_facebook_id",
      name: "any_facebook_name",
      email: "any_facebook_email",
    });

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledTimes(1);
  });

  it("should not update account name", async () => {
    userAccountRepository.load.mockResolvedValueOnce({
      id: "any_id",
      name: "any_name",
    });

    await sut.perform({ token });

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledWith({
      id: "any_id",
      name: "any_name",
      email: "any_facebook_email",
      facebookId: "any_facebook_id",
    });

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledTimes(1);
  });

  it("should update account name", async () => {
    userAccountRepository.load.mockResolvedValueOnce({
      id: "any_id",
    });

    await sut.perform({ token });

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledWith({
      id: "any_id",
      name: "any_facebook_name",
      email: "any_facebook_email",
      facebookId: "any_facebook_id",
    });

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledTimes(1);
  });
});
