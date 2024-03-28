<template>
  <div>
    <Dialog
      v-model:visible="visible"
      header="Edit feature"
      :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
    >
      <!-- TODO: <EditMatch /> -->
      <template #footer>
        <div class="button-footer">
          <Button label="Cancel" text @click="visible = false" />
          <Button label="Save" autofocus @click="visible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
interface Props {
  showDialog: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean"
});

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

onMounted(async () => {});
</script>

<style scoped></style>
