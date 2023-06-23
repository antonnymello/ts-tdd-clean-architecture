import { FacebookLoginController } from "@/application/controllers";
import { makeFacebookAuthenticationService } from "@/main/factories/services/facebook-authentication";

export const makeFacebookLoginController = (): FacebookLoginController => {
  return new FacebookLoginController(makeFacebookAuthenticationService());
};
