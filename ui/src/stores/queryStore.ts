import { defineStore } from "pinia";
import { QueryState } from "@/stores/types/queryState";
import { SelectedMatch } from "@im-library/interfaces";
import { QueryRequest } from "@im-library/interfaces/AutoGen";

export const useQueryStore = defineStore("query", {
  state: (): QueryState => ({
    selectedMatches: [] as SelectedMatch[],
    variableMap: new Map<string, any>(),
    validationQueryRequest: {
      query: {
        name: "Get queries by return type",
        match: [
          {
            "@type": "http://endhealth.info/im#CohortQuery",
            property: [
              {
                "@id": "http://endhealth.info/im#returnType",
                in: [
                  {
                    parameter: "dataModelIri"
                  }
                ]
              }
            ]
          }
        ],
        return: [
          {
            property: [
              {
                "@id": "http://www.w3.org/2000/01/rdf-schema#label"
              }
            ]
          }
        ]
      }
    } as QueryRequest
  }),
  actions: {
    updateVariableMap(map: Map<string, any>) {
      this.variableMap = map;
    }
  }
});
