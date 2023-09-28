<template>
  <div class="property-input-container">
    <div class="property-input-container">
      <Dropdown :options="['inSet', 'typeOf', 'instanceOf']" v-model:model-value="propertyType" />
      <Button v-if="propertyType === 'inSet'" label="Save custom set" text severity="info" />
      <div v-else>
        <InputText type="text" @click="openDialog()" placeholder="Value" v-model:model-value="selected.name" />
        <DirectorySearchDialog v-model:selected="selected" v-model:show-dialog="showDialog" />
        <EntailmentOptionsSelect v-if="!excludeEntailment" :entailment-object="editNode" />
      </div>
    </div>
    <div v-if="propertyType === 'inSet'" v-for="(editValue, index) in editValues" class="property-input-container class-select">
      <InputText type="text" @click="openDialog(index)" placeholder="Value" v-model:model-value="editValue.name" />
      <EntailmentOptionsSelect :entailment-object="editValue" />
      <Button icon="fa-solid fa-plus" text @click="editValues.push({ '@id': '', name: '' } as Node)" />
      <Button icon="pi pi-trash" text severity="danger" @click="deleteItem(index)" :disabled="editValues.length === 1" />
      <DirectorySearchDialog
        v-model:show-dialog="showDialog"
        :selected="{ iri: editValue['@id'], name: editValue.name } as ConceptSummary"
        @update:selected="onSelect"
        :root-entities="[IM.MODULE_SETS, IM.MODULE_QUERIES]"
        :search-by-query="validationQueryRequest"
      />
    </div>
  </div>

  <div class="button-bar">
    <Button label="Cancel" class="button-bar-button" severity="secondary" @click="emit('onCancel')" />
    <Button label="Save" class="button-bar-button" @click="emit('onSave', propertyType, editValues, selected)" />
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import EntailmentOptionsSelect from "./EntailmentOptionsSelect.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { Match, Node, QueryRequest } from "@im-library/interfaces/AutoGen";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash";
import { buildNodeFromCS } from "@im-library/helpers/QueryBuilder";
import { IM } from "@im-library/vocabulary";

const emit = defineEmits({
  onCancel: () => true,
  onSave: (_property: "typeOf" | "instanceOf" | "inSet", _selectedCSs: Node[], _selectedCS: ConceptSummary) => true,
  "update:selected": payload => true
});

interface Props {
  editNode: Node;
  excludeEntailment?: boolean;
  rootEntities?: string[];
  validationQueryRequest?: QueryRequest;
}

const props = defineProps<Props>();
const selected: Ref<ConceptSummary> = ref({} as ConceptSummary);
const showDialog = ref(false);
const editValues: Ref<Node[]> = ref([] as Node[]);
const selectedIndex: Ref<number> = ref(0);
const propertyType: Ref<"inSet" | "typeOf" | "instanceOf"> = ref("inSet");

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
    if (propertyType.value === "inSet" && !isArrayHasLength(editValues.value)) {
      editValues.value.push({ "@id": "", name: "" });
    } else {
      selected.value = {} as ConceptSummary;
    }
  }
);
function init() {
  if (isObjectHasKeys(props.editNode, ["inSet"])) initEditValues();
  else populateSelected();
}

function initEditValues() {
  propertyType.value = "inSet";
  const editMatch: Match = props.editNode;
  for (const item of editMatch.inSet!) {
    editValues.value.push(item);
  }
}

function populateSelected() {
  const editMatch: Match = props.editNode;
  if (isObjectHasKeys(editMatch, ["typeOf"])) {
    propertyType.value = "typeOf";
    const iri = editMatch.typeOf!["@id"];
    const name = getNameFromRef(editMatch.typeOf);
    if (iri && name) selected.value = { iri: iri, name: name } as ConceptSummary;
  } else if (isObjectHasKeys(editMatch, ["instanceOf"])) {
    propertyType.value = "instanceOf";
    const iri = editMatch.instanceOf!["@id"];
    const name = getNameFromRef(editMatch.instanceOf);
    if (iri && name) selected.value = { iri: iri, name: name } as ConceptSummary;
  }
}

function onSelect(cs: ConceptSummary) {
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
  width: 100%;
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
</style>
