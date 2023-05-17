import { type MockProxy, mock } from "jest-mock-extended";

import { type FacebookAuthentication } from "@/domain/features";
import { AuthenticationError } from "@/domain/errors";
import { AccessToken } from "@/domain/models";
import { FacebookLoginController } from "@/application/controllers";
import {
  RequiredFieldError,
  ServerError,
  UnauthorizedError,
} from "@/application/errors";

describe("FacebookLoginController", () => {
  let sut: FacebookLoginController;
  let facebookAuthentication: MockProxy<FacebookAuthentication>;

  beforeAll(() => {
    facebookAuthentication = mock();
    facebookAuthentication.perform.mockResolvedValue(
      new AccessToken("ANY_VALUE")
    );
  });

  beforeEach(() => {
    sut = new FacebookLoginController(facebookAuthentication);
  });

  it("should return 400 if token is empty", async () => {
    const httpResponse = await sut.handle({ token: "" });

    expect(httpResponse).toEqual({
      statusCode: 400,
      data: new RequiredFieldError("token"),
    });
  });

  it("should return 400 if token is null", async () => {
    const httpResponse = await sut.handle({ token: null as any });

    expect(httpResponse).toEqual({
      statusCode: 400,
      data: new RequiredFieldError("token"),
    });
  });

  it("should return 400 if token is undefined", async () => {
    const httpResponse = await sut.handle({ token: undefined as any });

    expect(httpResponse).toEqual({
      statusCode: 400,
      data: new RequiredFieldError("token"),
    });
  });

  it("should call FacebookAuthentication with correct params", async () => {
    await sut.handle({ token: "ANY_TOKEN" });

    expect(facebookAuthentication.perform).toHaveBeenCalledWith({
      token: "ANY_TOKEN",
    });
    expect(facebookAuthentication.perform).toHaveBeenCalledTimes(1);
  });

  it("should return 401 if authentication fails", async () => {
    facebookAuthentication.perform.mockResolvedValueOnce(
      new AuthenticationError()
    );
    const httpResponse = await sut.handle({ token: "ANY_TOKEN" });

    expect(httpResponse).toEqual({
      statusCode: 401,
      data: new UnauthorizedError(),
    });
  });

  it("should return 200 if authentication succeeds", async () => {
    const httpResponse = await sut.handle({ token: "ANY_TOKEN" });

    expect(httpResponse).toEqual({
      statusCode: 200,
      data: { accessToken: "ANY_VALUE" },
    });
  });

  it("should return 500 if authentication throws", async () => {
    const error = new Error("INFRA_ERROR");
    facebookAuthentication.perform.mockRejectedValueOnce(error);
    const httpResponse = await sut.handle({ token: "ANY_TOKEN" });

    expect(httpResponse).toEqual({
      statusCode: 500,
      data: new ServerError(),
    });
  });
});
