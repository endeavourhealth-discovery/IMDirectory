<template>
  <div v-if="boolGroup">
    <div v-if="canCheck" class="group-checkbox">
      <Checkbox
        :inputId="'group' + index"
        name="Group"
        binary
        v-model="subgroupCheck"
        data-testid="group-checkbox"
        @update:modelValue="onCheckGroupChange"
        v-tooltip="'Select to build boolean subgroup'"
      />
    </div>
    <BooleanEditor
      v-model:clause="where"
      v-model:parent="parent"
      :parentType="'Match'"
      :index="index"
      v-model:group="group"
      :parentOperator="parentOperator as Bool"
      :operator="operator"
      :rootBool="rootBool"
      :clauseType="'Match'"
    />

    <div class="nested-where">
      <div v-for="(item, subIndex) in boolGroup" :key="item.uuid">
        <BooleanWhereEditor
          :match="match"
          v-model:where="boolGroup![subIndex]"
          v-model:parent="where"
          :index="subIndex"
          :parentIndex="index"
          :baseType="baseType"
          :rootBool="false"
          :parentOperator="operator as Bool"
          :show-delete="showDelete"
          :canCheck="boolGroup!.length > 2"
          v-model:parentGroup="group"
          @deleteWhere="onDeleteBooleanWhere(subIndex)"
          @addProperty="emit('addProperty')"
          @updateBool="updateBool"
          @updateProperty="updateProperty"
        />
      </div>
    </div>
  </div>
  <div v-else-if="where.iri" :class="where.invalid ? 'property-container-invalid' : 'property-container'">
    <span class="property-label">
      <span v-if="canCheck" class="group-checkbox">
        <Checkbox
          :inputId="'group' + index"
          name="Group"
          binary
          v-model="subgroupCheck"
          data-testid="group-checkbox"
          @update:modelValue="onCheckGroupChange"
          v-tooltip="'Select to build boolean subgroup'"
        />
      </span>
      <span>{{ pathPropertyName }}</span>
    </span>
    <div class="property-value-container">
      <div v-if="selectedWhere?.propertyType === 'class'">
        <WhereIsEditor :key="refreshCounter" v-model:property="where" :uiProperty="selectedWhere" @updateProperty="updateProperty" />
        <Popover ref="dropdown">
          <div class="flex max-h-96 max-w-96 flex-col divide-y overflow-y-auto">
            <span v-for="is of where.is" :key="getNameFromRef(is)" class="p-1">{{ getNameFromRef(is) }}</span>
          </div>
        </Popover>
      </div>
      <div v-else-if="selectedWhere?.propertyType === 'datatype'">
        <WhereValueEditor
          :key="refreshCounter"
          :ui-property="selectedWhere"
          v-model:where="where!"
          :refresh="refreshCounter"
          @updateProperty="updateProperty"
        />
      </div>
      <div class="mt-auto ml-auto flex flex-row items-end">
        <Button v-if="updated" data-testid="cancel-edit-feature-button" label="Revert" text @click="revert" />
        <Button @click.stop="deleteProperty" class="delete-button" icon="fa-solid fa-trash" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, onMounted, ref, watch } from "vue";

import { Bool } from "vue-library/enums";
import { isObjectHasKeys } from "vue-library/helpers";
import type { Match, Node, UIProperty, Where } from "vue-library/interfaces";

import { cloneDeep } from "lodash-es";
import Button from "primevue/button";

import BooleanEditor from "@/components/imquery/BooleanEditor.vue";
import BooleanMatchEditor from "@/components/imquery/BooleanMatchEditor.vue";
import { getNameFromRef } from "@/helpers/TTTransform";
import {
  checkGroupChange,
  deletePropertyFromParent,
  getBoolGroup,
  getBooleanOperator,
  getDisplayOperator,
  getPathPropertyNames,
  getTypeIriFromMatch,
  updateBooleans,
  updateFocusConcepts
} from "@/helpers/buildQuery";
import { DataModelService } from "@/services";

import WhereIsEditor from "./WhereIsEditor.vue";
import WhereValueEditor from "./WhereValueEditor.vue";

const props = withDefaults(
  defineProps<{
    showDelete?: boolean;
    match: Match;
    baseType: Node;
    index: number;
    rootBool: boolean;
    parentOperator?: Bool;
    parentIndex: number;
    canCheck?: boolean;
  }>(),
  { showDelete: true }
);

const where = defineModel<Where>("where", { default: {} });
const parent = defineModel<Where | Match>("parent", { default: {} });
const selectedWhere: Ref<UIProperty | undefined> = ref();
const parentGroup = defineModel<number[]>("parentGroup", { default: [] });
const emit = defineEmits(["updateBool", "addProperty", "deleteWhere", "updateProperty"]);
const subgroupCheck: Ref<boolean> = computed(() => parentGroup.value.includes(props.index));
const group: Ref<number[]> = ref([]);
const loading = ref(true);
const dropdown = ref();
const operator = computed(() => {
  return getBooleanOperator("Where", where.value);
});
const boolGroup = computed(() => {
  return getBoolGroup("Where", where.value);
});
const pathPropertyName = ref();
const displayOperator = computed(() => {
  return getDisplayOperator(props.parentOperator, props.index);
});
const dataModelIri: Ref<string> = ref("");
const originalWhere: Ref<Where> = ref({});
const refreshCounter: Ref<number> = ref(0);
const updated = ref(false);

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  if (where.value.iri) {
    dataModelIri.value = getTypeIriFromMatch(props.match, props.baseType);
    originalWhere.value = cloneDeep(where.value);
    if (dataModelIri.value && where!.value.iri) {
      selectedWhere.value = await DataModelService.getUIProperty(dataModelIri.value, where!.value.iri);
      if (isObjectHasKeys(selectedWhere.value, ["propertyType"]) && selectedWhere.value.propertyType === "class" && !where.value.is) where.value.is = [{}];
    }
    pathPropertyName.value = getPathPropertyNames(props.match, where.value);
  }
  loading.value = false;
}

function deleteProperty() {
  emit("deleteWhere");
}

function onCheckGroupChange(e: any) {
  checkGroupChange(e, parentGroup.value, props.index);
}

function onDeleteBooleanWhere(index: number) {
  if (where.value.and) {
    where.value.and.splice(index, 1);
    if (where.value.and.length === 1) where.value = where.value.and[0];
  } else if (where.value.or) {
    where.value.or.splice(index, 1);
    if (where.value.or.length === 1) where.value = where.value.or[0];
  }
  emit("updateProperty");
}

function updateBool(oldOperator: Bool, newOperator: Bool, index: number) {
  updateBooleans(where.value!, oldOperator, newOperator);
}

function updateProperty() {
  updated.value = true;
  emit("updateProperty");
}

function addProperty() {
  emit("addProperty");
}

function toggleDropdown(event: MouseEvent) {
  dropdown.value.toggle(event);
}

function onSaveCustomSet(newSet: Node) {
  where.value.is = [newSet];
  where.value.memberOf = true;
}
function revert() {
  where.value = originalWhere.value;
  refreshCounter.value++;
}
</script>

<style scoped>
add-button,
.delete-button {
  color: #444444; /* text */
  background-color: #f0f0f0; /* greyish default */
  border: 1px solid #ccc;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.add-button:hover,
.add-button:focus {
  background-color: #a5d6a7;
}
.delete-button:hover,
.delete-button:focus {
  background-color: red;
}
.property-container {
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  border: 0.5px solid #999999;
}

.property-container-invalid {
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  border: 0.5px solid red;
}
.property-value-container {
  display: flex;
  flex-flow: row;
  flex: 1;
  border: 0.5px solid #999999;
}

.property-display {
  padding-right: 1rem;
}
.property-label {
  background: #e0f7fa;
}
.delete-button {
  height: 100%;
  width: 2%;
  display: flex;
  align-items: center;
}

.nested-where {
  box-sizing: border-box;
  min-width: 0;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #ffffff;
  margin: 0.5rem;
  font-size: 1rem;
  background-color: #488bc210;
}

.group-checkbox {
  padding-right: 0.5rem;
}
</style>
