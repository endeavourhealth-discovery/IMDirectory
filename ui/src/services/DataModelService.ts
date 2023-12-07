import axios from "axios";
import Env from "./Env";
import { DataModelProperty } from "@im-library/interfaces/AutoGen";

const DataModelService = {
  async generateJava(): Promise<any> {
    return axios.get(Env.API + "api/DataModel/public/generateJava", {
      responseType: "blob"
    });
  },

  async getDataModelProperties(iri: string): Promise<DataModelProperty[]> {
    return axios.get(Env.API + "api/entity/public/dataModelProperties", {
      params: { iri: iri }
    });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(DataModelService);

export default DataModelService;
