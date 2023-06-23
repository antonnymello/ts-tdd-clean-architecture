import { type Router } from "express";

const setupRoutes = (router: Router): void => {
  router.post("/api/login/facebook", (req, res) => {
    res.send({ data: "any_data" });
  });
};

export default setupRoutes;
