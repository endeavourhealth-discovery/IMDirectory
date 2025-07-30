<template>
  <div class="add-property-dialog">
    <div class="add-property-dialog-tree flex">
      <QueryNavTree
        v-model:selected-property="selectedProperty"
        :dm-iri="dataModelIri"
        :editMatch="editMatch"
        :show-variable-options="showVariableOptions"
        class="w-4/12"
      />
      <EditProperty :data-model-iri="editWhereDMIri || dataModelIri" :edit-match="editMatch" :property="editWhere" :show-delete="false" />
    </div>
    <div class="button-bar gap-1">
      <Button data-testid="add-property-dialog-cancel" label="Cancel" severity="secondary" type="button" @click="emit('onDialogUpdate', false)"></Button>
      <Button :disabled="!selectedProperty" data-testid="add-property-dialog-save" label="Save" type="button" @click="save"></Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from "vue";
import { DisplayMode, Match, Query, Where } from "@/interfaces/AutoGen";
import type { TreeNode } from "primevue/treenode";
import { buildProperty } from "@/composables/buildQuery";
import QueryNavTree from "./QueryNavTree.vue";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash-es";
import EditProperty from "./EditProperty.vue";
import { QueryService } from "@/services";

interface Props {
  match: Match;
  dataModelIri: string;
  showVariableOptions: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  onClose: [];
  onPropertyAdd: [payload: Where];
  onMatchAdd: [payload: Match];
  onDialogUpdate: [payload: boolean];
}>();
const editMatch: Ref<Match> = ref({ property: [] } as Match);
const selectedProperty: Ref<TreeNode | undefined> = ref();
const editWhere: Ref<Where> = ref({});
const editWhereDMIri: Ref<string> = ref("");
const whereOrMatch: Ref<Where | Match> = ref({});

watch(
  () => cloneDeep(props.match),
  () => {
    if (isObjectHasKeys(props.match, ["where"]) && isArrayHasLength(props.match!.where)) editMatch.value.where = cloneDeep(props.match!.where);
  }
);

watch(
  () => cloneDeep(selectedProperty.value),
  () => handlePropertyUpdate()
);

watch(
  () => cloneDeep(editMatch.value),
  async () => await handleEditMatchUpdate()
);

onMounted(() => {
  if (isObjectHasKeys(props.match, ["where"]) && isArrayHasLength(props.match!.where)) editMatch.value.where = cloneDeep(props.match!.where);
});

async function handleEditMatchUpdate() {}

function handlePropertyUpdate() {
  if (isObjectHasKeys(selectedProperty.value)) {
    whereOrMatch.value = buildProperty(selectedProperty.value as any);
    if (isObjectHasKeys(whereOrMatch.value, ["typeOf", "where"])) {
      editWhere.value = getEditWhere(whereOrMatch.value.and![0]!);
      const dmIriFromProperty = getEditWhereDMIri(whereOrMatch.value.and![0]!);
      if (dmIriFromProperty) editWhereDMIri.value = dmIriFromProperty;
      else editWhereDMIri.value = (whereOrMatch.value as Match).typeOf?.iri ?? "";
    } else {
      editWhere.value = getEditWhere(whereOrMatch.value);
      editWhereDMIri.value = getEditWhereDMIri(whereOrMatch.value);
      editMatch.value.where = editWhere.value;
    }
  }
}

async function save() {
  if (isObjectHasKeys(whereOrMatch.value, ["typeOf", "where"])) {
    emit("onMatchAdd", whereOrMatch.value as Match);
  } else emit("onPropertyAdd", whereOrMatch.value as Where);
  emit("onDialogUpdate", false);
}

function getEditWhere(whereMatch: any) {
  const found: any[] = [];
  getEditWhereRecursively(whereMatch, found);
  if (isArrayHasLength(found)) return found[0];
}

function getEditWhereRecursively(where: Where, found: any[]) {
  found.push(where);
}

function getEditWhereDMIri(whereMatch: any) {
  const found: string[] = [];
  getEditWhereDMIriRecursively(whereMatch, found);
  if (isArrayHasLength(found)) return found[0];
  return "";
}

function getEditWhereDMIriRecursively(where: Where, found: any[]) {}
</script>

<style scoped>
.button-bar {
  display: flex;
  justify-content: end;
  align-content: end;
}

.add-property-dialog {
  display: flex;
  flex-flow: column;
  height: calc(100vh - 18rem);
}

.add-property-dialog-tree {
  flex: 1;
}
</style>
