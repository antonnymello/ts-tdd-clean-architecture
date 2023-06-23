import { adaptExpressRoute as adapt } from "@/infra/http";
import { makeFacebookLoginController } from "@/main/factories/controllers";
import { type Router } from "express";

const setupRoutes = (router: Router): void => {
  router.post("/api/login/facebook", adapt(makeFacebookLoginController()));
};

export default setupRoutes;
