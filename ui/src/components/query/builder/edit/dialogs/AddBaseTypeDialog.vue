<template>
  <Dialog v-model:visible="visible" modal maximizable :header="'Add base type'" :style="{ width: '60vw' }">
    <BaseEntityTree class="query-nav-tree" @add-base-entity="addBaseEntity" />
    <template #footer>
      <Button label="Discard" severity="secondary" @click="visible = false" text />
      <Button label="Save" @click="setBaseType" text />
    </template>
  </Dialog>

  <Dialog v-model:visible="confirmVisible" modal header="Confirm" :style="{ width: '50vw' }">
    Are you sure you want to change the base type? All current query content will be discarded.
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="confirmVisible = false" text />
      <Button label="Yes" icon="pi pi-check" @click="confirm" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from "vue";

import { Query } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TreeNode } from "primevue/tree";
import BaseEntityTree from "../BaseEntityTree.vue";

interface Props {
  query: Query;
  showDialog: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits({ onClose: () => true, "update:showDialog": payload => typeof payload === "boolean" });
const visible: Ref<boolean> = ref(false);
const confirmVisible: Ref<boolean> = ref(false);

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

const baseNode: Ref<TreeNode> = ref({} as TreeNode);

async function save() {
  if (isObjectHasKeys(baseNode.value)) {
    props.query["@type"] = baseNode.value.data;
  }
  visible.value = false;
}

function addBaseEntity(selected: TreeNode) {
  baseNode.value = selected;
}

function confirm() {
  props.query.match = [];
  confirmVisible.value = false;
  save();
}

function setBaseType() {
  if (isArrayHasLength(props.query.match)) {
    confirmVisible.value = true;
  } else {
    save();
  }
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
