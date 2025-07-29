<template>
  <div v-if="loading" class="flex w-full flex-col">
    <ProgressSpinner />
  </div>
  <div v-else class="flex w-full flex-col">
    <InputText v-model="valueLabel" placeholder="Value label" type="text" @change="updateValueLabel" />
    <Listbox :options="selectedEntities" class="flex w-full">
      <template #empty> Add concepts and/or sets to this list</template>
      <template #option="{ option }">
        <div class="option-wrapper flex flex-row">
          <div class="option-content flex flex-row items-center gap-1">
            <ToggleButton v-model="option.include" class="shrink-0" offLabel="exclude" onLabel="include" />
            <InputText v-if="isValueSet(option[RDF.TYPE])" v-model="option.entailment" disabled type="text" />
            <Select v-else v-model="option.entailment" :options="entailmentOptions" optionLabel="name" optionValue="id" placeholder="Select an entailment" />
            <div class="flex-col px-1 pb-1">
              <IMFontAwesomeIcon v-if="option.icon" :icon="option.icon" :style="getColourStyleFromType(option[RDF.TYPE])" class="type-icon mr-2" />
              <span @mouseleave="hideOverlay" @mouseover="showOverlay($event, option.iri)">{{ option[RDFS.LABEL] }}</span>
            </div>
            <Button
              :severity="'danger'"
              class="builder-button"
              data-testid="remove-member-button"
              icon="fa-solid fa-trash"
              text
              @click="deleteValue(option.iri)"
            />
          </div>
        </div>
      </template>
    </Listbox>
  </div>
  <OverlaySummary ref="OS" />
</template>

<script lang="ts" setup>
import { EntityService } from "@/services";
import { onMounted, ref, Ref, watch } from "vue";
import { IM, RDF, RDFS } from "@/vocabulary";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { Match, Node, TTIriRef } from "@/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import setupOverlay from "@/composables/setupOverlay";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { cloneDeep } from "lodash-es";
import { isConcept, isValueSet } from "@/helpers/ConceptTypeMethods";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";

interface Props {
  propertyIri: string | undefined;
  addDefaultValue?: boolean;
}

const props = defineProps<Props>();
const { OS, showOverlay, hideOverlay } = setupOverlay();

interface SelectedEntity extends TTEntity {
  icon: string[];
  include: boolean;
  entailment: "memberOf" | "descendantsOf" | "descendantsOrSelfOf" | "ancestorsOf";
}

const loading = ref(true);
const selectedEntities = defineModel<Node[]>("selectedEntities", { default: [] });
const entailmentOptions: { name: string; id: string }[] = [
  { name: "descendants of", id: "descendantsOf" },
  { name: "descendants or self of", id: "descendantsOrSelfOf" },
  { name: "ancestors of", id: "ancestorsOf" }
];
const valueLabel: Ref<string> = ref("");

const emit = defineEmits<{
  goToNextStep: [];
}>();

watch(
  () => cloneDeep(selectedEntities.value),
  async () => {
    updatePathValues();
  }
);
onMounted(async () => await init());

async function init() {
  loading.value = true;
  if (selectedEntities.value) {
    const valueIris = selectedEntities.value.map(entity => entity.iri).filter((iri): iri is string => !!iri);
    if (valueIris.length) {
      let entities = await EntityService.getPartialEntities(valueIris!, [RDF.TYPE, RDFS.LABEL]);
      entities = entities.filter(entity => isConcept(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE]));
      if (isArrayHasLength(entities)) {
        for (const entity of entities) {
          entity.icon = getFAIconFromType(entity[RDF.TYPE]);
          if (entity.iri) entity.include = !selectedEntities.value.filter(node => node.iri === entity.iri);
          if (isValueSet(entity[RDF.TYPE])) entity.entailment = "memberOf";
          else entity.entailment = "descendantsOrSelfOf";
        }
      }
    }
  }
  loading.value = false;
}

function deleteValue(iri: string) {}

function getColourStyleFromType(types: TTIriRef[]) {
  return "color: " + getColourFromType(types);
}

function updatePathValues() {}

function convertSelectedEntityToNode(selected: SelectedEntity): Node {
  const node: Node = {
    iri: selected.iri,
    name: selected["http://www.w3.org/2000/01/rdf-schema#label"],
    exclude: !selected.include
  };
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

function updateValueLabel() {}

async function updateCanHaveValueList(path: Match | undefined) {}
</script>

<style scoped></style>
