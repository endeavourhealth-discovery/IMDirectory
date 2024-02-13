<template>
  <div class="property-input-container">
    <div class="property-input-container">
      <InputGroup>
        <Dropdown
          :options="[
            { id: 'is', name: 'is' },
            { id: 'typeOf', name: 'is type of' },
            { id: 'instanceOf', name: 'is instance of' }
          ]"
          optionValue="id"
          optionLabel="name"
          v-model:model-value="propertyType"
        />
        <InputText type="text" @click="openDialog()" placeholder="Value" v-model:model-value="selected.name" />
        <Button label="Create set" />
        <Button icon="pi pi-plus" severity="success" text />
      </InputGroup>
      <DirectorySearchDialog v-model:selected="selected" v-model:show-dialog="showDialog" />
      <!-- <SaveCustomSetDialog v-if="propertyType === 'is'" :set-members="editValues" @on-save="onCustomSetSave" /> -->
    </div>
    <!-- <div v-if="propertyType === 'is'" v-for="(editValue, index) in editValues" class="property-input-container class-select">
      <InputText type="text" @click="openDialog(index)" placeholder="Value" v-model:model-value="editValue.name" />
      <EntailmentOptionsSelect :entailment-object="editValue" />
      <Button icon="fa-solid fa-plus" text @click="editValues.push({ '@id': '', name: '' } as Node)" />
      <Button icon="fa-solid fa-trash" text severity="danger" @click="deleteItem(index)" :disabled="editValues.length === 1" />
      <DirectorySearchDialog
        v-model:show-dialog="showDialog"
        :selected="{ iri: editValue['@id'], name: editValue.name } as SearchResultSummary"
        @update:selected="onSelect"
        :root-entities="[IM.MODULE_SETS, IM.MODULE_QUERIES]"
        :search-by-query="validationQueryRequest"
      />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import EntailmentOptionsSelect from "./EntailmentOptionsSelect.vue";
import { Match, Node, QueryRequest, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash";
import { buildNodeFromCS } from "@im-library/helpers/QueryBuilder";
import { IM } from "@im-library/vocabulary";
import SaveCustomSetDialog from "./dialogs/SaveCustomSetDialog.vue";

const emit = defineEmits({
  onCancel: () => true,
  onSave: (_property: "typeOf" | "instanceOf" | "is", _selectedCSs: Node[], _selectedCS: SearchResultSummary) => true,
  "update:selected": payload => true
});

interface Props {
  editNode: Node;
  excludeEntailment?: boolean;
  rootEntities?: string[];
  validationQueryRequest?: QueryRequest;
}

const props = defineProps<Props>();
const selected: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const showDialog = ref(false);
const editValues: Ref<Node[]> = ref([] as Node[]);
const selectedIndex: Ref<number> = ref(0);
const propertyType: Ref<"is" | "typeOf" | "instanceOf"> = ref("is");

onMounted(() => {
  init();
});

watch(
  () => cloneDeep(props.editNode),
  () => populateSelected()
);

watch(
  () => cloneDeep(selected),
  () => populateSelected()
);

watch(
  () => propertyType.value,
  () => {
    if (propertyType.value === "is" && !isArrayHasLength(editValues.value)) {
      editValues.value.push({ "@id": "", name: "" });
    } else {
      selected.value = {} as SearchResultSummary;
    }
  }
);
function init() {
  if (isObjectHasKeys(props.editNode, ["is"])) initEditValues();
  else populateSelected();
}

function initEditValues() {
  propertyType.value = "is";
  const editMatch: Match = props.editNode;
  for (const item of editMatch.is!) {
    editValues.value.push(item);
  }
}

function onCustomSetSave(customSetRef: Node) {
  editValues.value.length = 0;
  editValues.value.push(customSetRef);
}

function populateSelected() {
  const editMatch: Match = props.editNode;
  if (isObjectHasKeys(editMatch, ["typeOf"])) {
    propertyType.value = "typeOf";
    const iri = editMatch.typeOf!["@id"];
    const name = getNameFromRef(editMatch.typeOf);
    if (iri && name) selected.value = { iri: iri, name: name } as SearchResultSummary;
  } else if (isObjectHasKeys(editMatch, ["instanceOf"])) {
    propertyType.value = "instanceOf";
    const iri = editMatch.instanceOf!["@id"];
    const name = getNameFromRef(editMatch.instanceOf);
    if (iri && name) selected.value = { iri: iri, name: name } as SearchResultSummary;
  }
}

function onSelect(cs: SearchResultSummary) {
  showDialog.value = false;
  const node = buildNodeFromCS(cs);
  editValues.value[selectedIndex.value] = node;
}

function openDialog(index?: number) {
  if (index) selectedIndex.value = index;
  showDialog.value = true;
}

function deleteItem(index: number) {
  editValues.value.splice(index, 1);
}
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-wrap: wrap;
  width: 50%;
  gap: 0.5rem;
  align-items: center;
}

.class-select {
  display: flex;
  align-items: baseline;
}
.hidden-button {
  display: none;
}
.class-select:hover .hidden-button {
  display: flex;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}

.p-dropdown {
  height: 2.3rem;
}
</style>
