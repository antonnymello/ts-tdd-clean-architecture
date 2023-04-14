import { type MockProxy, mock } from "jest-mock-extended";
import { type FacebookAuthentication } from "@/domain/features";
import { AuthenticationError } from "@/domain/errors";
import { AccessToken } from "@/domain/models";

type HttpResponse = { statusCode: number; data: any };

class FacebookLoginController {
  constructor(
    private readonly facebookAuthentication: FacebookAuthentication
  ) {}

  async handle(httpRequest: any): Promise<HttpResponse> {
    if (
      httpRequest.token === "" ||
      httpRequest.token === null ||
      httpRequest.token === undefined
    ) {
      return {
        statusCode: 400,
        data: new Error("The field token is required"),
      };
    }

    const accessToken = await this.facebookAuthentication.perform({
      token: httpRequest.token,
    });

    if (accessToken instanceof AccessToken) {
      return {
        statusCode: 200,
        data: { accessToken: accessToken.value },
      };
    }

    return {
      statusCode: 401,
      data: accessToken,
    };
  }
}

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
      data: new Error("The field token is required"),
    });
  });

  it("should return 400 if token is null", async () => {
    const httpResponse = await sut.handle({ token: null });

    expect(httpResponse).toEqual({
      statusCode: 400,
      data: new Error("The field token is required"),
    });
  });

  it("should return 400 if token is undefined", async () => {
    const httpResponse = await sut.handle({ token: undefined });

    expect(httpResponse).toEqual({
      statusCode: 400,
      data: new Error("The field token is required"),
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
      data: new AuthenticationError(),
    });
  });

  it("should return 200 if authentication succeeds", async () => {
    const httpResponse = await sut.handle({ token: "ANY_TOKEN" });

    expect(httpResponse).toEqual({
      statusCode: 200,
      data: { accessToken: "ANY_VALUE" },
    });
  });
});
