<template>
  <div class="flex w-full">
    <Listbox :options="selectedEntities" class="flex w-full">
      <template #option="{ option }" class="flex flex-row">
        <div class="flex flex-row">
          <div class="flex flex-row gap-1 align-items-baseline">
            <Button @click="selectedSet.delete(option['@id'])" class="builder-button" :severity="'danger'" icon="fa-solid fa-x" text />
            <ToggleButton v-model="option.include" onLabel="include" offLabel="exclude" />
            <InputText v-if="isValueSet(option[RDF.TYPE])" type="text" v-model="option.entailment" disabled />
            <Select v-else v-model="option.entailment" :options="entailmentOptions" optionLabel="name" optionValue="id" placeholder="Select an entailment" />
            <div class="flex-column">
              <IMFontAwesomeIcon v-if="option.icon" :icon="option.icon" :style="getColourStyleFromType(option[RDF.TYPE])" class="p-mx-1 type-icon" />
              <span @mouseover="showOverlay($event, option['@id'])" @mouseleave="hideOverlay($event)">{{ option[RDFS.LABEL] }}</span>
            </div>
          </div>
        </div>
      </template>
    </Listbox>
  </div>
  <OverlaySummary ref="OS" />
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { onMounted, watch, Ref, ref } from "vue";
import { RDF, RDFS } from "@im-library/vocabulary";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import setupOverlay from "@/composables/setupOverlay";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { cloneDeep } from "lodash-es";
import { isConcept, isValueSet } from "@im-library/helpers/ConceptTypeMethods";

const { OS, showOverlay, hideOverlay } = setupOverlay();

interface Props {
  selectedSet: Set<string>;
}
const props = defineProps<Props>();
const selectedEntities: Ref<any[]> = ref([]);
const entailmentOptions: { name: string; id: string }[] = [
  { name: "descendants of", id: "descendantsOf" },
  { name: "descendants or self of", id: "descendantsOrSelfOf" },
  { name: "ancestors of", id: "ancestorsOf" }
];
watch(
  () => cloneDeep(props.selectedSet),
  async () => await init()
);
onMounted(async () => await init());

async function init() {
  const selectedList = Array.from(props.selectedSet);
  const entities = await EntityService.getPartialEntities(selectedList, [RDF.TYPE, RDFS.LABEL]);
  for (const entity of entities) {
    entity.icon = getFAIconFromType(entity[RDF.TYPE]);
    entity.include = true;
    if (isValueSet(entity[RDF.TYPE])) entity.entailment = "memberOf";
    else entity.entailment = "descendantsOrSelfOf";
  }
  selectedEntities.value = entities;
}

function getColourStyleFromType(types: TTIriRef[]) {
  return "color: " + getColourFromType(types);
}
</script>

<style scoped></style>
