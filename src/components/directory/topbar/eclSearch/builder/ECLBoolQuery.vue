<template>
  <div class="nested-ecl-match">
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
                v-model:parent="match"
                :index="index"
                :operator="operator as Bool"
                :parentOperator="operator"
                v-model:parentGroup="group"
                @updateBool="updateBool"
                @rationalise="onRationalise"
                :rootBool="false"
              />
            </div>
          </div>
        </span>
      </span>
    </div>
    <Button
      type="button"
      icon="fa-solid fa-plus"
      label="Add concept"
      data-testid="add-concept-button"
      :severity="hoverAddConcept ? 'success' : 'secondary'"
      :outlined="!hoverAddConcept"
      :class="!hoverAddConcept && 'hover-button'"
      @click.stop="addConcept()"
      @mouseover="hoverAddConcept = true"
      @mouseout="hoverAddConcept = false"
    />

    <div v-if="match.where">
      <span>Attributes for Group</span>
      <RoleGroup v-model:where="match.where" v-model:isRoleGroup="isRoleGroup" />
      <ECLRefinement
        v-model:where="match.where"
        v-model:parent="match"
        :index="index"
        :isInAttributeGroup="isRoleGroup"
        :rootBool="true"
        :focusConcepts="focusConcepts"
        :parentType="'match'"
        :propertyTreeRoots="propertyTreeRoots"
        :imQueryForPropertySearch="imQueryForPropertySearch"
        @rationalise="onRationalise"
        class="refinement"
      />
    </div>
    <Button
      type="button"
      icon="fa-solid fa-filter"
      :class="!hoverAddRefinement && 'hover-button'"
      :severity="hoverAddRefinement ? 'success' : 'secondary'"
      :outlined="!hoverAddRefinement"
      @click.stop="addRefinement"
      aria-haspopup="true"
      aria-controls="add-filter"
      label="Add attribute"
      data-testid="add-refinement-button"
      @mouseover="hoverAddRefinement = true"
      @mouseout="hoverAddRefinement = false"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref, ref, computed } from "vue";
import Button from "primevue/button";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { Bool, Match, Where, QueryRequest } from "@/interfaces/AutoGen";
import ECLRefinement from "@/components/directory/topbar/eclSearch/builder/ECLRefinement.vue";
import { addConceptToGroup, getIsRoleGroup, updateBooleans, updateFocusConcepts } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";
import ExpressionConstraint from "@/components/directory/topbar/eclSearch/builder/ExpressionConstraint.vue";
import RoleGroup from "@/components/directory/topbar/eclSearch/builder/RoleGroup.vue";
import { IM } from "@/vocabulary";

interface Props {
  index: number;
  parentOperator?: string;
  rootBool?: boolean;
  activeInputId?: string;
}
const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const parent = defineModel<Match | undefined>("parent") as Ref<Match | undefined>;
const isRoleGroup = computed(() => getIsRoleGroup(match.value.where));
const group: Ref<number[]> = ref([]);
const emit = defineEmits(["updateBool", "rationalise", "activateInput"]);
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const operators = ["and", "or", "not"] as const;
const { onDragEnd, onDragStart, onDrop, onDragOver } = setupECLBuilderActions(wasDraggedAndDropped);
const hoverAddConcept = ref(false);
const hoverAddRefinement = ref(false);
const focusConcepts = computed(() => {
  return updateFocusConcepts(match.value);
});
const propertyTreeRoots: Ref<string[]> = ref(["http://snomed.info/sct#410662002"]);
const imQueryForPropertySearch: Ref<QueryRequest> = ref({} as QueryRequest);

onMounted(() => {});
function updateOperator(val: string) {
  updateFocusConcepts(match.value);
  emit("updateBool", props.parentOperator, val);
}
function onRationalise() {
  emit("rationalise");
}

function updateBool(oldOperator: Bool | string, newOperator: Bool | string) {
  updateBooleans(match.value!, oldOperator as Bool, newOperator as Bool, props.index, group.value);
  if (newOperator === props.parentOperator) {
    emit("rationalise");
  }
}

function mouseover(event: any) {
  event.stopPropagation();
}

function mouseout(event: any) {
  event.stopPropagation();
}

function addRefinement() {
  const where = { uuid: v4(), descendantsOrSelfOf: true, is: [{ descendantsOrSelfOf: true }] } as Where;
  if (match.value.where) {
    if (match.value.where.and) {
      match.value.where.and.push(where);
    } else if (match.value.where.or) match.value.where.or.push(where);
    else {
      const boolWhere = { uuid: v4() } as Where;
      boolWhere.and = [match.value.where];
      boolWhere.and.push(where);
      match.value.where = boolWhere;
    }
  } else match.value.where = where;
}

function addConcept() {
  addConceptToGroup(match.value);
}
</script>

<style scoped>
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

.refinement {
  flex: 1 1 auto;
  min-width: 0;
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
</style>
