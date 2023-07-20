import { UprnSearchResponse } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const api = Env.UPRN_API;
const username = import.meta.env.VITE_UPRN_USER
const password = import.meta.env.VITE_UPRN_PASSWORD;

const UprnService = {
  async search(address: string, ncommercial: string): Promise<UprnSearchResponse> {
    return axios.get(api + "/api2/getinfo", {
      params: {adrec: address,
      commercial: ncommercial},
      auth: {
        username: username,
        password: password
      }
    });
  },

  async activity(user: string): Promise<any> {
    return axios.get(api + "/api2/activity", {
      params: {u: user},
      auth: {
        username: username,
        password: password
      }
    });
  },

  async download(file: string): Promise<any> {
    return axios.get(api + "/api2/download3",
        {
          responseType: "blob",
          params: {filename: file},
          auth: {
            username: username,
            password: password
          }
        });
  },

  async assignRegister(user_id: string, name: string, organization: string): Promise<any> {
    return axios.post(api + "/api2/register",
        {
          params: {
            userid: user_id,
            organisation: organization,
            name: name
          },
            headers: {
                Authorization: 'Basic ' + btoa(username + ':' + password)
            }
        })
  },

    async getRegister(user_id: string): Promise<any> {
        return await axios.get(api + "/api2/getreg",
            {
                params: {
                    userid: user_id
                },
                headers: {
                    Authorization: 'Basic ' + btoa(username + ':' + password)
                }
            })
    }
}

if (process.env.NODE_ENV !== "test") Object.freeze(UprnService);

export default UprnService;
