import { defineStore } from "pinia";
import { QueryState } from "@/stores/types/queryState";
import { SelectedMatch } from "@im-library/interfaces";
import { QueryRequest } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { RDFS } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

export const useQueryStore = defineStore("query", {
  state: (): QueryState => ({
    queryIri: "",
    selectedMatches: [] as SelectedMatch[],
    variableMap: new Map<string, any>(),
    returnType: "",
    validationQueryRequest: {
      query: {
        name: "Get by return type",
        match: [
          {
            where: [
              {
                "@id": "http://endhealth.info/im#returnType",
                instanceOf: [
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
    updateQueryIri(iri: string) {
      this.queryIri = iri;
    },
    updateReturnType(returnType: string) {
      this.returnType = returnType;
    },
    updateVariableMap(map: Map<string, any>) {
      this.variableMap = map;
    },
    clearSelectedMatches() {
      this.selectedMatches = [];
    },
    async getQueryName(): Promise<string> {
      if (this.queryIri) {
        const result = await EntityService.getPartialEntity(this.queryIri, [RDFS.LABEL]);
        if (isObjectHasKeys(result, [RDFS.LABEL])) return result[RDFS.LABEL];
      }
      return "";
    }
  }
});
