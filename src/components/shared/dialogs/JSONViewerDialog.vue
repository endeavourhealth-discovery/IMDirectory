<template>
  <Dialog v-model:visible="visible" modal maximizable :header="'JSON Viewer'" :style="{ width: '75vw' }">
    <VueJsonPretty v-if="!editMode" class="json" :path="'res'" :data="data" />
    <JSONEditor v-else-if="editMode" v-model:data="editData" />
    <template v-if="!editMode" #footer>
      <Button label="Edit" @click="editMode = true" text severity="help" />
      <Button label="OK" @click="visible = false" text />
    </template>
    <template v-else-if="editMode" #footer>
      <Button label="Cancel" @click="editMode = false" text severity="secondary" />
      <Button label="Save" @click="onSave" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import JSONEditor from "./JSONEditor.vue";

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean",
  save: payload => true
});

interface Props {
  showDialog: boolean;
  data: any;
}
const props = defineProps<Props>();
const visible = ref(false);
const editMode = ref(false);
const editData = ref();

onMounted(() => {
  init();
});

watch(editMode, () => init());

watch(
  () => props.showDialog,
  newValue => {
    editMode.value = false;
    visible.value = newValue;
  }
);

watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});

function init() {
  editData.value = { ...props.data };
}

function onSave() {
  emit("save", editData.value);
  editMode.value = false;
}
</script>

<style scoped></style>
