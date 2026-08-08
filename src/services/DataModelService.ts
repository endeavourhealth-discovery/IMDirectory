import { PropertyDisplay, PropertyDisplaySchema, UIPropertySchema, parseArray } from "@endeavour/vue-library";
import { parseApiResponse } from "@endeavour/vue-library/helpers";
import { type NodeShape, NodeShapeSchema, type TTIriRef, TTIriRefSchema, type UIProperty } from "@endeavour/vue-library/models";

import z from "zod";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/dataModel/protected";

const DataModelService = {
  async getDataModelProperties(iri: string, pathsOnly?: boolean): Promise<NodeShape> {
    const result = await api.get(API_URL + "/dataModelProperties", {
      params: {
        iri: iri,
        ...(pathsOnly !== undefined && { pathsOnly: pathsOnly })
      }
    });
    return parseApiResponse(result, NodeShapeSchema);
  },
  async getRelatedTypes(iri: string): Promise<NodeShape> {
    const result = await api.get(API_URL + "/relatedTypes", {
      params: {
        iri: iri
      }
    });
    return parseApiResponse(result, NodeShapeSchema);
  },
  async getDataModelPropertiesWithValueType(iris: string[], valueType: string): Promise<NodeShape[]> {
    const result = await api.get(API_URL + "/dataModelPropertiesWithValueType", {
      params: {
        iris: iris.join(","),
        valueType: valueType
      }
    });
    return parseApiResponse(result, z.array(NodeShapeSchema));
  },
  async getDataModelsFromProperty(propIri: string): Promise<TTIriRef[]> {
    const result = await api.get(API_URL + "/dataModels", {
      params: {
        propIri: propIri
      }
    });
    return parseApiResponse(result, z.array(TTIriRefSchema));
  },
  async checkPropertyType(iri: string): Promise<string> {
    return await api.get(API_URL + "/checkPropertyType", { params: { iri: iri } });
  },

  async getUIProperty(dmIri: string, propIri: string): Promise<UIProperty> {
    const result = await api.get(API_URL + "/UIPropertyForQB", { params: { dmIri: dmIri, propIri: propIri } });
    return parseApiResponse(result, UIPropertySchema);
  },

  async getPropertiesDisplay(iri: string): Promise<PropertyDisplay[]> {
    const result = await api.get(API_URL + "/propertiesDisplay", {
      params: { iri: iri }
    });
    return parseApiResponse(result, z.array(PropertyDisplaySchema));
  },
  async getInversePath(source: string, target: string): Promise<TTIriRef> {
    const result = await api.get(API_URL + "/inversePath", {
      params: {
        source: source,
        target: target
      }
    });
    return parseApiResponse(result, TTIriRefSchema);
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(DataModelService);

export default DataModelService;
