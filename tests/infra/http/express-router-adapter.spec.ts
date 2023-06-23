import type { Request, Response } from "express";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { type MockProxy, mock } from "jest-mock-extended";

import { type Controller } from "@/application/controllers";
import { ExpressRouterAdapter } from "@/infra/http/";

describe("ExpressRouterAdapter", () => {
  let request: Request;
  let response: Response;
  let controller: MockProxy<Controller>;
  let sut: ExpressRouterAdapter;

  beforeEach(() => {
    request = getMockReq({ body: { any: "any" } });
    response = getMockRes().res;
    controller = mock();
    controller.handle.mockResolvedValue({
      statusCode: 200,
      data: { data: "any_data" },
    });
    sut = new ExpressRouterAdapter(controller);
  });

  it("should call handle with correct request", async () => {
    await sut.adapt(request, response);

    expect(controller.handle).toHaveBeenCalledWith({ any: "any" });
    expect(controller.handle).toHaveBeenCalledTimes(1);
  });

  it("should call handle with empty request", async () => {
    const request = getMockReq();

    await sut.adapt(request, response);

    expect(controller.handle).toHaveBeenCalledWith({});
    expect(controller.handle).toHaveBeenCalledTimes(1);
  });

  it("should respond with http status 200 and valid data", async () => {
    await sut.adapt(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({ data: "any_data" });
    expect(response.json).toHaveBeenCalledTimes(1);
  });

  it("should respond with http status 500 and valid error ", async () => {
    controller.handle.mockResolvedValueOnce({
      statusCode: 500,
      data: new Error("any_error"),
    });

    await sut.adapt(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.status).toHaveBeenCalledTimes(1);
    expect(response.json).toHaveBeenCalledWith({ error: "any_error" });
    expect(response.json).toHaveBeenCalledTimes(1);
  });
});
