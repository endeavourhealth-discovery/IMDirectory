<template>
  <div class="flex w-full flex-column">
    <InputText type="text" v-model="valueLabel" placeholder="Value label" @change="updateValueLabel" />
    <Listbox :options="selectedEntities" class="flex w-full">
      <template #option="{ option }" class="flex flex-row">
        <div class="option-wrapper flex flex-row">
          <div class="option-content flex flex-row gap-1 align-items-baseline">
            <Button @click="selectedValueMap.delete(option['@id'])" class="builder-button" :severity="'danger'" icon="fa-solid fa-x" text />
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
import { onMounted, watch, Ref, ref, inject } from "vue";
import { RDF, RDFS } from "@im-library/vocabulary";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { Match, Node, TTIriRef } from "@im-library/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import setupOverlay from "@/composables/setupOverlay";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { cloneDeep } from "lodash-es";
import { isConcept, isValueSet } from "@im-library/helpers/ConceptTypeMethods";

const { OS, showOverlay, hideOverlay } = setupOverlay();

interface SelectedEntity {
  "@id": string;
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": TTIriRef[];
  "http://www.w3.org/2000/01/rdf-schema#label": string;
  icon: string[];
  include: boolean;
  entailment: "memberOf" | "descendantsOf" | "descendantsOrSelfOf" | "ancestorsOf";
}

interface Props {
  selectedValueMap: Map<string, Node>;
}
const props = defineProps<Props>();
const selectedEntities: Ref<SelectedEntity[]> = ref([]);
const entailmentOptions: { name: string; id: string }[] = [
  { name: "descendants of", id: "descendantsOf" },
  { name: "descendants or self of", id: "descendantsOrSelfOf" },
  { name: "ancestors of", id: "ancestorsOf" }
];
const selectedPath = inject("selectedPath") as Ref<Match | undefined>;
const valueLabel: Ref<string> = ref("");
watch(
  () => cloneDeep(props.selectedValueMap),
  async () => {
    await init();
    updatePathValues();
  }
);
onMounted(async () => await init());

async function init() {
  const selectedList = Array.from(props.selectedValueMap.keys());
  const entities = await EntityService.getPartialEntities(selectedList, [RDF.TYPE, RDFS.LABEL]);
  for (const entity of entities) {
    entity.icon = getFAIconFromType(entity[RDF.TYPE]);
    entity.include = !props.selectedValueMap.get(entity["@id"])?.exclude;
    if (isValueSet(entity[RDF.TYPE])) entity.entailment = "memberOf";
    else entity.entailment = "descendantsOrSelfOf";
  }
  selectedEntities.value = entities;
  if (selectedPath.value?.where?.[0].valueLabel) valueLabel.value = selectedPath.value?.where?.[0].valueLabel;
}

function getColourStyleFromType(types: TTIriRef[]) {
  return "color: " + getColourFromType(types);
}

function updatePathValues() {
  if (selectedPath.value?.where?.[0]) {
    selectedPath.value.where[0].instanceOf = selectedEntities.value.map(selected => convertSelectedEntityToNode(selected));
  }
}

function convertSelectedEntityToNode(selected: SelectedEntity): Node {
  const node: Node = { "@id": selected["@id"], exclude: !selected.include };
  switch (selected.entailment) {
    case "memberOf":
      node.memberOf = true;
      break;
    case "descendantsOf":
      node.descendantsOf = true;
      break;
    case "descendantsOrSelfOf":
      node.descendantsOrSelfOf = true;
      break;
    case "ancestorsOf":
      node.ancestorsOf = true;
      break;

    default:
      node.descendantsOrSelfOf = true;
      break;
  }
  return node;
}

function updateValueLabel() {
  if (selectedPath.value?.where?.[0]) {
    selectedPath.value.where[0].valueLabel = valueLabel.value;
  }
}
</script>

<style scoped></style>
