<template>
  <div v-if="loading" class="flex">
    <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
  </div>
  <div class="nested-where">
    <div v-if="hasBoolGroups(property)">
      <div v-for="operator in operators" :key="operator">
        <div v-if="property[operator]">
          <div class="match-clause">
            <BooleanEditor
              v-model:match="property"
              v-model:parentMatch="parentProperty"
              :depth="0"
              :hasSubgroups="true"
              :parentOperator="operator as Bool"
              :grandParentOperator="parentOperator as Bool"
              :clauseIndex="clauseIndex"
              v-model:parentGroup="group"
              @updateOperator="onUpdateParentOperator"
              :rootBool="false"
            />
          </div>
          <div v-for="(item, index) in property[operator]" :key="index">
            <BooleanWhereEditor
              :match="match"
              v-model:property="property[operator][index]"
              v-model:parentProperty="property"
              :clauseIndex="index"
              :baseType="baseType"
              :parentOperator="operator as Bool"
              :show-delete="showDelete"
              @deletedProperty="deletedProperty"
              @addProperty="emit('addProperty')"
              @updateBool="updateBool"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="property-value-container">
      <BooleanEditor
        v-model:match="property"
        v-model:parentMatch="parentProperty"
        :depth="0"
        :hasSubgroups="false"
        :parentOperator="parentOperator as Bool"
        :clauseIndex="clauseIndex"
        v-model:parentGroup="group"
        @updateOperator="onUpdateOperator"
        :rootBool="false"
      />

      <div class="property-display">
        <span class="property-label">{{ propertyPath }}</span>
      </div>
      <div v-if="selectedProperty?.propertyType === 'class'">
        <WhereIsEditor v-model:property="property" :uiProperty="selectedProperty" />
        <Popover ref="dropdown">
          <div class="flex max-h-96 max-w-96 flex-col divide-y overflow-y-auto">
            <span v-for="is of property.is" :key="getNameFromRef(is)" class="p-1">{{ getNameFromRef(is) }}</span>
          </div>
        </Popover>
      </div>
      <div v-else-if="selectedProperty?.propertyType === 'datatype'">
        <WhereValueEditor :ui-property="selectedProperty" v-model:property="property!" :refresh="refresh" />
      </div>
      <div class="ml-auto flex flex-row">
        <Button data-testid="cancel-edit-feature-button" label="Revert" text @click="revert" />
        <Button
          type="button"
          icon="fa-solid fa-plus"
          label="Add property"
          data-testid="add-clause-button"
          :severity="hoverAddProperty ? 'success' : 'secondary'"
          :outlined="!hoverAddProperty"
          :class="!hoverAddProperty && 'hover-button'"
          @click="addProperty"
          @mouseover="hoverAddProperty = true"
          @mouseout="hoverAddProperty = false"
        />
        <Button
          @click.stop="deleteProperty"
          :class="!hoverDeleteProperty && 'hover-button'"
          :severity="hoverDeleteProperty ? 'danger' : 'secondary'"
          :outlined="!hoverDeleteProperty"
          icon="fa-solid fa-trash"
          @mouseover="hoverDeleteProperty = true"
          @mouseout="hoverDeleteProperty = false"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Match, Node, Where, Bool } from "@/interfaces/AutoGen";
import { UIProperty } from "@/interfaces";
import { onMounted, Ref, ref, watch, computed } from "vue";
import { DataModelService } from "@/services";
import WhereValueEditor from "./WhereValueEditor.vue";
import { getNameFromRef } from "@/helpers/TTTransform";
import { deletePropertyFromParent, getDataModelFromNodeRef, hasBoolGroups, updateBooleans, updateFocusConcepts } from "@/composables/buildQuery";
import { cloneDeep } from "lodash-es";
import WhereIsEditor from "./WhereIsEditor.vue";
import Button from "primevue/button";
import { getPathName } from "@/helpers/QueryEditorMethods";
import BooleanEditor from "@/components/imquery/BooleanEditor.vue";
const props = withDefaults(
  defineProps<{
    showDelete?: boolean;
    match: Match;
    baseType: Node;
    clauseIndex: number;
    parentOperator?: Bool;
  }>(),
  { showDelete: true }
);

const selectedProperty: Ref<UIProperty | undefined> = ref();
const emit = defineEmits(["updateBool", "addProperty", "deletedProperty"]);
const expandSet: Ref<boolean> = ref(false);
const group: Ref<number[]> = ref([]);
const loading = ref(true);
const property = defineModel<Where>("property", { default: {} });
const parentProperty = defineModel<Where>("parentProperty", { default: {} });
const dropdown = ref();
const operators = ["and", "or"] as const;
const hoverAddProperty = ref(false);
const hoverDeleteProperty = ref(false);
const dataModelIri: Ref<string> = ref("");
const propertyPath = computed(() => {
  if (property.value.nodeRef) return getPathName(property.value.nodeRef, props.match) + "/" + property.value.name;
  else return property.value.name;
});
const originalProperty: Ref<Where> = ref({});
const refresh: Ref<number> = ref(0);

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  dataModelIri.value = getDataModelFromNodeRef(props.match, property.value.nodeRef, props.baseType.iri!);
  originalProperty.value = cloneDeep(property.value);
  if (dataModelIri.value && property!.value.iri) selectedProperty.value = await DataModelService.getUIProperty(dataModelIri.value, property!.value.iri);
  loading.value = false;
}

function deleteProperty() {
  deletePropertyFromParent(props.match, parentProperty.value, props.clauseIndex);
  emit("deletedProperty");
}
function deletedProperty() {
  if (property.value.and && property.value.and.length === 0) {
    emit("deletedProperty");
  } else if (property.value.or && property.value.or.length === 0) {
    emit("deletedProperty");
  }
}
function onUpdateOperator(val: string) {
  emit("updateBool", props.parentOperator, val, props.clauseIndex);
}

function onUpdateParentOperator(val: string) {
  if (property.value.and) {
    property.value.or = property.value.and;
    delete property.value.and;
  } else if (property.value.or) {
    property.value.and = property.value.or;
    delete property.value.or;
  }
}

function updateBool(oldOperator: Bool | string, newOperator: Bool | string, index: number) {
  updateBooleans(property.value!, oldOperator as Bool, newOperator as Bool, index, group.value);
}

function truncateName(name: string) {
  if (name.length > 25) return name.substring(0, 25) + "...";
  return name;
}

function addProperty() {
  emit("addProperty");
}

function toggleDropdown(event: MouseEvent) {
  dropdown.value.toggle(event);
}

function onSaveCustomSet(newSet: Node) {
  property.value.is = [newSet];
  property.value.memberOf = true;
}
function revert() {
  property.value = originalProperty.value;
  refresh.value++;
}
</script>

<style scoped>
.property-value-container {
  display: flex;
  flex-flow: row;
  flex: 1;
  border: 0.5px solid #999999;
}

.property-display {
  width: 20rem;
  display: flex;
  flex-flow: wrap;
  align-items: flex-start;
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
}
</style>
