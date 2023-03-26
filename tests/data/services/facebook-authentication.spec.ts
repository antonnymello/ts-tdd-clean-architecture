import { mock, type MockProxy } from "jest-mock-extended";
import { AuthenticationError } from "@/domain/errors";
import { FacebookAuthenticationService } from "@/data/services";
import { type LoadFacebookUserApi } from "@/data/contracts/apis";
import {
  type UpdateFacebookAccountRepository,
  type CreateFacebookAccountRepository,
  type LoadUserAccountRepository,
} from "@/data/contracts/repositories";

describe("FacebookAuthenticationService", () => {
  const token = "any_token";

  let facebookApi: MockProxy<LoadFacebookUserApi>;
  let userAccountRepository: MockProxy<
    LoadUserAccountRepository &
      CreateFacebookAccountRepository &
      UpdateFacebookAccountRepository
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

  it("should call CreateFacebookAccountRepository when LoadUserAccountRepository returns undefined", async () => {
    await sut.perform({ token });

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledWith({
      facebookId: "any_facebook_id",
      name: "any_facebook_name",
      email: "any_facebook_email",
    });

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledTimes(1);
  });

  it("should call UpdateFacebookAccountRepository when LoadFacebookUserApi returns data", async () => {
    userAccountRepository.load.mockResolvedValueOnce({
      id: "any_id",
      name: "any_name",
    });

    await sut.perform({ token });

    expect(userAccountRepository.updateWithFacebook).toHaveBeenCalledWith({
      id: "any_id",
      name: "any_name",
      facebookId: "any_facebook_id",
    });

    expect(userAccountRepository.updateWithFacebook).toHaveBeenCalledTimes(1);
  });

  it("should update account name", async () => {
    userAccountRepository.load.mockResolvedValueOnce({
      id: "any_id",
    });

    await sut.perform({ token });

    expect(userAccountRepository.updateWithFacebook).toHaveBeenCalledWith({
      id: "any_id",
      name: "any_facebook_name",
      facebookId: "any_facebook_id",
    });

    expect(userAccountRepository.updateWithFacebook).toHaveBeenCalledTimes(1);
  });
});
