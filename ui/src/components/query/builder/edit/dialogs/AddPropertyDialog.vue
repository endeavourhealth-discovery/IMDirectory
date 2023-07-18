<template>
  <Dialog v-model:visible="visible" modal maximizable :header="'Add properties'" :style="{ width: '60vw' }">
    <QueryNavTree
      :base-type="baseType"
      :editMatch="editMatch"
      :selected-properties="selectedProperties"
      :variable-map="variableMap"
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
import { Match, Property } from "@im-library/interfaces/AutoGen";
import _, { cloneDeep } from "lodash";
import { TreeNode } from "primevue/tree";
import { buildMatchesFromProperties } from "@im-library/helpers/QueryBuilder";
import QueryNavTree from "../QueryNavTree.vue";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

interface Props {
  showDialog: boolean;
  baseType: string;
  properties?: Property[];
  variableMap: Map<string, any>;
}

const props = defineProps<Props>();
const emit = defineEmits({
  onClose: () => true,
  onAddOrEdit: (_direct: Match[], _nested: Match[]) => true,
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

onMounted(() => {
  if (isArrayHasLength(props.properties)) editMatch.value.property = cloneDeep(props.properties);
});

function onSelectedUpdate(selected: TreeNode[]) {
  selectedProperties.value = selected;
}

async function save() {
  editMatch.value.property = [];
  const { direct, nested } = buildMatchesFromProperties(selectedProperties.value as any);
  emit("onAddOrEdit", direct, nested);
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
