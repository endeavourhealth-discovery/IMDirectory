import { FiltersAsIris, TermCode } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
const API = Env.API;
const MODEL_PATH = "api/dataModel";

const DataModelService = {
  async getDataModelProperties(iri: string, parent: null | string): Promise<any> {
    return axios.get(API + MODEL_PATH + "/public/dataModelProperties", {
      params: {
        iri: iri,
        parent: parent
      }
    });
  },

  async getDataModelsFromProperty(propIri: string): Promise<TTIriRef[]> {
    return axios.get(Env.API + MODEL_PATH + "/public/dataModels", {
      params: {
        propIri: propIri
      }
    });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(DataModelService);

export default DataModelService;
