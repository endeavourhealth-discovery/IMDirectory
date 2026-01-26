import { defineStore } from "pinia";
import { SelectedMatch } from "@/interfaces";
import { QueryRequest, Match } from "@/interfaces/AutoGen";
import { EntityService } from "@/services";
import { RDFS } from "@/vocabulary";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { ref } from "vue";

export const useQueryStore = defineStore("query", () => {
  const queryIri = ref<string>("");
  const selectedMatches = ref<SelectedMatch[]>([]);
  const variableMap = ref<Map<string, any>>(new Map<string, any>());
  const returnMap = ref<Map<string, Match>>(new Map<string, Match>());
  const returnType = ref<string>("");
  const validationQueryRequest = ref<QueryRequest>({
    query: {
      name: "Get by return type",
      where: {
        iri: "http://endhealth.info/im#returnType",
        is: [
          {
            parameter: "dataModelIri"
          }
        ]
      }
    }
  });

  function updateQueryIri(iri: string) {
    queryIri.value = iri;
  }

  function updateReturnType(newReturnType: string) {
    returnType.value = newReturnType;
  }

  function updateVariableMap(map: Map<string, any>) {
    variableMap.value = map;
  }

  function clearSelectedMatches() {
    selectedMatches.value = [];
  }

  async function getQueryName(): Promise<string> {
    if (queryIri.value) {
      const result = await EntityService.getPartialEntity(queryIri.value, [RDFS.LABEL]);
      if (isObjectHasKeys(result, [RDFS.LABEL])) return result[RDFS.LABEL];
    }
    return "";
  }

  function createReturnMap(match: Match) {
    if (match.return) {
      for (const ret of match.return) {
        if (ret.as) returnMap.value.set(ret.as, match);
      }
    }
    for (const key of ["rule", "and", "or"] as const) {
      if (match[key]) {
        for (const subMatch of match[key]) {
          createReturnMap(subMatch);
        }
      }
    }
  }

  return {
    queryIri,
    selectedMatches,
    variableMap,
    returnType,
    returnMap,
    validationQueryRequest,
    updateQueryIri,
    updateReturnType,
    updateVariableMap,
    clearSelectedMatches,
    createReturnMap,
    getQueryName
  };
});
