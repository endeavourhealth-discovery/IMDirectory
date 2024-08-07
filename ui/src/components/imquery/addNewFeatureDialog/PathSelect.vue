<template>
  <div class="view-title"><b>Path</b></div>
  <Listbox v-model="localSelectedPath" :options="pathSuggestions" class="w-full" @change="onSelect()">
    <template #empty> No available paths </template>
    <template #option="{ option }: { option: Match }">
      <div class="flex items-center" id="query-path-options" v-if="isArrayHasLength(option.where)">
        <div v-if="option.path && option.typeOf">
          {{ option.path?.[0].name }} -> {{ option.typeOf?.name }} . {{ propertyIri ? getNameFromIri(propertyIri) : option.where?.[0]?.name }}
        </div>
        <div v-else>{{ toTitleCase(getNameFromIri(dataModelIri)) }} -> {{ propertyIri ? getNameFromIri(propertyIri) : option.where?.[0]?.name }}</div>
      </div>
    </template>
  </Listbox>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { toTitleCase } from "@im-library/helpers/StringManipulators";
import { getNameFromIri } from "@im-library/helpers/TTTransform";
import { Match, TTIriRef } from "@im-library/interfaces/AutoGen";
import { ref, watch } from "vue";
import { Ref } from "vue";
interface Props {
  selectedPath: Match | undefined;
  dataModelIri: string;
  propertyIri?: string;
  pathSuggestions: Match[];
}
const props = defineProps<Props>();

const emit = defineEmits({
  onSelectedPath: (payload: Match) => payload
});

watch(
  () => props.selectedPath,
  () => {
    localSelectedPath.value = props.selectedPath;
  }
);
const visible: Ref<boolean> = ref(false);
const localSelectedPath: Ref<Match | undefined> = ref();

function onSelect() {
  if (localSelectedPath.value) emit("onSelectedPath", localSelectedPath.value);
  visible.value = false;
}
</script>

<style scoped></style>
