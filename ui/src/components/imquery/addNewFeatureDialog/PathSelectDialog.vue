<template>
  <Dialog v-model:visible="visible" maximizable modal :style="{ minWidth: '50vw' }" header="Select Path">
    <Listbox v-model="selectedPath" :options="pathSuggestions" class="w-full">
      <template #option="{ option }: { option: Match }">
        <div class="flex align-items-center" id="query-path-options" v-if="isArrayHasLength(option.where)">
          <div v-if="option.path && option.typeOf">{{ option.path?.[0].name }} -> {{ option.typeOf?.name }} . {{ option.where?.[0]?.name }}</div>
          <div v-else-if="option.where?.[0]?.['@id'] === property?.['@id']">. {{ option.where?.[0]?.name }}</div>
          <div v-else>-> {{ option.where?.[0]?.name }} . {{ property?.name }}</div>
        </div>
      </template>
    </Listbox>
    <template #footer>
      <Button label="Close" severity="secondary" icon="pi pi-arrow-left" @click="visible = false" />
      <Button label="Select" :disabled="!selectedPath" iconPos="right" @click="onSelect" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match, TTIriRef } from "@im-library/interfaces/AutoGen";
import { ref } from "vue";
import { Ref, watch } from "vue";
interface Props {
  showDialog: boolean;
  property: TTIriRef | undefined;
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

function onSelect() {
  if (selectedPath.value) emit("onSelectedPath", selectedPath.value);
  visible.value = false;
}
</script>

<style scoped></style>
