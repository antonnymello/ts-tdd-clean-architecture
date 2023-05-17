import { type FacebookAuthentication } from "@/domain/features";
import {
  badRequest,
  unauthorized,
  type HttpResponse,
  serverError,
  ok,
} from "@/application/helpers";
import { AccessToken } from "@/domain/models";
import { ServerError } from "@/application/errors";
import {
  RequiredStringValidator,
  ValidationComposite,
} from "@/application/validation";

type HttpRequest = {
  token: string;
};

type Model = Error | { accessToken: string };

export class FacebookLoginController {
  constructor(
    private readonly facebookAuthentication: FacebookAuthentication
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse<Model>> {
    try {
      const error = this.validate(httpRequest);

      if (error !== undefined) return badRequest(error);

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

  private validate(httpRequest: HttpRequest): Error | undefined {
    const validators = [
      new RequiredStringValidator(httpRequest.token, "token"),
    ];

    const validator = new ValidationComposite(validators);

    return validator.validate();
  }
}
