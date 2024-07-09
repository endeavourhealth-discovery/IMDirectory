<template>
  <div class="flex w-full">
    <Listbox v-model="selectedEntity" :options="selectedEntities" class="flex w-full">
      <template #option="{ option }" class="flex flex-row">
        <div>
          <ToggleButton v-model="option.include" onLabel="include" offLabel="exclude" />
          <IMFontAwesomeIcon v-if="option.icon" :icon="option.icon" :style="getColourStyleFromType(option[RDF.TYPE])" class="p-mx-1 type-icon" />
          <span @mouseover="showOverlay($event, option['@id'])" @mouseleave="hideOverlay($event)">{{ option[RDFS.LABEL] }}</span>
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
const selectedEntity: Ref<any> = ref();
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
    // descendantsOf?: boolean;
    // descendantsOrSelfOf?: boolean;
    // ancestorsOf?: boolean;
    // memberOf?: boolean;
  }
  selectedEntities.value = entities;
}

function getColourStyleFromType(types: TTIriRef[]) {
  return "color: " + getColourFromType(types);
}
</script>

<style scoped></style>
