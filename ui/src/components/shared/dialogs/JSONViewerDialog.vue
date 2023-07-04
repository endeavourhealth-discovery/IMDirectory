<template>
  <Dialog v-model:visible="visible" modal maximizable :header="'JSON Viewer'" :style="{ width: '75vw' }">
    <VueJsonPretty class="json" :path="'res'" :data="data" />
    <template #footer>
      <Button label="OK" @click="visible = false" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean"
});

interface Props {
  showDialog: boolean;
  data: any;
}
const props = defineProps<Props>();
const visible = ref(false);

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
</script>

<style scoped></style>
