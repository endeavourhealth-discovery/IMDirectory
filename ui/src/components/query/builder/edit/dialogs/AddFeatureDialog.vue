<template>
  <DirectorySearchDialog
    v-model:show-dialog="visible"
    @update:selected="onSelect"
    :searchByQuery="validationQueryRequest"
    :root-entities="[IM.MODULE_FEATURES]"
    :filter-options="filterOptionsForFeature"
  />
</template>

<script setup lang="ts">
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { generateMatchIdsRecursively } from "@im-library/helpers/QueryBuilder";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { Match, QueryRequest } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { Ref, ref, watch } from "vue";

interface Props {
  showDialog: boolean;
  validationQueryRequest: QueryRequest;
}

const props = defineProps<Props>();
const emit = defineEmits({ onClose: () => true, "update:showDialog": payload => typeof payload === "boolean", onFeatureSelect: (match: Match) => true });
const visible: Ref<boolean> = ref(false);
const filterOptionsForFeature: FilterOptions = { types: [{ "@id": IM.FEATURE }] } as FilterOptions;

watch(
  () => props.showDialog,
  newValue => {
    visible.value = newValue;
  }
);

watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});

async function onSelect(selectedFeature: ConceptSummary) {
  const partialEntity = await EntityService.getPartialEntity(selectedFeature.iri, [IM.DEFINITION]);
  if (isObjectHasKeys(partialEntity, [IM.DEFINITION])) {
    const matchToAdd: Match = JSON.parse(partialEntity[IM.DEFINITION]);
    generateMatchIdsRecursively(matchToAdd);
    emit("onFeatureSelect", matchToAdd);
    visible.value = false;
  }
}
</script>

<style scoped></style>
