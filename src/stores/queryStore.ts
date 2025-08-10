import { defineStore } from "pinia";
import { QueryState } from "@/stores/types/queryState";
import { SelectedMatch } from "@/interfaces";
import { QueryRequest, Match } from "@/interfaces/AutoGen";
import { EntityService } from "@/services";
import { RDFS } from "@/vocabulary";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export const useQueryStore = defineStore("query", {
  state: (): QueryState => ({
    queryIri: "",
    selectedMatches: [] as SelectedMatch[],
    variableMap: new Map<string, any>(),
    returnMap: new Map<string, Match>(),
    returnType: "",
    validationQueryRequest: {
      query: {
        name: "Get by return type",
        match: [
          {
            where: [
              {
                iri: "http://endhealth.info/im#returnType",
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
    },
    createReturnMap(match: Match) {
      if (match.return && match.return.as) this.returnMap.set(match.return.as, match);
      for (const key of ["rule", "and", "or", "not"] as const) {
        if (match[key]) {
          for (const subMatch of match[key]) {
            this.createReturnMap(subMatch);
          }
        }
      }
      if (match.then) this.createReturnMap(match.then);
    }
  }
});
