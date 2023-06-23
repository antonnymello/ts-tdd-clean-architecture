import type { Request, Response } from "express";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { type MockProxy, mock } from "jest-mock-extended";
import { type Controller } from "@/application/controllers";

class ExpressRouterAdapter {
  constructor(private readonly controller: Controller) {}

  async adapt(req: Request, res: Response): Promise<void> {
    await this.controller.handle({ ...req.body });
  }
}

describe("ExpressRouterAdapter", () => {
  let request: Request;
  let response: Response;
  let controller: MockProxy<Controller>;
  let sut: ExpressRouterAdapter;

  beforeEach(() => {
    request = getMockReq({ body: { any: "any" } });
    response = getMockRes().res;
    controller = mock();
    sut = new ExpressRouterAdapter(controller);
  });

  it("should call handle with correct request", async () => {
    await sut.adapt(request, response);

    expect(controller.handle).toHaveBeenCalledWith({ any: "any" });
  });

  it("should call handle with empty request", async () => {
    const request = getMockReq();

    await sut.adapt(request, response);

    expect(controller.handle).toHaveBeenCalledWith({});
  });
});
