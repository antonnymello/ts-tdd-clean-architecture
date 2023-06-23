import { type RequestHandler } from "express";

import { type Controller } from "@/application/controllers";

// export class ExpressRouterAdapter {
//   constructor(private readonly controller: Controller) {}

//   async adapt(req: Request, res: Response): Promise<void> {
//     const httpResponse = await this.controller.handle({ ...req.body });

//     if (httpResponse.statusCode === 200) {
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
    const httpResponse = await controller.handle({ ...req.body });

    if (httpResponse.statusCode === 200) {
      res.status(200).json(httpResponse.data);
    } else {
      res
        .status(httpResponse.statusCode)
        .json({ error: httpResponse.data.message });
    }
  }) as RequestHandler;
};
