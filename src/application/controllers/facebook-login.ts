import { type FacebookAuthentication } from "@/domain/features";
import {
  badRequest,
  unauthorized,
  type HttpResponse,
  serverError,
  ok,
} from "@/application/helpers";
import { AccessToken } from "@/domain/models";
import { RequiredFieldError, ServerError } from "@/application/errors";

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
        return badRequest(new RequiredFieldError("token"));
      }

      const accessToken = await this.facebookAuthentication.perform({
        token: httpRequest.token,
      });

      if (accessToken instanceof AccessToken) {
        return ok({ accessToken: accessToken.value });
      }

      return unauthorized();
    } catch (err: unknown) {
      const error = err as Error;
      return serverError(new ServerError(error));
    }
  }
}