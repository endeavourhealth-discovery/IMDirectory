<template>
  <div :class="!rootBool ? ['nested-ecl-where'] : ''">
    <span v-if="where.or || where.and">
      <div :class="!rootBool ? [hover ? 'nested-div-hover' : 'nested-div'] : ''" @mouseover="mouseover" @mouseout="mouseout">
        <span v-for="operator in operators" :key="operator">
          <span v-if="where[operator]">
            <div @mouseover="mouseover" @mouseout="mouseout">
              <div
                class="conjunction"
                @drop="onDrop($event, where, parent, index)"
                @dragover="
                  onDragOver($event);
                  mouseover($event);
                "
                @dragleave="mouseout"
              />
              <div v-if="!rootBool" class="top-operator">
                <Select
                  :class="parentOperator === 'not' ? 'operator-selector-not' : 'operator-selector'"
                  :modelValue="parentOperator"
                  :options="getBooleanOptions(where, parent!, parentOperator as Bool, 'Where', index)"
                  option-label="label"
                  option-value="value"
                  @update:modelValue="val => updateOperator(val as string)"
                >
                  <template #option="slotProps">
                    <div class="dropdown-labels flex items-center" v-tooltip="slotProps.option.tooltip">
                      <div>{{ slotProps.option.label }}</div>
                    </div>
                  </template>
                </Select>
              </div>
              <div class="nested-ecl-refinement">
                <div v-for="(item, index) in where[operator]" :key="item.uuid">
                  <ECLRefinement
                    v-model:where="where[operator]![index]!"
                    v-model:parent="where"
                    :focusConcepts="props.focusConcepts"
                    :index="index"
                    v-model:group="group"
                    v-model:parentOperator="operator as Bool"
                    :property-tree-roots="propertyTreeRoots"
                    :im-query-for-property-search="imQueryForPropertySearch"
                    :parentType="'where'"
                    @updateBool="updateBool"
                    @rationalise="onRationalise"
                  />
                </div>
              </div>
            </div>
          </span>
        </span>
      </div>
    </span>
    <div v-else class="refinement-content-container" @drop="onDrop($event, where, parent)" @dragover="onDragOver($event)">
      <div class="property-column">
        <div class="property-container">
          <Button
            icon="drag-icon fa-solid fa-grip-vertical"
            severity="secondary"
            text
            draggable="true"
            @dragstart="onDragStart($event, where, parent)"
            @dragend="onDragEnd(where, parent)"
          />

          <div class="group-checkbox">
            <Checkbox
              :inputId="'group' + index"
              name="Group"
              :value="index"
              v-model="parentGroup"
              data-testid="group-checkbox"
              v-tooltip="'Select to create boolean subgroup'"
            />
          </div>
          <div v-if="parentOperator" class="constraint-operator">
            <Select
              :class="parentOperator === 'not' ? 'operator-selector-not' : 'operator-selector'"
              :modelValue="parentOperator"
              :options="getBooleanOptions(where, parent!, parentOperator as Bool, 'Where', index)"
              option-label="label"
              option-value="value"
              @update:modelValue="val => updateOperator(val as string)"
            >
              <template #option="slotProps">
                <div class="dropdown-labels flex items-center" v-tooltip="slotProps.option.tooltip">
                  <div>{{ slotProps.option.label }}</div>
                </div>
              </template>
            </Select>
          </div>
          <Select
            style="width: 4.5rem; min-height: 2.3rem"
            v-model="propertyConstraintOperator"
            :options="constraintOperatorOptions"
            option-label="label"
            option-value="value"
            @change="updatePropertyConstraint"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center">
                <div>{{ propertyConstraintOperator }}</div>
              </div>
            </template>
            <template #option="slotProps">
              <div class="flex items-center" style="min-height: 1rem">
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </Select>

          <AutocompleteSearchBar
            :disabled="!hasFocus || loadingProperty"
            v-model:selected="selectedProperty"
            :imQuery="imQueryForPropertySearch"
            :root-entities="propertyTreeRoots"
            :setupSearch="updateQueryForPropertySearch"
            :setupRootEntities="updatePropertyTreeRoots"
            :class="!isValidProperty && showValidation && 'invalid'"
            @update:selected="updateProperty"
          />

          <small v-if="!isValidProperty && showValidation" class="validate-error">Property is invalid for selected expression constraint.</small>
          <Button
            @click.stop="deleteProperty"
            class="builder-button"
            :severity="hoverDeleteProperty ? 'danger' : 'secondary'"
            :outlined="!hoverDeleteProperty"
            :class="!hoverDeleteProperty && 'hover-button'"
            icon="fa-solid fa-trash"
            @mouseover="hoverDeleteProperty = true"
            @mouseout="hoverDeleteProperty = false"
          />

          <ProgressSpinner v-if="loadingProperty" class="loading-icon" stroke-width="8" />
          <Select style="width: 5rem" v-model="inNotIn" :options="operatorOptions" />
        </div>
      </div>
      <div class="value-column">
        <div v-for="(item, index) in where.is" :key="item.iri">
          <ECLRefinementValue
            :index="index"
            v-model:where="where"
            v-model:node="where.is![index]"
            :imQueryForValueSearch="imQueryForValueSearch!"
            :valueTreeRoots="valueTreeRoots"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, watch, inject, computed } from "vue";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { ConceptService, QueryService } from "@/services";
import { IM, SNOMED, QUERY, RDF } from "@/vocabulary";
import { useToast } from "primevue/usetoast";
import { ToastSeverity } from "@/enums";
import { Bool, Where, Match, QueryRequest, SearchResultSummary, TTIriRef, Node } from "@/interfaces/AutoGen";
import { useFilterStore } from "@/stores/filterStore";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { getBooleanOptions, updateBooleans } from "@/helpers/IMQueryBuilder";
import { setConstraintOperator, constraintOperatorOptions, getConstraintOperator } from "@/helpers/IMQueryBuilder";

import Button from "primevue/button";
import ECLRefinementValue from "@/components/directory/topbar/eclSearch/builder/ECLRefinementValue.vue";

interface Props {
  focusConcepts: TTIriRef[];
  index: number;
  rootBool?: boolean;
  parentOperator?: string;
  parentType: string;
}
const props = defineProps<Props>();
const where = defineModel<Where>("where", { default: {} });
const parent = defineModel<Where | Match>("parent");
const parentGroup = defineModel<number[]>("group", { default: [] });
const emit = defineEmits(["updateBool", "rationalise"]);
const propertyTreeRoots: Ref<string[]> = ref([]);
const imQueryForPropertySearch: Ref<QueryRequest | undefined> = ref(undefined);
const group: Ref<number[]> = ref([]);
const toast = useToast();
const filterStore = useFilterStore();
const hoverDeleteProperty = ref(false);
const filterStoreOptions = computed(() => filterStore.filterOptions);
const coreSchemes = computed(() => filterStore.coreSchemes);
const forceValidation = inject("forceValidation") as Ref<boolean>;
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const operators = ["and", "or"] as const;
const { onDragEnd, onDragStart, onDrop, onDragOver } = setupECLBuilderActions(wasDraggedAndDropped);
const selectedProperty: Ref<SearchResultSummary | undefined> = ref(where.value as SearchResultSummary | undefined);
const loadingProperty = ref(true);
const isValidProperty = ref(false);
const valueTreeRoots: Ref<string[]> = ref([IM.ONTOLOGY_PARENT_FOLDER]);

const showValidation = ref(false);
const operatorOptions = ["=", "!="];
const hover = ref();
const propertyConstraintOperator: Ref<string | undefined> = ref<"<<">();
const inNotIn = computed(() => {
  if (where.value.not) return "!=";
  else return "=";
});
const imQueryForValueSearch: Ref<QueryRequest | undefined> = ref(undefined);
const hasFocus = computed(() => {
  return !!props.focusConcepts;
});

watch(forceValidation, async () => {
  await updateIsValidProperty();
  showValidation.value = true;
});

onMounted(async () => {
  loadingProperty.value = true;
  await processProps();
  loadingProperty.value = false;
});

function onRationalise() {
  emit("rationalise");
}

function deleteProperty() {
  if (props.parentType === "match") {
    delete (parent.value! as Match).where;
  } else {
    if (parent.value) {
      const operator = props.parentOperator as keyof Where;
      if ((parent.value as Where)[operator]) {
        ((parent.value as Where)[operator] as Where[]).splice(props.index, 1);
      }
    }
  }
  emit("rationalise");
}

async function updatePropertyTreeRoots(): Promise<string[]> {
  propertyTreeRoots.value = ["http://snomed.info/sct#410662002"];
  if (props.focusConcepts.length > 0) {
    const imQuery = {
      query: { iri: QUERY.ALLOWABLE_PROPERTY_ANCESTORS },
      argument: [
        {
          parameter: "this",
          valueIriList: props.focusConcepts
        }
      ]
    } as QueryRequest;
    const results = await QueryService.queryIMSearch(imQuery);
    propertyTreeRoots.value.length = 0;
    if (results.entities) {
      for (const entity of results.entities) {
        propertyTreeRoots.value.push(entity.iri);
      }
    }
  }
  return propertyTreeRoots.value;
}
async function updateQueryForPropertySearch(): Promise<QueryRequest> {
  if (props.focusConcepts.length > 0) {
    imQueryForPropertySearch.value = {
      query: { iri: QUERY.ALLOWABLE_PROPERTIES },
      argument: [
        {
          parameter: "this",
          valueIriList: props.focusConcepts
        }
      ]
    } as QueryRequest;
  } else {
    imQueryForPropertySearch.value = {
      query: { iri: IM.NAMESPACE + "getDescendants" },
      argument: [
        {
          parameter: "this",
          valueIriList: [{ iri: "http://snomed.info/sct#410662002" }]
        }
      ]
    } as QueryRequest;
  }
  return imQueryForPropertySearch.value;
}

function mouseover(event: any) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: any) {
  event.stopPropagation();
  hover.value = false;
}

function updateOperator(val: string) {
  emit("updateBool", props.parentOperator, val);
}
function updateBool(oldOperator: Bool | string, newOperator: Bool | string) {
  updateBooleans(where.value!, oldOperator as Bool, newOperator as Bool, props.index, group.value);
  if (newOperator === props.parentOperator) {
    emit("rationalise");
  }
}

function updatePropertyConstraint(e: { value: string }) {
  setConstraintOperator(where.value, e.value);
}

function updateValueConstraint(e: { value: string }) {
  if (!where.value.is) where.value.is = [{}];
  setConstraintOperator(where.value.is[0], e.value);
}
function addValue() {
  where.value!.is!.push({});
}

async function updateIsValidProperty(): Promise<void> {
  if (where.value.iri) {
    const imQuery = {
      query: { iri: QUERY.IS_VALID_PROPERTY },
      argument: [
        {
          parameter: "property",
          valueIri: { iri: where.value.iri }
        },
        {
          parameter: "concept",
          valueIriList: props.focusConcepts
        }
      ]
    } as QueryRequest;
    isValidProperty.value = await QueryService.askQuery(imQuery);
    if (!isValidProperty.value) {
      let detail = "";
      if (props.focusConcepts && props.focusConcepts.length > 0) detail = props.focusConcepts.map(c => c.name).join(", ");
      toast.add({
        severity: ToastSeverity.ERROR,
        summary: "Invalid property",
        detail: `Property "${selectedProperty.value?.name ? selectedProperty.value.name : where.value.iri}" is not valid for concept "${detail}"`,
        life: 3000
      });
    }
  }
}

function processProps() {
  processPropertyProp();
}

function processPropertyProp() {
  if (where.value.iri) {
    selectedProperty.value = { iri: where.value.iri, name: where.value.name } as SearchResultSummary;
    propertyConstraintOperator.value = getConstraintOperator(where.value);
  } else {
    selectedProperty.value = undefined;
    propertyConstraintOperator.value = "<<";
  }
}

async function updateProperty(property: SearchResultSummary | undefined) {
  if (!property) {
    delete where.value.iri;
    delete where.value.name;
  } else {
    where.value.iri = property.iri;
    where.value.name = property.name;
  }
}
</script>

<style scoped>
.nested-ecl-refinement {
  width: 100%;
  box-sizing: border-box;
  flex-direction: column;
  flex: 1 1 0%;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  font-size: 1rem;
}
.refinement-content-container {
  padding: 0;
  margin: 0.5rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: auto;
  width: 100%;
}
.property-column {
  flex: 1;
}
.value-column {
  flex: 1;
}

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.property-container {
  flex: 1 0 auto;
  flex-flow: row nowrap;
  display: flex;
  overflow: auto;
  align-items: first baseline;
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
  overflow: auto;
  width: 100%;
}

.group-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding-right: 0.5rem;
  align-items: center;
}
.group-checkbox label {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: normal;
}
.constraint-operator {
  width: 7.5rem;
}

.dropdown-labels {
  min-height: 1rem;
  font-size: 1rem;
}

::v-deep(.operator-selector .p-select-label) {
  font-size: 0.85rem;
  padding-right: 0;
  margin-right: 0;
}

::v-deep(.operator-selector .p-select-dropdown) {
  padding-left: 0;
  margin-left: 0;
}

::v-deep(.operator-selector-not .p-select-label) {
  color: var(--p-red-500) !important;
  font-size: 0.85rem;
}

.top-operator {
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

.builder-button {
  width: 2rem;
}
</style>
