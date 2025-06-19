<template>
  <div class="nested-ecl-match">
    <div v-if="match.instanceOf">
      <div class="instance-of">
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
        <span>
          <div v-if="parent && (parent[parentOperator as keyof typeof parent] as Match[]).length > 2" class="group-checkbox">
            <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="parentGroup" data-testid="group-checkbox" />
            <label :for="'group' + index">Select</label>
          </div>
        </span>
        <span class="concept-selector-container">
          <ConceptSelector
            v-model:node="match.instanceOf[0]"
            :parent="parent"
            :activeInputId="activeInputId"
            @activateInput="emit('activateInput', $event)"
            @update-match="updateMatch"
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
            @click.stop="deleteMatch"
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
      <div v-if="match.where">
        <span>With these attributes:</span>
        <RoleGroup v-model:where="match.where" v-model:isRoleGroup="isRoleGroup" />
        <ECLRefinement
          v-model:where="match.where"
          v-model:parent="match"
          :index="index"
          :rootBool="true"
          :isInAttributeGroup="isRoleGroup"
          :focusConcepts="focusConcepts"
          :propertyTreeRoots="propertyTreeRoots"
          :imQueryForPropertySearch="imQueryForPropertySearch"
          :parentType="'match'"
          class="refinement"
          @rationalise="onRationalise"
        />
      </div>
    </div>
    <div v-else>
      <ECLBoolQuery v-model:match="match" v-model:parent="parent" :index="index" :rootBool="rootBool" @rationalise="emit('rationalise')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref, ref, computed, watch } from "vue";
import ConceptSelector from "./ConceptSelector.vue";
import Button from "primevue/button";
import setupECLBuilderActions from "@/composables/setupECLBuilderActions";
import { Bool, Match, Where, TTIriRef, QueryRequest } from "@/interfaces/AutoGen";
import ECLRefinement from "@/components/directory/topbar/eclSearch/builder/ECLRefinement.vue";
import { getBooleanOptions, getIsRoleGroup, isBoolWhere, manageRoleGroup, updateFocusConcepts } from "@/helpers/IMQueryBuilder";
import { v4 } from "uuid";
import ECLBoolQuery from "@/components/directory/topbar/eclSearch/builder/ECLBoolQuery.vue";
import RoleGroup from "@/components/directory/topbar/eclSearch/builder/RoleGroup.vue";

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
const { onDragEnd, onDragStart, onDrop, onDragOver } = setupECLBuilderActions(wasDraggedAndDropped);
const hoverAddRefinement = ref(false);
const hoverDeleteConcept = ref(false);
const isRoleGroup = computed(() => getIsRoleGroup(match.value.where));
const focusConcepts = computed(() => {
  return updateFocusConcepts(match.value);
});
const propertyTreeRoots: Ref<string[]> = ref(["http://snomed.info/sct#410662002"]);
const imQueryForPropertySearch: Ref<QueryRequest> = ref({} as QueryRequest);
onMounted(() => {});

watch(isRoleGroup, (newValue, oldValue) => {
  if (newValue != oldValue) {
    if (match.value.where) {
      manageRoleGroup(match.value.where, newValue);
    }
  }
});

function updateOperator(val: string) {
  updateFocusConcepts(match.value);
  emit("updateBool", props.parentOperator, val);
}

function updateMatch() {
  updateFocusConcepts(match.value);
}

function onRationalise() {
  emit("rationalise");
}

function deleteMatch() {
  if (!props.parentOperator) {
    delete match.value.instanceOf;
    return;
  }
  if (parent.value) {
    const operator = props.parentOperator as keyof Match;
    if (parent.value[operator]) {
      (parent.value[operator] as Match[]).splice(props.index, 1);
    }
    updateFocusConcepts(parent.value);
  }
}

function addRefinement() {
  const where = { uuid: v4(), descendantsOrSelfOf: true, is: [{ descendantsOrSelfOf: true }] } as Where;
  if (match.value.where) {
    if (match.value.where.and) match.value.where.and.push(where);
    else if (match.value.where.or) match.value.where.or.push(where);
    else {
      const boolWhere = { uuid: v4() } as Where;
      boolWhere.and = [match.value.where];
      boolWhere.and.push(where);
      match.value.where = boolWhere;
    }
  } else match.value.where = where;
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

.instance-of {
  display: flex;
  flex: 1;
  gap: 0.5rem;
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
