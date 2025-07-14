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
                <Button
                  icon="drag-icon fa-solid fa-grip-vertical"
                  severity="secondary"
                  text
                  draggable="true"
                  @dragstart="onDragStart($event, where, parent)"
                  @dragend="onDragEnd(where, parent)"
                />
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
                <RoleGroup v-if="!isInAttributeGroup" v-model:where="where" v-model:isRoleGroup="isRoleGroup" />
              </div>

              <div class="nested-ecl-refinement">
                <div v-for="(item, index) in where[operator]" :key="item.uuid">
                  <ECLRefinement
                    v-model:where="where[operator]![index]!"
                    v-model:parent="where"
                    :focusConcepts="props.focusConcepts"
                    :index="index"
                    :isInAttributeGroup="isRoleGroup || isInAttributeGroup"
                    v-model:parentGroup="group"
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

          <div v-if="parentOperator" class="constraint-operator">
            <Select
              :disabled="parentGroup.length > 0 && (!parentGroup.includes(index) || parentGroup.length === 1)"
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
          <div class="group-checkbox">
            <Checkbox
              :inputId="'group' + index"
              name="Group"
              :value="index"
              v-model="checked"
              data-testid="group-checkbox"
              @update:modelValue="onCheckGroupChange"
              v-tooltip="'Select to create boolean subgroup'"
            />
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
            @update:selected="updateProperty"
          />

          <Button v-if="where.invalid" icon="fa-solid fa-exclamation" severity="danger" v-tooltip="'Value is invalid for property'" />
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
import { EclService } from "@/services";
import { IM, SNOMED, QUERY, RDF } from "@/vocabulary";
import { useToast } from "primevue/usetoast";
import { ToastSeverity } from "@/enums";
import { Bool, Where, Match, QueryRequest, SearchResultSummary, TTIriRef, Node } from "@/interfaces/AutoGen";
import { useFilterStore } from "@/stores/filterStore";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { getBooleanOptions, updateBooleans, getIsRoleGroup, checkGroupChange } from "@/helpers/IMQueryBuilder";
import { setConstraintOperator, constraintOperatorOptions, getConstraintOperator, manageRoleGroup } from "@/helpers/IMQueryBuilder";

import Button from "primevue/button";
import ECLRefinementValue from "@/components/directory/topbar/eclSearch/builder/ECLRefinementValue.vue";
import RoleGroup from "@/components/directory/topbar/eclSearch/builder/RoleGroup.vue";
import {Namespace} from "@/vocabulary/Namespace";

interface Props {
  focusConcepts: string[];
  index: number;
  rootBool?: boolean;
  parentOperator?: string;
  parentType: string;
  isInAttributeGroup: boolean;
}

const props = defineProps<Props>();
const where = defineModel<Where>("where", { default: {} });
const parent = defineModel<Where | Match>("parent");
const parentGroup = defineModel<number[]>("parentGroup", { default: [] });
const emit = defineEmits(["updateBool", "rationalise"]);
const propertyTreeRoots: Ref<string[]> = ref([]);
const imQueryForPropertySearch: Ref<QueryRequest | undefined> = ref(undefined);
const group: Ref<number[]> = ref([]);
const checked: Ref<boolean> = ref(false);
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
const valueTreeRoots: Ref<string[]> = ref([IM.ONTOLOGY_PARENT_FOLDER]);
const isRoleGroup = computed(() => getIsRoleGroup(where.value));
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
});

onMounted(async () => {
  loadingProperty.value = true;
  await processProps();
  loadingProperty.value = false;
});

function onRationalise() {
  emit("rationalise");
}

function onCheckGroupChange(e: any) {
  checkGroupChange(e, parentGroup.value, props.index);
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
    propertyTreeRoots.value = await EclService.getPropertiesForDomains(props.focusConcepts);
  }
  return propertyTreeRoots.value;
}
async function updateQueryForPropertySearch(): Promise<QueryRequest> {
  if (props.focusConcepts.length > 0) {
    const focusIriList = props.focusConcepts.map(c => ({ iri: c }));
    imQueryForPropertySearch.value = {
      query: { iri: QUERY.ALLOWABLE_PROPERTIES },
      argument: [
        {
          parameter: "this",
          valueIriList: focusIriList
        }
      ]
    } as QueryRequest;
  } else {
    imQueryForPropertySearch.value = {
      query: { iri: Namespace.IM + "getDescendants" },
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
  emit("updateBool", props.parentOperator, val, props.index);
}
function updateBool(oldOperator: Bool | string, newOperator: Bool | string, index: number) {
  updateBooleans(where.value!, oldOperator as Bool, newOperator as Bool, index, group.value);
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
  if (where.value && where.value.iri) {
    const result = await EclService.isValidPropertyForDomains(where.value.iri, props.focusConcepts);
    if (!result) {
      where.value.invalid = true;
      toast.add({
        severity: ToastSeverity.ERROR,
        summary: "Invalid property",
        detail: `Property "${selectedProperty.value?.name ? selectedProperty.value.name : where.value.iri}" is not a  valid attribute for selected concepts "`,
        life: 3000
      });
    } else where.value.invalid = false;
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
    where.value.invalid = false;
  } else {
    where.value.iri = property.iri;
    where.value.name = property.name;
    where.value.invalid = false;
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
