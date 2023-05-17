import {
  badRequest,
  type HttpResponse,
  serverError,
} from "@/application/helpers";
import { ServerError } from "@/application/errors";
import { ValidationComposite, type Validator } from "@/application/validation";

export abstract class Controller {
  abstract perform(httpRequest: any): Promise<HttpResponse>;

  buildValidators(httpRequest: any): Validator[] {
    return [];
  }

  async handle(httpRequest: any): Promise<HttpResponse> {
    const error = this.validate(httpRequest);

    if (error !== undefined) return badRequest(error);

    try {
      return this.perform(httpRequest);
    } catch (err: unknown) {
      const error = err as Error;
      return serverError(new ServerError(error));
    }
  }

  private validate(httpRequest: any): Error | undefined {
    const validators = this.buildValidators(httpRequest);
    const validator = new ValidationComposite(validators);
    return validator.validate();
  }
}
