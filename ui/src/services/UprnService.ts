import { UprnSearchResponse } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const api = Env.UPRN_API;

const UprnService = {
  async download(file: string): Promise<any> {
    return axios.get(api + "/api2/download3", {
      responseType: "blob",
      params: { filename: file }
    });
  },

  async upload(files: FormData): Promise<any> {
    return axios.post(api + "/api2/fileupload2", files);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UprnService);

export default UprnService;
