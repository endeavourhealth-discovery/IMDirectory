<template>
  <Dialog v-model:visible="showEditor" :modal="true" :style="{ width: '80vw', height: '80vh' }" header="Edit Condition">
    <WhereEditor v-model:match="match" :baseType="baseType" :clause-index="0" :depth="0" :editingWhere="true" :show-editor="true" />
    <template #footer>
      <div class="button-footer">
        <Button data-testid="cancel-edit-feature-button" label="Cancel" text @click="cancel" />
        <Button v-if="edited" autofocus data-testid="save-feature-button" label="Save" @click="onSave" />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";

import type { Node, Query } from "@endeavour/vue-library/models";

import Button from "primevue/button";
import Dialog from "primevue/dialog";

import WhereEditor from "@/components/imquery/WhereEditor.vue";

interface Props {
  baseType: Node;
}
const props = defineProps<Props>();
const showEditor = defineModel<boolean>("showCaseConditionEditor", { default: false });
const match: Ref<Query> = defineModel<Query>("match", { default: {} });
const edited = ref(false);
const emit = defineEmits<{
  (event: "saveCondition", match: Query): void;
  (event: "cancel"): void;
}>();

function cancel() {
  showEditor.value = false;
  emit("cancel");
}

function onSave() {
  showEditor.value = false;
  emit("saveCondition", match.value);
}
</script>

<style scoped></style>
