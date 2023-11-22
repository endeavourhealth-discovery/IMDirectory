import axios, { Axios, AxiosRequestConfig } from "axios";
import Env from "./Env";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";

export interface RequestParams extends AxiosRequestConfig {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  method?: MethodOptions;
  abortController?: AbortController;
}

export enum MethodOptions {
  Get = "GET",
  Post = "POST"
}

export interface ApiConfig {
  baseUrl?: string;
  axios?: Axios;
}

export enum ResponseType {
  Json = "json",
  ArrayBuffer = "arrayBuffer",
  Document = "document",
  Text = "text",
  Stream = "stream",
  Blob = "blob"
}

export class HttpClient {
  public baseUrl: string = Env.API;
  private axios: Axios = axios;

  constructor(apiConfig: ApiConfig = {}) {
    Object.assign(this, apiConfig);
  }

  public request = async ({
    data,
    secure = false,
    url,
    responseType = ResponseType.Json,
    baseURL = Env.API,
    abortController,
    method,
    headers = {},
    params
  }: RequestParams): Promise<any> => {
    if (!secure) {
      delete headers.Authorization;
    }
    if (method === MethodOptions.Get) {
      return this.axios
        .get(`${baseURL || this.baseUrl || ""}${url}`, {
          params: { ...params },
          headers: { ...headers },
          signal: abortController?.signal
        })
        .then(async (response: any) => {
          return response;
        });
    } else if (method === MethodOptions.Post) {
      return this.axios
        .post(`${baseURL || this.baseUrl || ""}${url}`, data, {
          params: { ...params },
          headers: { ...headers },
          signal: abortController?.signal
        })
        .then(async (response: any) => {
          console.log(response);
          return response;
        });
    } else throw new Error("Incorrect or missing axios method");
  };
}

export class Api extends HttpClient {
  nodeApi = {
    get: (route: string, params?: RequestParams, abortController?: AbortController) =>
      this.request({
        url: "node_api/" + route,
        method: MethodOptions.Get,
        params: { ...params },
        baseURL: Env.VITE_NODE_API,
        abortController: abortController
      }),
    post: (route: string, data: any, params?: RequestParams, abortController?: AbortController) =>
      this.request({
        url: "node_api/" + route,
        method: MethodOptions.Post,
        params: { ...params },
        data: data,
        baseURL: Env.VITE_NODE_API,
        abortController: abortController
      })
  };
  imapi = {
    get: (route: string, params?: RequestParams, abortController?: AbortController) =>
      this.request({
        url: "api/" + route,
        method: MethodOptions.Get,
        params: params,
        baseURL: Env.API,
        abortController: abortController
      }),
    post: (route: string, data: any, params?: RequestParams, abortController?: AbortController) => {
      return this.request({
        url: "api/" + route,
        method: MethodOptions.Post,
        params: params,
        data: data,
        baseURL: Env.API,
        abortController: abortController
      });
    }
  };
}
