<template>
  <div id="role-group-builder">
    <div class="title-bar">
      <h2 v-if="shape.showTitle" class="title">{{ shape.name }}</h2>
      <h2 v-if="showRequired" class="required">*</h2>
    </div>
    <div :class="invalid && showValidation ? 'error-message' : ''">
      <span v-if="invalid && showValidation" class="error-message">{{ validationErrorMessage }}</span>
      <div v-if="loading" class="loading-container">
        <ProgressSpinner strokeWidth="8" />
      </div>
      <div v-else class="children-container concept-colours">
        <div v-for="(rg, rgIndex) in roleGroups" class="roleGroup concept-colours" v-bind:key="rgIndex">
          <div :class="invalidGroups.find(o => o.groupIndex === rgIndex) && invalid && showValidation ? 'error-message' : ''">
            <span v-if="invalidGroups.find(o => o.groupIndex === rgIndex) && invalid && showValidation" class="error-message">{{
              invalidGroups.find(o => o.groupIndex === rgIndex).errorMessage
            }}</span>
            <div class="roleGroupTitle">
              <label>Role Group {{ rgIndex }}</label>
              <Button class="p-button-danger m-2" icon="fa-solid fa-trash" severity="danger" size="small" @click="deleteRoleGroup(rgIndex)" />
            </div>
            <div v-for="(row, rIndex) in rg" v-bind:key="rIndex">
              <div v-if="!isObjectHasKeys(row.key, ['iri']) || row.key.iri != IM.GROUP_NUMBER" class="roleGroupRow concept-colours">
                <AutocompleteSearchBar v-model:selected="row.key" :im-query="request" :search-placeholder="'Search properties'" class="roleProperty" />
                <span style="width: 1rem; text-align: center">:</span>
                <AutocompleteSearchBar v-model:selected="row.value" :im-query="valueRequest" :search-placeholder="'Search quantifiers'" class="roleProperty" />
                <Button class="p-button-danger m-2" icon="fa-solid fa-trash" severity="danger" @click="deleteRole(rg, rIndex)" />
              </div>
            </div>
            <div class="buttonGroup role-button">
              <Button class="p-button" icon="fa-solid fa-plus" label="Add role" severity="success" @click="addRole(rg)" />
            </div>
          </div>
        </div>
        <div class="buttonGroup">
          <Button :disabled="loading" class="p-button" icon="fa-solid fa-plus" label="Add Group" severity="success" @click="addRoleGroup" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { EntityService } from "@/services";
import { EditorMode } from "@/enums";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { isTTIriRef } from "@/helpers/TypeGuards";
import { PropertyShape, QueryRequest } from "@/interfaces/AutoGen";
import { IM, RDFS, SNOMED } from "@/vocabulary";
import { cloneDeep, isArray } from "lodash-es";
import { Ref, onMounted, ref, inject, watch, ComputedRef, computed } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";

const props = defineProps<{
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}>();

interface Role {
  key: { iri: string; name: string };
  value: { iri: string; name: string };
}
const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)!.editorEntity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)!.valueVariableMap;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
      if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      showValidation.value = true;
    }
  });
}

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

const roleGroups: Ref<any[][]> = ref([]);
const specificValidationErrorMessage: Ref<string | undefined> = ref();
const validationErrorMessage: Ref<string | undefined> = ref();
const invalid = ref(false);
const invalidGroups: Ref<any[]> = ref([]);
const showValidation = ref(false);
const loading = ref(true);

const key = props.shape.path.iri;

onMounted(async () => {
  await processProps();
});

watch(
  () => cloneDeep(roleGroups.value),
  async () => {
    await update();
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path.iri, invalid, validationErrorMessage);
    }
  }
);

function addRoleGroup() {
  roleGroups.value.push([{ key: { iri: IM.GROUP_NUMBER, name: "Group Number" }, value: roleGroups.value.length }]);
  update();
}

function deleteRoleGroup(index: number) {
  roleGroups.value.splice(index, 1);
  for (const rg in roleGroups.value) {
    if (roleGroups.value[rg][0].key.iri === IM.GROUP_NUMBER && parseInt(rg) <= index) {
      roleGroups.value[rg][0].value = roleGroups.value[rg][0].value - 1;
    }
  }
  update();
}

function addRole(rg: Role[]) {
  rg.push({ key: { iri: "", name: "" }, value: { iri: "", name: "" } });
  update();
}

function deleteRole(rg: Role[], index: number) {
  rg.splice(index, 1);
  update();
}

async function processProps() {
  loading.value = true;
  const newData: any[] = [];
  if (props.value && isArrayHasLength(props.value)) {
    for (const role of props.value) {
      await processRole(newData, role);
    }
  }
  roleGroups.value = newData;
  loading.value = false;
}

async function processRole(newData: any[], role: Role) {
  const grp: any[] = [];
  newData.push(grp);
  if (isObjectHasKeys(role, [IM.GROUP_NUMBER])) {
    for (const [key, value] of Object.entries(role)) {
      if (key !== IM.GROUP_NUMBER && isArray(value) && value.every(item => isTTIriRef(item))) {
        const keyName = await EntityService.getPartialEntity(key, [RDFS.LABEL]);
        grp.push({ key: { iri: key, name: keyName[RDFS.LABEL] ?? "" }, value: value[0] });
      }
    }
  }
}

const request: QueryRequest = {
  query: {
    activeOnly: true,
    instanceOf: [
      {
        iri: SNOMED.ATTRIBUTE,
        descendantsOrSelfOf: true
      }
    ]
  }
};

const valueRequest: QueryRequest = {
  query: {
    activeOnly: true,
    where: {
      iri: IM.HAS_SCHEME,
      is: [{ iri: SNOMED.NAMESPACE }, { iri: IM.NAMESPACE }]
    }
  }
};

function update() {
  validateEntity();
  updateEntity();
}

function validateEntity() {
  specificValidationErrorMessage.value = undefined;
  invalidGroups.value = [];
  roleGroups.value.forEach((group, index) => {
    if (!isGroupValid(group)) {
      invalidGroups.value.push({ groupIndex: index, errorMessage: specificValidationErrorMessage.value });
    }
  });
}

function isGroupValid(group: Role[]): boolean {
  invalid.value = false;
  if (group.length == 0 || (group.length == 1 && group[0]?.key?.iri == IM.GROUP_NUMBER)) {
    specificValidationErrorMessage.value = "Role groups can not be empty.";
    return false;
  }
  for (const pair of group) {
    if (!pair.key) {
      pair.key = { iri: "", name: "" };
    }
    if (!pair.value && pair.value !== 0) {
      pair.value = { iri: "", name: "" };
    }
    if (pair.key.iri != IM.GROUP_NUMBER) {
      if (!isObjectHasKeys(pair.key, ["iri"]) && (!pair?.key?.iri || pair.key.iri == "")) {
        specificValidationErrorMessage.value = "Missing role property.";
        invalid.value = true;
        return false;
      }
      if (!isObjectHasKeys(pair.value, ["iri"]) && (!pair?.value?.iri || "" === pair.value.iri || null === pair.value.iri)) {
        specificValidationErrorMessage.value = "Missing role quantifier.";
        invalid.value = true;
        return false;
      }
    }
  }

  return true;
}

function updateEntity() {
  const groups: TTEntity = {};
  groups[IM.ROLE_GROUP] = [];

  for (const rg in roleGroups.value) {
    const group: any = {};
    group[IM.GROUP_NUMBER] = rg;
    groups[IM.ROLE_GROUP].push(group);
    for (const pair of roleGroups.value[rg]) {
      if (isObjectHasKeys(pair.key, ["iri"]) && isObjectHasKeys(pair.value, ["iri"])) {
        group[pair.key.iri] = { iri: pair.value.iri, name: pair.value.name };
      } else if (isObjectHasKeys(pair.key, ["iri"]) && !isObjectHasKeys(pair.value, ["iri"])) {
        group[pair.key.iri] = pair.value;
      } else if (!isObjectHasKeys(pair.key, ["iri"]) && isObjectHasKeys(pair.value, ["iri"])) {
        group[pair.key.iri] = { iri: pair.value.iri, name: pair.value.name };
      } else if (isObjectHasKeys(pair.key, ["iri"])) {
        group[pair.key.iri] = pair.value;
      }
    }
  }
  if (!isArrayHasLength(groups[IM.ROLE_GROUP]) && deleteEntityKey) deleteEntityKey(key);
  else if (entityUpdate) entityUpdate(groups);
}
</script>

<style scoped>
span.error-message {
  color: red;
}

div.error-message {
  border: 1px solid red;
  border-radius: var(--p-textarea-border-radius);
}

#role-group-builder h2 {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  overflow: auto;
}

.children-container {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
  padding: 0.5rem;
}

.roleGroup {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem 0.5rem 0.5rem;
}

.roleGroupRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem;
}

.concept-colours {
  border: #d2b33f30 1px solid;
  border-radius: var(--p-textarea-border-radius);
  background-color: #d2b33f10;
}

.concept-colours:hover {
  border: #d2b33f 1px solid;
}

.roleGroupTitle {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 0.5rem 0 0.5rem;
}

.roleProperty {
  display: flex;
  flex: 1;
}

.p-button {
  margin-right: 1rem;
}

.title-bar {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.25rem;
}

.required {
  color: var(--p-red-500);
}

.role-button {
  margin: 0;
}

.error-message {
  padding: 0.25rem;
}
</style>
