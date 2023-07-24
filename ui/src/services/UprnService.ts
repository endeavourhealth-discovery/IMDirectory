import { UprnSearchResponse } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const api = Env.UPRN_API;
const username = import.meta.env.VITE_UPRN_USER;
const password = import.meta.env.VITE_UPRN_PASSWORD;

const UprnService = {
  async search(address: string, ncommercial: string): Promise<UprnSearchResponse> {
    return axios.get(api + "/api2/getinfo", {
      params: { adrec: address, commercial: ncommercial }
    });
  },

  async activity(user: string): Promise<any> {
    return axios.get(api + "/api2/activity", {
      params: { u: user }
    });
  },

  async download(file: string): Promise<any> {
    return axios.get(api + "/api2/download3", {
      responseType: "blob",
      params: { filename: file }
    });
  },

  async upload(files: FormData): Promise<any> {
    return axios.post(api + "/api2/fileupload2", files);
  },

  async assignRegister(user_id: string, name: string, organization: string): Promise<any> {
    return axios.post(api + "/api2/register", {
      params: {
        userid: user_id,
        organisation: organization,
        name: name
      }
    });
  },

  async getRegister(user_id: string): Promise<any> {
    return await axios.get(api + "/api2/getreg", {
      params: {
        userid: user_id
      }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UprnService);

export default UprnService;
