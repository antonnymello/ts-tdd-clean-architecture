import { type FacebookAuthentication } from "@/domain/features";
import { type HttpResponse } from "@/application/helpers";
import { AccessToken } from "@/domain/models";
import { ServerError } from "@/application/errors";

export class FacebookLoginController {
  constructor(
    private readonly facebookAuthentication: FacebookAuthentication
  ) {}

  async handle(httpRequest: any): Promise<HttpResponse> {
    try {
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
    } catch (err: unknown) {
      const error = err as Error;

      return {
        statusCode: 500,
        data: new ServerError(error),
      };
    }
  }
}
