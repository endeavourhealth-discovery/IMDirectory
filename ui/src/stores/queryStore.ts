import { defineStore } from "pinia";
import { QueryState } from "@/stores/types/queryState";
import { SelectedMatch } from "@im-library/interfaces";
import { QueryRequest } from "@im-library/interfaces/AutoGen";

export const useQueryStore = defineStore("query", {
  state: (): QueryState => ({
    selectedMatches: [] as SelectedMatch[],
    variableMap: new Map<string, any>(),
    returnType: "",
    validationQueryRequest: {
      query: {
        name: "Get queries by return type",
        match: [
          {
            typeOf: { "@id": "http://endhealth.info/im#CohortQuery" },
            property: [
              {
                "@id": "http://endhealth.info/im#returnType",
                is: [
                  {
                    parameter: "dataModelIri"
                  }
                ]
              }
            ]
          }
        ]
      }
    } as QueryRequest
  }),
  actions: {
    updateReturnType(returnType: string) {
      this.returnType = returnType;
    },
    updateVariableMap(map: Map<string, any>) {
      this.variableMap = map;
    },
    clearSelectedMatches() {
      this.selectedMatches = [];
    }
  }
});
