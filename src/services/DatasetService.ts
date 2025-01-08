import Env from "./Env";
import axios from "axios";
import { SearchResultSummary } from "@/interfaces/AutoGen";
const API_URL = Env.API + "api/dataset";

const DatasetService = {
  async searchAllowableDataModelProperties(iri: string, parent: null | string): Promise<SearchResultSummary[]> {
    return axios.get(API_URL + "/public/searchAllowableDataModelProperties", {
      params: {
        datamodelIri: iri,
        searchTerm: parent
      }
    });
  }
};
if (process.env.NODE_ENV !== "test") Object.freeze(DatasetService);

export default DatasetService;
