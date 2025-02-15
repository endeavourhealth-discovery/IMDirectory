<template>
  <div v-if="loading" class="flex w-full flex-col">
    <ProgressSpinner />
  </div>
  <div v-else-if="canHaveValueList" class="flex w-full flex-col">
    <InputText v-model="valueLabel" placeholder="Value label" type="text" @change="updateValueLabel" />
    <Listbox :options="selectedEntities" class="flex w-full">
      <template #empty> Add concepts and/or sets to this list</template>
      <template #option="{ option }" class="flex flex-row">
        <div class="option-wrapper flex flex-row">
          <div class="option-content flex flex-row items-center gap-1">
            <ToggleButton v-model="option.include" class="flex-shrink-0" offLabel="exclude" onLabel="include" />
            <InputText v-if="isValueSet(option[RDF.TYPE])" v-model="option.entailment" disabled type="text" />
            <Select v-else v-model="option.entailment" :options="entailmentOptions" optionLabel="name" optionValue="id" placeholder="Select an entailment" />
            <div class="flex-col px-1 pb-1">
              <IMFontAwesomeIcon v-if="option.icon" :icon="option.icon" :style="getColourStyleFromType(option[RDF.TYPE])" class="type-icon mr-2" />
              <span @mouseleave="hideOverlay" @mouseover="showOverlay($event, option['@id'])">{{ option[RDFS.LABEL] }}</span>
            </div>
            <Button
              :severity="'danger'"
              class="builder-button"
              data-testid="remove-member-button"
              icon="fa-solid fa-trash"
              text
              @click="selectedValueMap.delete(option['@id'])"
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
import { inject, onMounted, ref, Ref, watch } from "vue";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { Match, Node, TTIriRef } from "@/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import setupOverlay from "@/composables/setupOverlay";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import { cloneDeep } from "lodash-es";
import { isConcept, isValueSet } from "@/helpers/ConceptTypeMethods";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";

interface Props {
  dataModelIri: string | undefined;
  propertyIri: string | undefined;
  updatedPathOption: boolean;
  addDefaultValue?: boolean;
}

const props = defineProps<Props>();
const { getLeafMatch } = setupIMQueryBuilderActions();
const { OS, showOverlay, hideOverlay } = setupOverlay();

interface SelectedEntity {
  "@id": string;
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": TTIriRef[];
  "http://www.w3.org/2000/01/rdf-schema#label": string;
  icon: string[];
  include: boolean;
  entailment: "memberOf" | "descendantsOf" | "descendantsOrSelfOf" | "ancestorsOf";
}

const loading = ref(true);
const selectedEntities: Ref<SelectedEntity[]> = ref([]);
const entailmentOptions: { name: string; id: string }[] = [
  { name: "descendants of", id: "descendantsOf" },
  { name: "descendants or self of", id: "descendantsOrSelfOf" },
  { name: "ancestors of", id: "ancestorsOf" }
];
const selectedPath = inject("selectedPath") as Ref<Match | undefined>;
const valueLabel: Ref<string> = ref("");
const selectedValueMap = inject("selectedValueMap") as Ref<Map<string, Node>>;
const canHaveValueList: Ref<boolean> = ref(false);

const emit = defineEmits({
  goToNextStep: () => true
});

watch(
  () => props.updatedPathOption,
  () => {
    if (canHaveValueList.value) updatePathValues();
  }
);

watch(
  () => cloneDeep(selectedPath.value),
  async newValue => {
    await updateCanHaveValueList(newValue);
  }
);

watch(
  () => cloneDeep(selectedValueMap.value),
  async () => {
    if (props.addDefaultValue) {
      await init();
      emit("goToNextStep");
    } else await init();
  }
);
watch(
  () => cloneDeep(selectedEntities.value),
  async () => {
    updatePathValues();
  }
);
onMounted(async () => await init());

async function init() {
  loading.value = true;
  const selectedList = Array.from(selectedValueMap.value.keys());
  let entities = await EntityService.getPartialEntities(selectedList, [RDF.TYPE, RDFS.LABEL]);
  entities = entities.filter(entity => isConcept(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE]));
  if (isArrayHasLength(entities)) {
    for (const entity of entities) {
      entity.icon = getFAIconFromType(entity[RDF.TYPE]);
      entity.include = !selectedValueMap.value.get(entity["@id"])?.exclude;
      if (isValueSet(entity[RDF.TYPE])) entity.entailment = "memberOf";
      else entity.entailment = "descendantsOrSelfOf";
    }
    selectedEntities.value = entities;
    if (selectedPath.value?.where?.[0].valueLabel) valueLabel.value = selectedPath.value?.where?.[0].valueLabel;
  }
  loading.value = false;
}

function getColourStyleFromType(types: TTIriRef[]) {
  return "color: " + getColourFromType(types);
}

function updatePathValues() {
  let index = 0;
  if (selectedPath.value?.where?.length && selectedPath.value?.where?.length !== 1)
    index = selectedPath.value?.where?.findIndex(where => where["@id"] === props.propertyIri);
  if (index != -1 && selectedPath.value?.where?.[index]) {
    if (selectedPath.value?.where?.[index]) {
      selectedPath.value.where[index].is = selectedEntities.value.map(selected => convertSelectedEntityToNode(selected));
    }
  }
}

function convertSelectedEntityToNode(selected: SelectedEntity): Node {
  const node: Node = {
    "@id": selected["@id"],
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

function updateValueLabel() {
  if (selectedPath.value?.where?.[0]) {
    selectedPath.value.where[0].valueLabel = valueLabel.value;
  }
}

async function updateCanHaveValueList(path: Match | undefined) {
  if (path) {
    const dmIri = path.typeOf?.["@id"] ?? props.dataModelIri;
    const propIri = getLeafMatch(path)?.where?.[0]["@id"];
    if (propIri === IM.DATA_MODEL_PROPERTY_CONCEPT) canHaveValueList.value = true;
    else if (dmIri && propIri) {
      const entity = await EntityService.getPartialEntity(dmIri, [SHACL.PROPERTY]);
      const prop = entity[SHACL.PROPERTY]?.find((prop: any) => prop?.[SHACL.PATH]?.[0]["@id"] === propIri);
      canHaveValueList.value = prop && isArrayHasLength(prop[SHACL.CLASS]);
    } else canHaveValueList.value = false;
  } else canHaveValueList.value = false;
}
</script>

<style scoped></style>
