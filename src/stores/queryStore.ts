import { ref } from "vue";

import { RDFS } from "@endeavour/vue-library/enums";
import { isObjectHasKeys } from "@endeavour/vue-library/helpers";
import type { QueryRequest } from "@endeavour/vue-library/interfaces";

import { defineStore } from "pinia";

import { SelectedMatch } from "@/interfaces";
import { EntityService } from "@/services";

export const useQueryStore = defineStore("query", () => {
  const queryIri = ref<string>("");
  const selectedMatches = ref<SelectedMatch[]>([]);
  const variableMap = ref<Map<string, any>>(new Map<string, any>());
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

  return {
    queryIri,
    selectedMatches,
    variableMap,
    returnType,
    validationQueryRequest,
    updateQueryIri,
    updateReturnType,
    updateVariableMap,
    clearSelectedMatches,
    getQueryName
  };
});
