<template>
  <Dialog v-model:visible="visible" modal maximizable :header="header" :style="{ minWidth: '50vw' }">
    <Stepper :style="{ minWidth: '50vw' }">
      <StepperPanel header="Select property">
        <template #content="{ nextCallback }">
          <div class="flex flex-column">
            <div class="flex-auto flex align-items-center font-medium">
              <QueryNavTree
                :editMatch="editMatch"
                v-model:selected-property="selectedProperty"
                :dm-iri="dataModelIri"
                :show-variable-options="showVariableOptions"
              />
            </div>
          </div>
          <div class="flex pt-4 justify-content-end">
            <Button :disabled="!isObjectHasKeys(selectedProperty)" label="Next" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" />
          </div>
        </template>
      </StepperPanel>
      <StepperPanel header="Populate value">
        <template #content="{ prevCallback, nextCallback }">
          <EditProperty :property="editWhere" :data-model-iri="selectedProperty?.parent?.data" :show-delete="false" />
          <div class="flex pt-4 justify-content-between">
            <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="prevCallback" />
            <Button label="Save" iconPos="right" @click="save" />
          </div>
        </template>
      </StepperPanel>
    </Stepper>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import { Match, Where } from "@im-library/interfaces/AutoGen";
import _, { cloneDeep } from "lodash";
import { TreeNode } from "primevue/treenode";
import { buildProperty } from "@im-library/helpers/QueryBuilder";
import QueryNavTree from "./QueryNavTree.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import EditProperty from "./EditProperty.vue";

interface Props {
  showDialog: boolean;
  match?: Match;
  header: string;
  dataModelIri: string;
  showVariableOptions: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits({
  onClose: () => true,
  onPropertyAdd: (_property: Where) => true,
  "update:showDialog": payload => typeof payload === "boolean"
});
const editMatch: Ref<Match> = ref({ property: [] } as Match);
const selectedProperty: Ref<TreeNode> = ref({});
const visible: Ref<boolean> = ref(false);
const editWhere: Ref<Where> = ref({});
const dmIri: Ref<string> = ref("");

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

watch(
  () => cloneDeep(props.match),
  newValue => {
    if (isObjectHasKeys(props.match, ["property"]) && isArrayHasLength(props.match!.where)) editMatch.value.where = cloneDeep(props.match!.where);
  }
);

watch(
  () => cloneDeep(selectedProperty.value),
  newValue => {
    if (isObjectHasKeys(selectedProperty.value)) editWhere.value = buildProperty(selectedProperty.value as any);
  }
);

onMounted(() => {
  if (isObjectHasKeys(props.match, ["property"]) && isArrayHasLength(props.match!.where)) editMatch.value.where = cloneDeep(props.match!.where);
});

async function save() {
  emit("onPropertyAdd", buildProperty(selectedProperty.value as any));
  visible.value = false;
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: end;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.add-base-container {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.query-nav-tree {
  height: 70vh;
}

.edit-property {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
}
</style>
