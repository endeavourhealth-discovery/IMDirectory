import Env from "./Env";
import axios from "axios";
import { TTIriRef, NodeShape, Match } from "@/interfaces/AutoGen";
import { PropertyDisplay, UIProperty } from "@/interfaces";
const API_URL = Env.API + "api/dataModel";

const DataModelService = {
  async getDataModelProperties(iri: string, pathsOnly?: boolean): Promise<NodeShape> {
    return await axios.get(API_URL + "/public/dataModelProperties", {
      params: {
        iri: iri,
        ...(pathsOnly !== undefined && { pathsOnly: pathsOnly })
      }
    });
  },
  async getDataModelPropertiesWithValueType(iris: string[], valueType: string): Promise<NodeShape[]> {
    return await axios.get(API_URL + "/public/dataModelPropertiesWithValueType", {
      params: {
        iris: iris.join(","),
        valueType: valueType
      }
    });
  },

  async getDataModelsFromProperty(propIri: string): Promise<TTIriRef[]> {
    return await axios.get(API_URL + "/public/dataModels", {
      params: {
        propIri: propIri
      }
    });
  },
  async getDataModelPaths(iri: string): Promise<NodeShape> {
    return await axios.get(API_URL + "/public/dataModelPaths", {
      params: {
        iri: iri
      }
    });
  },
  async checkPropertyType(iri: string): Promise<string> {
    return await axios.get(API_URL + "/public/checkPropertyType", { params: { iri: iri } });
  },

  async getUIProperty(dmIri: string, propIri: string): Promise<UIProperty> {
    return await axios.get(API_URL + "/public/UIPropertyForQB", { params: { dmIri: dmIri, propIri: propIri } });
  },

  async getPropertiesDisplay(iri: string): Promise<PropertyDisplay[]> {
    return await axios.get(API_URL + "/public/propertiesDisplay", {
      params: { iri: iri }
    });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(DataModelService);

export default DataModelService;
