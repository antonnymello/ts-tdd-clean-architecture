import axios from "axios";
import { type HttpGetClient } from "@/infra/http";

export class AxiosHttpClient implements HttpGetClient {
  async get<T = any>({ url, params }: HttpGetClient.Params): Promise<T> {
    const result = await axios.get(url, { params });
    return result.data;
  }
}
