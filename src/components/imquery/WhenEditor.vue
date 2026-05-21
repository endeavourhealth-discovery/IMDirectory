<template>
  <Dialog v-model:visible="showEditor" :modal="true" :style="{ width: '80vw', height: '80vh' }" header="Edit Condition">
    <WhereEditor
      v-model:match="match"
      v-model:when="when"
      :baseType="baseType"
      :clause-index="0"
      :depth="0"
      :editingWhen="true"
      :show-editor="true"
      @updateMatch="onUpdate"
      @delete-when-where="deleteWhere"
    />
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

import type { Match, Node, When } from "@endeavour/vue-library/interfaces";

import Button from "primevue/button";
import Dialog from "primevue/dialog";

import WhereEditor from "@/components/imquery/WhereEditor.vue";

interface Props {
  baseType: Node;
}
const props = defineProps<Props>();
const showEditor = defineModel<boolean>("showCaseConditionEditor", { default: false });
const match: Ref<Match> = defineModel<Match>("match", { default: {} });
const when: Ref<When> = defineModel<When>("when", { default: {} });
const edited = ref(false);
const emit = defineEmits<{
  (event: "saveCondition", when:When): void;
  (event: "cancel"): void;
}>();

function cancel() {
  showEditor.value = false;
  emit("cancel");
}

function onSave() {
  showEditor.value = false;
  emit("saveCondition", when.value);
}
function onUpdate() {
  edited.value = true;
}
function deleteWhere() {
  delete when.value.where;
}
</script>

<style scoped></style>
