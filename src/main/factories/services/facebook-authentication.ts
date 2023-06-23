import { FacebookAuthenticationService } from "@/data/services";
import { makeFacebookApi } from "@/main/factories/apis";
import { makeJwtTokenGenerator } from "@/main/factories/crypto";
import { makePostgresUserAccountRepository } from "@/main/factories/repositories";

export const makeFacebookAuthenticationService =
  (): FacebookAuthenticationService => {
    return new FacebookAuthenticationService(
      makeFacebookApi(),
      makePostgresUserAccountRepository(),
      makeJwtTokenGenerator()
    );
  };
