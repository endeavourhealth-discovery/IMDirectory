<template>
  <Dialog v-model:visible="visible" modal maximizable :header="'Add properties'" :style="{ width: '60vw' }">
    <QueryNavTree :base-type="baseType" :editMatch="editMatch" :selected-properties="selectedProperties" @on-selected-update="onSelectedUpdate" />
    <template #footer>
      <Button label="Discard" severity="secondary" @click="visible = false" text />
      <Button label="Save" @click="save" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import { Match } from "@im-library/interfaces/AutoGen";
import _ from "lodash";
import { TreeNode } from "primevue/tree";
import { buildWhereFromProperty } from "@im-library/helpers/QueryBuilder";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import QueryNavTree from "../QueryNavTree.vue";

interface Props {
  showDialog: boolean;
  baseType: string;
  match?: Match;
}

const props = defineProps<Props>();
const emit = defineEmits({ onClose: () => true, onAddProperty: (_payload: Match) => true, "update:showDialog": payload => typeof payload === "boolean" });
const editMatch: Ref<Match> = ref({ where: [] } as Match);
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

onMounted(() => {
  if (props.match) editMatch.value = _.cloneDeep(props.match);
});

function isDirectProperty(treeNode: TreeNode) {
  return (treeNode.parent && treeNode.parent.key === "0") || (treeNode.parent.parent && treeNode.parent.parent.key === "0");
}

function onSelectedUpdate(selected: TreeNode[]) {
  selectedProperties.value = selected;
}

function addDirectProperty(treeNode: TreeNode) {
  editMatch.value.where?.push(buildWhereFromProperty(treeNode as any));
  describeMatch([editMatch.value], "match");
}

function addNestedProperty(treeNode: TreeNode) {
  // TODO refactor to UIProperty
  editMatch.value.where?.push(buildWhereFromProperty(treeNode as any));
  describeMatch([editMatch.value], "match");
}

async function save() {
  editMatch.value.where = [];
  for (const treeNodeProperty of selectedProperties.value) {
    if (isDirectProperty(treeNodeProperty)) addDirectProperty(treeNodeProperty);
    else addNestedProperty(treeNodeProperty);
  }

  emit("onAddProperty", editMatch.value);
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
