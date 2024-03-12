<template>
  <Dialog v-model:visible="visible" modal maximizable :header="header" :style="{ minWidth: '50vw' }">
    <QueryNavTree
      :editMatch="editMatch"
      :selected-properties="selectedProperties"
      :dm-iri="matchType"
      :show-variable-options="showVariableOptions"
      @on-selected-update="onSelectedUpdate"
    />
    <template #footer>
      <Button label="Discard" severity="secondary" @click="visible = false" text />
      <Button label="Save" @click="save" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import { Match } from "@im-library/interfaces/AutoGen";
import _, { cloneDeep } from "lodash";
import { TreeNode } from "primevue/treenode";
import { buildMatchesFromProperties } from "@im-library/helpers/QueryBuilder";
import QueryNavTree from "../QueryNavTree.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

interface Props {
  showDialog: boolean;
  match?: Match;
  header: string;
  matchType: string;
  showVariableOptions: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits({
  onClose: () => true,
  onSave: (_direct: Match[], _nested: Match[]) => true,
  "update:showDialog": payload => typeof payload === "boolean"
});
const editMatch: Ref<Match> = ref({ property: [] } as Match);
const selectedProperties: Ref<TreeNode[]> = ref([]);
const visible: Ref<boolean> = ref(false);

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

onMounted(() => {
  if (isObjectHasKeys(props.match, ["property"]) && isArrayHasLength(props.match!.where)) editMatch.value.where = cloneDeep(props.match!.where);
});

function onSelectedUpdate(selected: TreeNode[]) {
  selectedProperties.value = selected;
}

async function save() {
  editMatch.value.where = [];
  const { direct, nested } = buildMatchesFromProperties(selectedProperties.value as any);
  emit("onSave", direct, nested);
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
</style>
