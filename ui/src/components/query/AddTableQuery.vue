<template>
  <div class="property-value">
    <div class="property-select-container">Property:<InputText type="text" v-model="selectedProperty.label" @click="propertySelectDialog = true" /></div>
    <div class="value-select-container">
      Value: <InputText
        v-if="isObjectHasKeys(selectedProperty.data, ['http://www.w3.org/ns/shacl#class'])"
        type="text"
        v-model="selectedValueTreeNode.label"
        @click="valueSelectDialog = true"
      />
      <InputText v-else-if="isObjectHasKeys(selectedProperty.data, ['http://www.w3.org/ns/shacl#datatype'])" type="text" v-model="selectedValueString" />
      <EntitySearch v-else :entity-value="selectedValueTTAlias" @on-change="onValueSelect" />
    </div>
  </div>

  <Dialog v-model:visible="propertySelectDialog" modal header="Add clause" :style="{ width: '50vw' }">
    <PropertySelect
      :from="from"
      :query-data="queryData"
      :selected="selected"
      :level="level + 1"
      @on-cancel="propertySelectDialog = false"
      @on-select="onPropertySelect"
    />
  </Dialog>
  <Dialog v-model:visible="valueSelectDialog" modal header="Add clause" :style="{ width: '50vw' }">
    <ValueSelect :selectedProperty="selectedProperty" @on-cancel="valueSelectDialog = false" @on-select="onValueTreeNodeSelect" />
  </Dialog>
  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="cancel"></Button>
    <Button class="action-button" severity="success" label="Add" @click="add"></Button>
  </div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary, TableQuery } from "@im-library/interfaces";
import { TTAlias, Where } from "@im-library/interfaces/AutoGen";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import PropertySelect from "./addTableQuery/PropertySelect.vue";
import ValueSelect from "./addTableQuery/ValueSelect.vue";
import EntitySearch from "./EntitySearch.vue";

const props = defineProps({
  queryData: { type: Array<TableQuery>, required: true },
  from: { type: Object as PropType<TableQuery>, required: true },
  selected: { type: Array<TableQuery>, required: true },
  level: { type: Number, required: false, default: 0 }
});

const where: Ref<Where> = ref({} as Where);
const selectedProperty: TreeNode = ref({});
const selectedValueTreeNode: Ref<TreeNode> = ref({});
const selectedValueString: Ref<string> = ref("");
const selectedValueTTAlias: Ref<TTAlias> = ref({} as TTAlias);

const propertySelectDialog = ref(false);
const valueSelectDialog = ref(false);
const emit = defineEmits({ onCancel: () => true });

function cancel() {
  emit("onCancel");
}
function onPropertySelect(selectedNode: TreeNode) {
  selectedProperty.value = selectedNode;
}
function onValueTreeNodeSelect(selectedNode: TreeNode) {
  selectedValueTreeNode.value = selectedNode;
}
function onValueSelect(cSummaries: ConceptSummary[]) {
  if (cSummaries.length) {
    selectedValueTTAlias.value["@id"] = cSummaries[0].iri;
    selectedValueTTAlias.value.name = cSummaries[0].name;
  }
}
function add() {
  try {
    props.queryData[0].parent.data.where.push({ description: "new clause" } as Where);
  } catch (error) {
    console.log(error);
  }
}
</script>

<style scoped>
.action-button {
  margin-right: 0.1rem;
}
.footer-actions {
  display: flex;
  justify-content: end;
}

.property-value {
  display: flex;
  align-items: center;
}

.value-select-container {
  display: flex;
  align-items: center;
  padding-left: 1rem;
}
</style>
