import { UprnSearchResponse } from "@/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/uprn/private";

const UprnService = {
  async search(address: string, ncommercial: string): Promise<UprnSearchResponse> {
    return await api.get(API_URL + "/getinfo", {
      params: { adrec: address, commercial: ncommercial },
      headers: {
        Accept: "application/json"
      }
    });
  },

  async activity(user: string): Promise<any> {
    return await api.get(API_URL + "/activity", {
      params: { u: user },
      headers: {
        Accept: "application/json"
      }
    });
  },

  async download(file: string): Promise<any> {
    return await api.get(API_URL + "/download3", {
      responseType: "blob",
      params: { file: file }
    });
  },

  async upload(files: FormData): Promise<any> {
    return await api.post(API_URL + "/fileupload2", files);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UprnService);

export default UprnService;
