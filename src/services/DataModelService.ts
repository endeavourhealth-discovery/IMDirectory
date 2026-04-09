import Env from "./Env";
import axios from "axios";
import { TTIriRef, NodeShape, UIProperty } from "@/interfaces/AutoGen";
import { PropertyDisplay } from "@/interfaces";
const API_URL = Env.API + "api/dataModel/protected";

const DataModelService = {
  async getDataModelProperties(iri: string, pathsOnly?: boolean, excludeGeneric?: boolean): Promise<NodeShape> {
    return await axios.get(API_URL + "/dataModelProperties", {
      params: {
        iri: iri,
        ...(pathsOnly !== undefined && { pathsOnly: pathsOnly }),
        excludeGeneric: excludeGeneric
      }
    });
  },
  async getDataModelPropertiesWithValueType(iris: string[], valueType: string): Promise<NodeShape[]> {
    return await axios.get(API_URL + "/dataModelPropertiesWithValueType", {
      params: {
        iris: iris.join(","),
        valueType: valueType
      }
    });
  },
  async getDataModelsFromProperty(propIri: string): Promise<TTIriRef[]> {
    return await axios.get(API_URL + "/dataModels", {
      params: {
        propIri: propIri
      }
    });
  },
  async checkPropertyType(iri: string): Promise<string> {
    return await axios.get(API_URL + "/checkPropertyType", { params: { iri: iri } });
  },

  async getUIProperty(dmIri: string, propIri: string): Promise<UIProperty> {
    return await axios.get(API_URL + "/UIPropertyForQB", { params: { dmIri: dmIri, propIri: propIri } });
  },

  async getPropertiesDisplay(iri: string): Promise<PropertyDisplay[]> {
    return await axios.get(API_URL + "/propertiesDisplay", {
      params: { iri: iri }
    });
  },
  async getInversePath(source: string, target: string): Promise<TTIriRef> {
    return await axios.get(API_URL + "/inversePath", {
      params: {
        source: source,
        target: target
      }
    });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(DataModelService);

export default DataModelService;
