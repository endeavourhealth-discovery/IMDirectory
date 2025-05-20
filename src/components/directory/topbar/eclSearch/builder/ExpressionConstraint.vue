<template>
  <div class="nested-ecl-match">
    <div v-if="!match.instanceOf && !hasBoolGroups(match)" class="flex flex-row">
      <Button
        icon="fa-solid fa-plus"
        :severity="hoverAddConcept ? 'success' : 'secondary'"
        :outlined="hoverAddConcept ? false : true"
        :class="!hoverAddConcept && 'hover-button'"
        label="Add concept"
        @click="addInstanceOf"
        @mouseover="hoverAddConcept = true"
        @mouseout="hoverAddConcept = false"
      />
      <Button
        type="button"
        icon="fa-solid fa-filter"
        :class="!hoverAddRefinement && 'hover-button'"
        :severity="hoverAddRefinement ? 'success' : 'secondary'"
        :outlined="hoverAddRefinement ? false : true"
        @click="addRefinement"
        aria-haspopup="true"
        aria-controls="add-filter"
        label="Add refinement"
        data-testid="add-refinement-button"
        @mouseover="hoverAddRefinement = true"
        @mouseout="hoverAddRefinement = false"
      />
    </div>
    <div v-else-if="match.instanceOf">
      <div class="expression-constraint">
        <div style="width: 6.5rem">
          <span v-if="!rootBool">
            <Select
              :class="parentOperator === 'not' ? 'operator-selector-not' : 'operator-selector'"
              :modelValue="parentOperator"
              :options="getBooleanOptions(match, parent!, parentOperator as Bool, 'Match', index)"
              option-label="label"
              option-value="value"
              @update:modelValue="val => updateOperator(val)"
            >
              <template #option="slotProps">
                <div class="dropdown-labels flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
                  <div>{{ slotProps.option.label }}</div>
                </div>
              </template>
            </Select>
          </span>
        </div>
        <span class="left-container">
          <div v-if="parent && (parent[parentOperator as keyof typeof parent] as Match[]).length > 2" class="group-checkbox">
            <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="parentGroup" data-testid="group-checkbox" />
            <label :for="'group' + index">Select</label>
          </div>
        </span>
        <span class="concept-selector-container">
          <ConceptSelector v-model:node="match.instanceOf[0]" :parent="parent" :activeInputId="activeInputId" @activateInput="emit('activateInput', $event)" />
        </span>
        <span class="add-group">
          <Button
            type="button"
            icon="fa-solid fa-filter"
            label="Add concept"
            data-testid="add-concept-button"
            :severity="hoverAddConcept ? 'success' : 'secondary'"
            :outlined="!hoverAddConcept"
            :class="!hoverAddConcept && 'hover-button'"
            @click="addConceptToGroup()"
            @mouseover="hoverAddConcept = true"
            @mouseout="hoverAddConcept = false"
          />
        </span>
        <span class="add-group">
          <Button
            type="button"
            icon="fa-solid fa-plus"
            label="Add attribute"
            data-testid="add-refinement-button"
            :severity="hoverAddRefinement ? 'success' : 'secondary'"
            :outlined="!hoverAddRefinement"
            :class="!hoverAddRefinement && 'hover-button'"
            @click="addRefinement()"
            @mouseover="hoverAddRefinement = true"
            @mouseout="hoverAddRefinement = false"
          />
        </span>
        <span class="add-group">
          <Button
            @click="deleteItem(index)"
            class="builder-button"
            :severity="hoverDeleteConcept ? 'danger' : 'secondary'"
            :outlined="!hoverDeleteConcept"
            :class="!hoverDeleteConcept && 'hover-button'"
            icon="fa-solid fa-trash"
            @mouseover="hoverDeleteConcept = true"
            @mouseout="hoverDeleteConcept = false"
          />
        </span>
      </div>
    </div>
    <div v-else-if="hasBoolGroups(match)">
      <div
        @mouseover="mouseover"
        @mouseout="mouseout"
        @drop="onDrop($event, match, parent, index)"
        @dragover="
          onDragOver($event);
          mouseover($event);
        "
        @dragleave="mouseout"
      >
        <Button
          v-if="!rootBool"
          icon="drag-icon fa-solid fa-grip-vertical"
          severity="secondary"
          text
          draggable="true"
          @dragstart="onDragStart($event, match, parent)"
          @dragend="onDragEnd(match, parent)"
        />
        <span v-for="operator in operators" :key="operator">
          <span v-if="match[operator]">
            <div class="nested-ecl-match" @mouseover="mouseover" @mouseout="mouseout">
              <div
                v-if="match.and || match.or"
                class="conjunction"
                @drop="onDrop($event, match, parent, index)"
                @dragover="
                  onDragOver($event);
                  mouseover($event);
                "
                @dragleave="mouseout"
              />
              <div v-for="(item, index) in match[operator]" :key="item.uuid">
                <ExpressionConstraint
                  v-model:match="match[operator]![index]"
                  :parent="match"
                  :index="index"
                  :operator="operator as Bool"
                  :parentOperator="operator"
                  v-model:parentGroup="group"
                  @updateBool="updateBool"
                  @rationalise="rationaliseBooleans"
                  :rootBool="false"
                />
              </div>
            </div>
          </span>
        </span>
      </div>
      <div v-if="!match.where">
        <Button
          type="button"
          icon="fa-solid fa-filter"
          label="Add attributes to this group"
          :severity="hoverAddRefinement ? 'success' : 'secondary'"
          :outlined="!hoverAddRefinement"
          :class="!hoverAddRefinement && 'hover-button'"
          @click="addRefinement"
          aria-haspopup="true"
          aria-controls="add-filter"
          data-testid="add-match-refinement-button"
          @mouseover="hoverAddRefinement = true"
          @mouseout="hoverAddRefinement = false"
        />
      </div>
    </div>
    <div v-if="match.where">
      <span v-if="hasBoolGroups(match)">Attributes for Group</span>
      <span v-else>With these attributes:</span>
      <ECLRefinement
        v-model:where="match.where"
        v-model:parent="match"
        :index="index"
        :rootBool="true"
        :focusConcepts="focusConcepts"
        :property-tree-roots="propertyTreeRoots"
        class="refinement"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref, ref, watch } from "vue";
import ConceptSelector from "./ConceptSelector.vue";
import Button from "primevue/button";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { Bool, Match, Where, TTIriRef, QueryRequest } from "@/interfaces/AutoGen";
import ECLRefinement from "@/components/directory/topbar/eclSearch/builder/ECLRefinement.vue";
import { buildIMQueryFromFilters, getBooleanOptions, hasBoolGroups, rationaliseBoolGroups, updateBooleans } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";
import { cloneDeep } from "lodash-es";

interface Props {
  index: number;
  parentOperator?: string;
  rootBool?: boolean;
  activeInputId?: string;
}
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parent = defineModel<Match | undefined>("parent") as Ref<Match | undefined>;
const parentGroup = defineModel<number[]>("group", { default: [] });
const group: Ref<number[]> = ref([]);
const emit = defineEmits(["updateBool", "rationalise", "activateInput"]);
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const operators = ["and", "or", "not"] as const;
const { onDragEnd, onDragStart, onDrop, onDragOver } = setupECLBuilderActions(wasDraggedAndDropped);
const hoverAddConcept = ref(false);
const hoverAddRefinement = ref(false);
const hoverDeleteConcept = ref(false);
const focusConcepts: Ref<TTIriRef[]> = ref([]);
const propertyTreeRoots: Ref<string[]> = ref([]);
onMounted(() => {});
function updateOperator(val: string) {
  updateFocusConcepts(match.value);
  emit("updateBool", props.parentOperator, val);
}
import { isEqual } from "lodash-es";
import { QUERY, RDF } from "@/vocabulary";
import { SearchOptions } from "@/interfaces";
import { QueryService } from "@/services";

watch(
  match,
  (newVal, oldVal) => {
    if (!isEqual(newVal, oldVal)) {
      updateFocusConcepts(newVal);
    }
  },
  { deep: true }
);

function focusChildren(children: Match[] | undefined) {
  if (children) {
    for (const [index, item] of children.entries()) {
      updateFocusConcepts(item);
    }
  }
}

function updateFocusConcepts(item: Match) {
  if (item.instanceOf && item.instanceOf[0]["@id"]) focusConcepts.value.push({ "@id": item.instanceOf[0]["@id"] });
  focusChildren(match.value.or);
  focusChildren(match.value.and);
}

function updateBool(oldOperator: Bool | string, newOperator: Bool | string) {
  updateBooleans(match.value!, oldOperator as Bool, newOperator as Bool, props.index, group.value);
  if (newOperator === props.parentOperator) {
    emit("rationalise");
  }
}
function rationaliseBooleans() {
  rationaliseBoolGroups(match.value);
}

function mouseover(event: any) {
  event.stopPropagation();
  hoverAddConcept.value = true;
}

function deleteItem(index: number) {
  if (match.value.or) {
    match.value.or.splice(index, 1);
  } else if (match.value.and) {
    match.value.and.splice(index, 1);
  }
  updateFocusConcepts(match.value);
}
function mouseout(event: any) {
  event.stopPropagation();
  hoverAddConcept.value = false;
}

function addRefinement() {
  setPropertyTreeRoots();
  match.value.where = { uuid: v4(), descendantsOrSelfOf: true, is: [{ descendantsOrSelfOf: true }] } as Where;
}

function addInstanceOf() {
  match.value.instanceOf = [{ uuid: v4(), descendantsOrSelfOf: true }];
}

function addConceptToGroup() {
  if (!parent.value && match.value.instanceOf) {
    const subMatch = { uuid: match.value.uuid, instanceOf: match.value.instanceOf } as Match;
    delete match.value.instanceOf;
    match.value.or = [subMatch];
    match.value.or.push({ uuid: v4(), instanceOf: [{ descendantsOrSelfOf: true }] });
  } else {
    if (!props.parentOperator || !parent.value) return;
    const operator = props.parentOperator as keyof Match;
    const concept = { instanceOf: [{ descendantsOrSelfOf: true }] };
    if (parent.value[operator]) {
      (parent.value[operator] as Match[]).splice(props.index + 1, 0, concept);
    } else {
      if (match.value.instanceOf) {
        const bool = props.rootBool || props.parentOperator === Bool.and ? Bool.or : Bool.and;
        const boolMatch = { uuid: v4(), [bool]: [] } as Match;
        boolMatch[bool]!.push(match.value);
        boolMatch[bool]!.push(concept);
        parent.value = boolMatch;
      }
    }
  }
}

async function setPropertyTreeRoots() {
  let roots = [{ "@id": "http://snomed.info/sct#410662002" }];
  if (focusConcepts.value && focusConcepts.value.length > 0) {
    roots = focusConcepts.value;
  }
  const imQuery = {
    query: { "@id": QUERY.ALLOWABLE_PROPERTY_ANCESTORS },
    argument: [
      {
        parameter: "this",
        valueIriList: roots
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
</script>

<style scoped>
.display-concept {
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  flex: 1 1 0%;
  min-width: 0;
}
.conjunction {
  display: flex;
  flex-flow: row nowrap;
  width: fit-content;
}

.nested-ecl-match {
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

.nested-div:deep(.hover-button) {
  color: #00000030 !important;
  border-style: dashed !important;
}

.nested-div-hover {
  padding: 0.5rem;
  border-radius: 5px;
  background-color: #488bc210;
  margin: 0.5rem;
  flex: 1;
  border: #488bc2 1px solid;
}

.refinement {
  flex: 1 1 auto;
  min-width: 0;
}

.match-container {
  display: flex;
  border: #488bc230 1px solid;
  border-radius: 5px;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}
.expression-constraint {
  display: flex;
  flex: 1;
  gap: 0.5rem;
  align-items: center;
}

.left-container {
  display: flex;
  align-items: center;
}

.group-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
.group-checkbox label {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: normal;
}

.concept-selector-container {
  flex: 1 1 0%;
  min-width: 0;
}

.display-concept {
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  min-width: 0;
}

.add-group {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  gap: 4px;
  padding: 4px 0 0 4px;
}

.builder-button {
  width: 2rem;
}
.add-refinement-button {
  margin-left: 0.1rem;
  width: 12rem;
  max-height: 1rem;
  padding: 1rem;
}

.vertical-button {
  writing-mode: vertical-lr;
  transform: scale(-1);
}
.not-button {
  margin: 6px 0 6px 6px;
}

.add-filter-button {
  display: flex;
  width: 12rem;
  margin-left: 0.1rem;
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
.dropdown-labels {
  min-height: 1rem;
  font-size: 1rem;
}
</style>
