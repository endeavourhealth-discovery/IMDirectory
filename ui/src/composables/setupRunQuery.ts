import { EntityService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Query } from "@im-library/interfaces";
import { IM } from "@im-library/vocabulary";
import { Ref, ref } from "vue";

function setupRunQuery() {
  const showTestQueryResults: Ref<boolean> = ref(false);
  const imquery: Ref<Query> = ref({} as Query);

  async function runQuery(iri: string) {
    const entity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
    if (isObjectHasKeys(entity, [IM.DEFINITION])) {
      imquery.value = JSON.parse(entity[IM.DEFINITION]);
      showTestQueryResults.value = true;
    }
  }

  return {
    showTestQueryResults,
    imquery,
    runQuery
  };
}

export default setupRunQuery;
