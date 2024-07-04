<template>
  <Dialog
    v-model:visible="visible"
    maximizable
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
  >
    <template #header>Select path</template>
    <Listbox v-model="selectedPath" :options="pathSuggestions" class="w-full">
      <template #option="{ option }">
        <div class="flex align-items-center" id="query-path-options">
          <div v-if="option.path">{{ option.path?.[0].name }} -> {{ option.typeOf?.name }} . {{ option.where?.[0]?.name }}</div>
          <div v-else>{{ option.where?.[0]?.name }}</div>
        </div>
      </template>
    </Listbox>
    <template #footer>
      <Button label="Close" severity="secondary" icon="pi pi-arrow-left" @click="visible = false" />
      <Button
        label="Select"
        :disabled="!selectedPath"
        iconPos="right"
        @click="
          {
            if (selectedPath) emit('onSelectedPath', selectedPath);
            visible = false;
          }
        "
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { getNameFromIri } from "@im-library/helpers/TTTransform";
import { Match, Where } from "@im-library/interfaces/AutoGen";
import { ref } from "vue";
import { Ref, onMounted, watch } from "vue";
interface Props {
  showDialog: boolean;
  pathSuggestions: Match[];
}

const emit = defineEmits({
  onSelectedPath: (payload: Match) => payload,
  "update:showDialog": payload => typeof payload === "boolean"
});

const props = defineProps<Props>();
const visible: Ref<boolean> = ref(false);
const selectedPath: Ref<Match | undefined> = ref();

watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});

watch(
  () => props.showDialog,
  newValue => {
    visible.value = newValue;
  }
);
onMounted(async () => {});
</script>

<style scoped></style>
