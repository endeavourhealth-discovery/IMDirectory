<template>
  <div class="boolean-edit">
    <div>
      <Select
        :class="'operator-selector'"
        :modelValue="operator"
        :options="getBooleanOptions(clauseType, index, false, true, parentOperator as Bool)"
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
    <div v-if="!rootBool && parent" class="sub-group-button flex items-center">
      <Button
        type="button"
        icon="fa-solid fa-plus"
        label="Remove boolean subgroup"
        data-testid="add-bool-concept-button"
        :severity="'secondary'"
        @click.stop="onRemoveSubgroup()"
      />
    </div>
    <div v-if="clauseType === 'Where' && boolGroup">
      <RoleGroup v-if="rootBool && boolGroup!.length > 1" v-model:where="clause as Where" v-model:isRoleGroup="isRoleGroup" />
    </div>
    <div v-if="group.length > 1" class="sub-group-button flex items-center">
      <Button type="button" icon="fa-solid fa-plus" label="Create boolean subgroup" data-testid="add-bool-concept-button" @click.stop="onCreateSubgroup()" />
    </div>
    <div v-if="boolGroup!.length > 2" class="check-help">
      <i class="fas fa-info-circle text-blue-500" />
      <span> (click check boxes to build subgroup)</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { createNewBoolGroup, getBooleanOptions, getIsRoleGroup, removeSubgroup, addRefinementToGroup } from "@/helpers/buildQuery";
import { Clause, Match, Where, Bool } from "@/interfaces/AutoGen";
import { computed, inject, onMounted, ref, Ref, watch } from "vue";
import { defineComponent } from "vue";
import RoleGroup from "@/components/directory/topbar/eclSearch/builder/RoleGroup.vue";

interface Props {
  index: number;
  rootBool: boolean;
  parentOperator?: Bool;
  parentType: string;
  clauseType: string;
  isInAttributeGroup?: boolean;
  operator: Bool;
}

const props = defineProps<Props>();
const clause = defineModel<Clause<Match | Where>>("clause", { required: true });
const parent = defineModel<Clause<Match | Where>>("parent", { default: {} });
const group = defineModel<number[]>("group", { default: [] });
const emit = defineEmits(["rationalise"]);
const operator = computed(() => (clause.value.and ? Bool.and : clause.value.or ? Bool.or : undefined));
const boolGroup = computed(() => (clause.value.and ? clause.value.and : clause.value.or ? clause.value.or : undefined));
const wasDraggedAndDropped = inject("wasDraggedAndDropped") as Ref<boolean>;
const hover = ref();
const checkUngroup: Ref<boolean> = ref(false);

const isRoleGroup = computed(() => getIsRoleGroup(clause.value));

function onRemoveSubgroup() {
  removeSubgroup(clause.value, parent.value as Where, props.index);
  group.value = [];
}
function onRationalise() {
  emit("rationalise");
}
function onCreateSubgroup() {
  createNewBoolGroup(clause.value, group.value);
  group.value = [];
}

function updateOperator(val: string) {
  if (val === "or" && clause.value.and) {
    clause.value.or = clause.value.and;
    delete clause.value.and;
  } else if (val === "and" && clause.value.or) {
    clause.value.and = clause.value.or;
    delete clause.value.or;
  }
}
function mouseover(event: any) {
  event.stopPropagation();
  hover.value = true;
}

function mouseout(event: any) {
  event.stopPropagation();
  hover.value = false;
}
</script>
<style scoped>
.boolean-edit {
  display: flex;
  width: 99%;
  flex-direction: row;

  margin: 0.5rem;
  font-size: 1rem;
}

.check-help {
  margin-left: 5rem;
  margin-top: 0.5rem;
}
.sub-group-button {
  padding-left: 4rem;
  padding-right: 0.5rem;
}

.group-checkbox {
  padding-right: 0.5rem;
}
.group-checkbox label {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: normal;
}

.dropdown-labels {
  min-height: 1rem;
  font-size: 1rem;
}

.check-ungroup {
  margin-left: 1rem;
  margin-right: 1rem;
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
</style>
