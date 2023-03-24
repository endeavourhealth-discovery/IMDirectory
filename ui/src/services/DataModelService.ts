import axios from "axios";
import Env from "./Env";

const DataModelService = {
  async generateJava(): Promise<any> {
        return axios.get(Env.API + "api/DataModel/public/generateJava", {
            responseType: "blob"
        });
    }
}

if (process.env.NODE_ENV !== "test") Object.freeze(DataModelService);

export default DataModelService;