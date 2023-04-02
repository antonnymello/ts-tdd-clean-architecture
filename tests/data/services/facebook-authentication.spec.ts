import { mock, type MockProxy } from "jest-mock-extended";
import { AuthenticationError } from "@/domain/errors";
import { FacebookAuthenticationService } from "@/data/services";
import { type LoadFacebookUserApi } from "@/data/contracts/apis";
import { AccessToken, FacebookAccount } from "@/domain/models";
import { type TokenGenerator } from "../contracts/crypto";
import {
  type LoadUserAccountRepository,
  type SaveFacebookAccountRepository,
} from "@/data/contracts/repositories";

describe("FacebookAuthenticationService", () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>;
  let crypto: MockProxy<TokenGenerator>;
  let userAccountRepository: MockProxy<
    LoadUserAccountRepository & SaveFacebookAccountRepository
  >;
  let sut: FacebookAuthenticationService;
  let token: string;

  beforeAll(() => {
    token = "any_token";
    facebookApi = mock<LoadFacebookUserApi>();
    facebookApi.loadUser.mockResolvedValue({
      name: "any_facebook_name",
      email: "any_facebook_email",
      facebookId: "any_facebook_id",
    });

    userAccountRepository = mock();
    userAccountRepository.load.mockResolvedValue(undefined);
    userAccountRepository.saveWithFacebook.mockResolvedValue({
      id: "any_account_id",
    });

    crypto = mock();
    crypto.generateToken.mockResolvedValue("any_generated_token");
  });

  beforeEach(() => {
    sut = new FacebookAuthenticationService(
      facebookApi,
      userAccountRepository,
      crypto
    );
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

  it("should call SaveFacebookAccountRepository with Facebook Account", async () => {
    await sut.perform({ token });

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledWith(
      expect.any(FacebookAccount)
    );
  });

  it("should call TokenGenerator with correct params", async () => {
    await sut.perform({ token });

    expect(crypto.generateToken).toHaveBeenCalledWith({
      key: "any_account_id",
      expirationInMs: AccessToken.expirationInMs,
    });

    expect(crypto.generateToken).toHaveBeenCalledTimes(1);
  });

  it("should return an AccessToken on success", async () => {
    const authResult = await sut.perform({ token });

    expect(authResult).toEqual(new AccessToken("any_generated_token"));
  });

  it("should rethrow if LoadFacebookUserApi throws", async () => {
    facebookApi.loadUser.mockRejectedValueOnce(new Error("facebook_error"));

    const promise = sut.perform({ token });

    await expect(promise).rejects.toThrow(new Error("facebook_error"));
  });

  it("should rethrow if LoadUserAccountRepository throws", async () => {
    userAccountRepository.load.mockRejectedValueOnce(new Error("load_error"));

    const promise = sut.perform({ token });

    await expect(promise).rejects.toThrow(new Error("load_error"));
  });

  it("should rethrow if SaveFacebookAccountRepository throws", async () => {
    userAccountRepository.saveWithFacebook.mockRejectedValueOnce(
      new Error("save_error")
    );

    const promise = sut.perform({ token });

    await expect(promise).rejects.toThrow(new Error("save_error"));
  });

  it("should rethrow if TokenGenerator throws", async () => {
    crypto.generateToken.mockRejectedValueOnce(new Error("token_error"));

    const promise = sut.perform({ token });

    await expect(promise).rejects.toThrow(new Error("token_error"));
  });
});
