import { type MockProxy, mock } from "jest-mock-extended";

import { type FacebookAuthentication } from "@/domain/features";
import { AuthenticationError } from "@/domain/errors";
import { AccessToken } from "@/domain/models";
import { FacebookLoginController } from "@/application/controllers";
import { RequiredStringValidator } from "@/application/validation";
import { UnauthorizedError } from "@/application/errors";

describe("FacebookLoginController", () => {
  let sut: FacebookLoginController;
  let facebookAuthentication: MockProxy<FacebookAuthentication>;
  let token: string;

  beforeAll(() => {
    token = "any_token";
    facebookAuthentication = mock();
    facebookAuthentication.perform.mockResolvedValue(
      new AccessToken("ANY_VALUE")
    );
  });

  beforeEach(() => {
    sut = new FacebookLoginController(facebookAuthentication);
  });

  it("should build Validators correctly", async () => {
    const validators = sut.buildValidators({ token });

    expect(validators).toEqual([new RequiredStringValidator(token, "token")]);
  });

  it("should call FacebookAuthentication with correct params", async () => {
    await sut.handle({ token });

    expect(facebookAuthentication.perform).toHaveBeenCalledWith({
      token,
    });
    expect(facebookAuthentication.perform).toHaveBeenCalledTimes(1);
  });

  it("should return 401 if authentication fails", async () => {
    facebookAuthentication.perform.mockResolvedValueOnce(
      new AuthenticationError()
    );
    const httpResponse = await sut.handle({ token });

    expect(httpResponse).toEqual({
      statusCode: 401,
      data: new UnauthorizedError(),
    });
  });

  it("should return 200 if authentication succeeds", async () => {
    const httpResponse = await sut.handle({ token });

    expect(httpResponse).toEqual({
      statusCode: 200,
      data: { accessToken: "ANY_VALUE" },
    });
  });
});
