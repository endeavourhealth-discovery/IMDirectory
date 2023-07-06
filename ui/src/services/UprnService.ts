import { UprnSearchResponse } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const api = Env.UPRN_API;

const UprnService = {
  async search(address: string): Promise<UprnSearchResponse> {
    return axios.get(api + "/search", {
      params: { address: address }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(UprnService);

export default UprnService;
