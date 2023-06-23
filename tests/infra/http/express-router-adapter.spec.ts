import type { Request, Response } from "express";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { mock } from "jest-mock-extended";
import { type Controller } from "@/application/controllers";

class ExpressRouterAdapter {
  constructor(private readonly controller: Controller) {}

  async adapt(req: Request, res: Response): Promise<void> {
    await this.controller.handle({ ...req.body });
  }
}

describe("ExpressRouterAdapter", () => {
  it("should call handle with correct request", async () => {
    const request = getMockReq({ body: { any: "any" } });
    const { res: response } = getMockRes();
    const controller = mock<Controller>();
    const sut = new ExpressRouterAdapter(controller);

    await sut.adapt(request, response);

    expect(controller.handle).toHaveBeenCalledWith({ any: "any" });
  });

  it("should call handle with empty request", async () => {
    const request = getMockReq();
    const { res: response } = getMockRes();
    const controller = mock<Controller>();
    const sut = new ExpressRouterAdapter(controller);

    await sut.adapt(request, response);

    expect(controller.handle).toHaveBeenCalledWith({});
  });
});
