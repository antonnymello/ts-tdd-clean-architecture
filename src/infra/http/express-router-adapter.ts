import { type RequestHandler } from "express";

import { type Controller } from "@/application/controllers";

// export class ExpressRouterAdapter {
//   constructor(private readonly controller: Controller) {}

//   async adapt(req: Request, res: Response): Promise<void> {
//     const httpResponse = await this.controller.handle({ ...req.body });

//     if (statusCode === 200) {
//       res.status(200).json(httpResponse.data);
//     } else {
//       res
//         .status(httpResponse.statusCode)
//         .json({ error: httpResponse.data.message });
//     }
//   }
// }

export const adaptExpressRoute = (controller: Controller): RequestHandler => {
  return (async (req, res) => {
    const { statusCode, data } = await controller.handle({ ...req.body });
    const json = statusCode === 200 ? data : { error: data.message };
    res.status(statusCode).json(json);
  }) as RequestHandler;
};
