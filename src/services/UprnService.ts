import { UprnSearchResponse } from "@/interfaces";
import Env from "./Env";
import axios from "axios";

const api = Env.UPRN_API;

const UprnService = {
  async search(address: string, ncommercial: string): Promise<UprnSearchResponse> {
    return await axios.get(api + "/api2/getinfo", {
      params: { adrec: address, commercial: ncommercial }
    });
  },

  async activity(user: string): Promise<any> {
    return await axios.get(api + "/api2/activity", {
      params: { u: user }
    });
  },

  async download(file: string): Promise<any> {
    return await axios.get(api + "/api2/download3", {
      responseType: "blob",
      params: { filename: file }
    });
  },

  async upload(files: FormData): Promise<any> {
    return await axios.post(api + "/api2/fileupload2", files);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UprnService);

export default UprnService;
