<template>
  <div class="add-base-container">
    <QueryNavTree :base-type="baseType" :editMatch="editMatch" :selected-properties="selectedProperties" />
    <div class="footer">
      <Button label="Discard" severity="secondary" @click="discard" text />
      <Button label="Save" @click="save" text />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import { Match } from "@im-library/interfaces/AutoGen";
import QueryNavTree from "../QueryNavTree.vue";
import _ from "lodash";
import { TreeNode } from "primevue/tree";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { buildWhereFromProperty } from "@im-library/helpers/QueryBuilder";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";

interface Props {
  baseType: string;
  match?: Match;
}

const props = defineProps<Props>();
const emit = defineEmits({ onClose: () => true, onAddProperty: (_payload: Match) => true });
const editMatch: Ref<Match> = ref({ where: [] } as Match);
const selectedProperties: Ref<TreeNode[]> = ref([]);

onMounted(() => {
  if (props.match) editMatch.value = _.cloneDeep(props.match);
});

function isDirectProperty(treeNode: TreeNode) {
  return (treeNode.parent && treeNode.parent.key === "0") || (treeNode.parent.parent && treeNode.parent.parent.key === "0");
}

function addProperty(treeNode: TreeNode) {
  editMatch.value.where?.push(buildWhereFromProperty(treeNode as any));
  describeMatch([editMatch.value], "match");
}

async function save() {
  if (!isArrayHasLength(editMatch.value.where)) editMatch.value.where = [];
  for (const treeNodeProperty of selectedProperties.value) {
    addProperty(treeNodeProperty);
  }

  emit("onAddProperty", editMatch.value);
}

function discard() {
  emit("onClose");
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
