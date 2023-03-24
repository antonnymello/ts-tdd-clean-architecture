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

  let loadFacebookUserApi: MockProxy<LoadFacebookUserApi>;
  let loadUserAccountRepository: MockProxy<LoadUserAccountRepository>;
  let createFacebookAccountRepository: MockProxy<CreateFacebookAccountRepository>;
  let sut: FacebookAuthenticationService;

  beforeEach(() => {
    loadFacebookUserApi = mock<LoadFacebookUserApi>();

    loadFacebookUserApi.loadUser.mockResolvedValue({
      name: "any_name",
      email: "any_email",
      facebookId: "any_facebook_id",
    });

    loadUserAccountRepository = mock();
    createFacebookAccountRepository = mock();

    sut = new FacebookAuthenticationService(
      loadFacebookUserApi,
      loadUserAccountRepository,
      createFacebookAccountRepository
    );
  });

  it("should call LoadFacebookUserAPI with correct params", async () => {
    await sut.perform({ token });

    expect(loadFacebookUserApi.loadUser).toHaveBeenCalledWith({
      token,
    });
    expect(loadFacebookUserApi.loadUser).toHaveBeenCalledTimes(1);
  });

  it("should return AuthenticationError when LoadFacebookUserApi returns undefined", async () => {
    loadFacebookUserApi.loadUser.mockResolvedValueOnce(undefined);

    const authResult = await sut.perform({ token });

    expect(authResult).toEqual(new AuthenticationError());
  });

  it("should call loadUserAccountRepository when LoadFacebookUserApi returns data", async () => {
    await sut.perform({ token });

    expect(loadUserAccountRepository.load).toHaveBeenCalledWith({
      email: "any_email",
    });
    expect(loadUserAccountRepository.load).toHaveBeenCalledTimes(1);
  });

  it("should call createFacebookAccountRepository when LoadFacebookUserApi returns undefined", async () => {
    loadUserAccountRepository.load.mockResolvedValueOnce(undefined);

    await sut.perform({ token });

    expect(
      createFacebookAccountRepository.createFromFacebook
    ).toHaveBeenCalledWith({
      facebookId: "any_facebook_id",
      name: "any_name",
      email: "any_email",
    });

    expect(
      createFacebookAccountRepository.createFromFacebook
    ).toHaveBeenCalledTimes(1);
  });
});
