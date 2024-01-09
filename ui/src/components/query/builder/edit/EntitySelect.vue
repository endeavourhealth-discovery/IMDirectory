<template>
  <div class="property-input-container">
    is
    <InputText type="text" @click="openDialog" placeholder="Value" v-model:model-value="selected.name" />
    <DirectorySearchDialog
      v-model:selected="selected"
      v-model:show-dialog="showDialog"
      :search-by-query="validationQueryRequest"
      :root-entities="rootEntities"
    />
    <EntailmentOptionsSelect v-if="!excludeEntailment" :entailment-object="editNode" />
    <Button label="Cancel" severity="secondary" @click="emit('onCancel')" />
    <Button label="Save" @click="emit('onSave', selected)" />
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import EntailmentOptionsSelect from "./EntailmentOptionsSelect.vue";
import { Node, QueryRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash";

const emit = defineEmits({ onCancel: () => true, onSave: (_payload: SearchResultSummary) => true, "update:selected": payload => true });

interface Props {
  editNode: Node;
  excludeEntailment?: boolean;
  rootEntities?: string[];
  validationQueryRequest?: QueryRequest;
}

const props = defineProps<Props>();
const selected: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const showDialog = ref(false);

watch(
  () => cloneDeep(props.editNode),
  () => populateSelected()
);

onMounted(() => {
  populateSelected();
});

function openDialog() {
  populateSelected();
  showDialog.value = true;
}

function populateSelected() {
  if (isObjectHasKeys(props.editNode)) {
    const iri = props.editNode["@id"];
    const name = getNameFromRef(props.editNode);
    if (iri && name) selected.value = { iri: iri, name: name } as SearchResultSummary;
  }
}
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 0.5rem;
  align-items: center;
}
</style>
