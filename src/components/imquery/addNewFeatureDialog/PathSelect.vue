<template>
  <div class="view-title"><b>Relationship</b></div>
  <Listbox v-model="localSelectedPath" :options="pathSuggestions" class="w-full" :invalid="localSelectedPath === null" @change="onSelect()">
    <template #empty> No available relationships </template>
    <template #option="{ option }: { option: Match }">
      <div class="flex items-center" id="query-path-options" v-if="isArrayHasLength(option.where)">
        <div v-if="option.path && option.typeOf">
          {{ option.path?.[0].name }} -> {{ option.typeOf?.name }} . {{ propertyIri ? getNameFromIri(propertyIri) : option.where?.[0]?.name }}
        </div>
        <div v-else-if="dataModelIri">
          {{ toTitleCase(getNameFromIri(dataModelIri)) }} -> {{ propertyIri ? getNameFromIri(propertyIri) : option.where?.[0]?.name }}
        </div>
      </div>
    </template>
  </Listbox>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { toTitleCase } from "@/helpers/StringManipulators";
import { getNameFromIri } from "@/helpers/TTTransform";
import { Match, TTIriRef } from "@/interfaces/AutoGen";
import { cloneDeep } from "lodash-es";
import { ref, watch } from "vue";
import { Ref } from "vue";
interface Props {
  selectedPath: Match | undefined;
  dataModelIri: string | undefined;
  propertyIri?: string;
  pathSuggestions: Match[];
}
const props = defineProps<Props>();

const visible: Ref<boolean> = ref(false);
const localSelectedPath: Ref<Match | undefined> = ref();

const emit = defineEmits({
  onSelectedPath: (payload: Match) => payload
});

watch(
  () => props.selectedPath,
  () => {
    localSelectedPath.value = props.selectedPath;
  }
);

watch(
  () => cloneDeep(localSelectedPath.value),
  newValue => {
    if (!newValue) localSelectedPath.value = props.selectedPath;
  }
);

function onSelect() {
  if (localSelectedPath.value) emit("onSelectedPath", localSelectedPath.value);
  visible.value = false;
}
</script>

<style scoped></style>
