import { UprnSearchResponse } from "@/interfaces";
import Env from "./Env";
import axios from "axios";

const API_URL = Env.UPRN_API + "/api2";

const UprnService = {
  async search(address: string, ncommercial: string): Promise<UprnSearchResponse> {
    return await axios.get(API_URL + "/getinfo", {
      params: { adrec: address, commercial: ncommercial }
    });
  },

  async activity(user: string): Promise<any> {
    return await axios.get(API_URL + "/activity", {
      params: { u: user }
    });
  },

  async download(file: string): Promise<any> {
    return await axios.get(API_URL + "/download3", {
      responseType: "blob",
      params: { filename: file }
    });
  },

  async upload(files: FormData): Promise<any> {
    return await axios.post(API_URL + "/fileupload2", files);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UprnService);

export default UprnService;
