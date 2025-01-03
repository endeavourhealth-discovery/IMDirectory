import Env from "./Env";
import axios from "axios";
import { TTIriRef, NodeShape } from "@/interfaces/AutoGen";
import { UIProperty } from "@/interfaces";
const API_URL = Env.API + "api/dataModel";

const DataModelService = {
  async getDataModelProperties(iri: string, parent: null | string): Promise<NodeShape> {
    return axios.get(API_URL + "/public/dataModelProperties", {
      params: {
        iri: iri,
        parent: parent
      }
    });
  },

  async getDataModelsFromProperty(propIri: string): Promise<TTIriRef[]> {
    return axios.get(API_URL + "/public/dataModels", {
      params: {
        propIri: propIri
      }
    });
  },

  async checkPropertyType(iri: string): Promise<String> {
    return axios.get(API_URL + "/public/checkPropertyType", { params: { iri: iri } });
  },

  async getUIProperty(dmIri: string, propIri: string): Promise<UIProperty> {
    return axios.get(API_URL + "/public/UIPropertyForQB", { params: { dmIri: dmIri, propIri: propIri } });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(DataModelService);

export default DataModelService;
