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
        <div v-for="(rg, rgIndex) in roleGroups" class="roleGroup concept-colours">
          <div :class="invalidGroups.find(o => o.groupIndex === rgIndex) && invalid && showValidation ? 'error-message' : ''">
            <span v-if="invalidGroups.find(o => o.groupIndex === rgIndex) && invalid && showValidation" class="error-message">{{
              invalidGroups.find(o => o.groupIndex === rgIndex).errorMessage
            }}</span>
            <div class="roleGroupTitle">
              <label>Role Group {{ rgIndex }}</label>
              <Button icon="fa-solid fa-trash" severity="danger" class="p-button-rounded p-button-text" @click="deleteRoleGroup(rgIndex)" size="small" />
            </div>
            <div v-for="(row, rIndex) in rg">
              <div v-if="!isObjectHasKeys(row.key, ['@id']) || row.key['@id'] != IM.GROUP_NUMBER" class="roleGroupRow concept-colours">
                <AutocompleteSearchBar class="roleProperty" v-model:selected="row.key" :im-query="request" :search-placeholder="'Search properties'" />
                <span style="width: 1rem; text-align: center">:</span>
                <AutocompleteSearchBar class="roleProperty" v-model:selected="row.value" :im-query="valueRequest" :search-placeholder="'Search quantifiers'" />
                <Button icon="fa-solid fa-trash" severity="danger" class="p-button-rounded p-button-text" @click="deleteRole(rg, rIndex)" />
              </div>
            </div>
            <div class="buttonGroup role-button">
              <Button icon="fa-solid fa-plus" label="Add role" severity="success" class="p-button" @click="addRole(rg)" />
            </div>
          </div>
        </div>
        <div class="buttonGroup">
          <Button icon="fa-solid fa-plus" label="Add Group" severity="success" class="p-button" @click="addRoleGroup" :disabled="loading" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EntityAutoComplete from "@/components/editor/shapeComponents/EntityAutoComplete.vue";
import { SearchOptions } from "@im-library/interfaces";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";

defineComponent({
  components: { EntityAutoComplete }
});
</script>

<script setup lang="ts">
import { EntityService, QueryService } from "@/services";
import { EditorMode, ToastSeverity } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { PropertyShape, QueryRequest, SearchResponse, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDFS, SNOMED } from "@im-library/vocabulary";
import _, { isArray } from "lodash-es";
import { Ref, onMounted, ref, inject, watch, ComputedRef, computed } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { useToast } from "primevue/usetoast";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}

const toast = useToast();
const props = defineProps<Props>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
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

const key = props.shape.path["@id"];

onMounted(async () => {
  await processProps();
});

watch(
  () => _.cloneDeep(roleGroups.value),
  async () => {
    await update();
    if (updateValidity) {
      await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path["@id"], invalid, validationErrorMessage);
    }
  }
);

function addRoleGroup() {
  roleGroups.value.push([{ key: { "@id": IM.GROUP_NUMBER, name: "Group Number" }, value: roleGroups.value.length }]);
  update();
}

function deleteRoleGroup(index: number) {
  roleGroups.value.splice(index, 1);
  for (let i = index; i < roleGroups.value.length; i++) {
    if (roleGroups.value[i][0].key["@id"] === IM.GROUP_NUMBER) {
      roleGroups.value[i][0].value = roleGroups.value[i][0].value - 1;
    }
  }
  update();
}

function addRole(rg: any) {
  rg.push({ key: { "@id": "", name: "" }, value: { "@id": "", name: "" } });
  update();
}

function deleteRole(rg: any, index: number) {
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

async function processRole(newData: any[], role: any) {
  const grp: any[] = [];
  newData.push(grp);
  if (isObjectHasKeys(role, [IM.GROUP_NUMBER])) {
    for (const [key, value] of Object.entries(role)) {
      if (key !== IM.GROUP_NUMBER && isArray(value) && value.every(item => isTTIriRef(item))) {
        const keyName = await EntityService.getPartialEntity(key, [RDFS.LABEL]);
        grp.push({ key: { "@id": key, name: keyName[RDFS.LABEL] ?? "" }, value: value[0] });
      }
    }
  }
}

const request: QueryRequest = {
  query: {
    activeOnly: true,
    match: [
      {
        instanceOf: {
          "@id": SNOMED.ATTRIBUTE
        }
      }
    ]
  }
};

const valueRequest: QueryRequest = {
  query: {
    activeOnly: true,
    match: [
      {
        where: [
          {
            "@id": IM.HAS_SCHEME,
            is: [{ "@id": SNOMED.NAMESPACE }, { "@id": IM.NAMESPACE }]
          }
        ]
      }
    ]
  }
};

async function propertyDrop(event: any, object: any) {
  const data = event.dataTransfer.getData("conceptIri");
  if (data) {
    const conceptIri = JSON.parse(data);
    const conceptName = (await EntityService.getPartialEntity(conceptIri, [RDFS.LABEL]))[RDFS.LABEL];

    if (await isValidProperty(conceptIri)) {
      object.key = { "@id": conceptIri, name: conceptName } as TTIriRef;
    } else {
      toast.add({
        severity: ToastSeverity.WARN,
        summary: "Failed to set property",
        detail: "'" + conceptName + "' is not a valid role group property",
        life: 3000
      });
    }
  }
}

async function isValidProperty(iri: string): Promise<boolean> {
  const filterOptions: SearchOptions = {
    isA: [{ "@id": SNOMED.ATTRIBUTE }],
    textSearch: iri,
    schemes: [{ "@id": SNOMED.NAMESPACE }, { "@id": IM.NAMESPACE }],
    page: { pageNumber: 1, pageSize: 1 }
  } as SearchOptions;
  const imQuery = buildIMQueryFromFilters(filterOptions);
  const results = await QueryService.queryIMSearch(imQuery);
  if (results.entities) return results.entities.length > 0;
  return false;
}

async function valueDrop(event: any, object: any) {
  const data = event.dataTransfer.getData("conceptIri");
  if (data) {
    const conceptIri = JSON.parse(data);
    const conceptName = (await EntityService.getPartialEntity(conceptIri, [RDFS.LABEL]))[RDFS.LABEL];

    if (await isValidValue(conceptIri)) {
      object.value = { "@id": conceptIri, name: conceptName } as TTIriRef;
    } else {
      toast.add({
        severity: ToastSeverity.WARN,
        summary: "Failed to set value",
        detail: "'" + conceptName + "' is not a valid role group value",
        life: 3000
      });
    }
  }
}

async function isValidValue(iri: string): Promise<boolean> {
  const filterOptions: SearchOptions = {
    textSearch: iri,
    schemes: [{ "@id": SNOMED.NAMESPACE }, { "@id": IM.NAMESPACE }],
    page: { pageNumber: 1, pageSize: 1 }
  } as SearchOptions;
  const imQuery = buildIMQueryFromFilters(filterOptions);
  const results = await QueryService.queryIMSearch(imQuery);
  if (results.entities) return results.entities.length > 0;
  return false;
}

async function update() {
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

function isGroupValid(group: any[]): boolean {
  invalid.value = false;
  if (group.length == 0 || (group.length == 1 && group[0]?.key?.["@id"] == IM.GROUP_NUMBER)) {
    specificValidationErrorMessage.value = "Role groups can not be empty.";
    return false;
  }
  for (const pair of group) {
    if (!pair.key) {
      pair["key"] = { "@id": "", name: "" };
    }
    if (!pair.value && pair.value !== 0) {
      pair["value"] = { "@id": "", name: "" };
    }
    if (pair.key["@id"] != IM.GROUP_NUMBER) {
      if (!isObjectHasKeys(pair.key, ["iri"]) && (!pair?.key?.["@id"] || pair.key["@id"] == "")) {
        specificValidationErrorMessage.value = "Missing role property.";
        invalid.value = true;
        return false;
      }
      if (!isObjectHasKeys(pair.value, ["iri"]) && (!pair?.value?.["@id"] || "" === pair.value["@id"] || null === pair.value["@id"])) {
        specificValidationErrorMessage.value = "Missing role quantifier.";
        invalid.value = true;
        return false;
      }
    }
  }

  return true;
}

function updateEntity() {
  const groups: any = {};
  groups[IM.ROLE_GROUP] = [];

  for (let i = 0; i < roleGroups.value.length; i++) {
    const group: any = {};
    group[IM.GROUP_NUMBER] = i;
    groups[IM.ROLE_GROUP].push(group);
    for (const pair of roleGroups.value[i]) {
      if (isObjectHasKeys(pair.key, ["iri"]) && isObjectHasKeys(pair.value, ["iri"])) {
        group[pair.key["iri"]] = { "@id": pair.value["iri"], name: pair.value["name"] };
      } else if (isObjectHasKeys(pair.key, ["iri"]) && !isObjectHasKeys(pair.value, ["iri"])) {
        group[pair.key["iri"]] = pair.value;
      } else if (!isObjectHasKeys(pair.key, ["iri"]) && isObjectHasKeys(pair.value, ["iri"])) {
        group[pair.key["@id"]] = { "@id": pair.value["iri"], name: pair.value["name"] };
      } else if (isObjectHasKeys(pair.key, ["@id"])) {
        group[pair.key["@id"]] = pair.value;
      }
    }
  }
  if (!isArrayHasLength(groups[IM.ROLE_GROUP]) && deleteEntityKey) deleteEntityKey(key);
  else if (entityUpdate) entityUpdate(groups);
}
</script>

<style scoped>
.vertical-layout-container {
  margin: 0;
}

span.error-message {
  color: red;
}

div.error-message {
  border: 1px solid red;
  border-radius: 3px;
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
  border-radius: 3px;
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

.roleVal {
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
  color: var(--red-500);
}

.role-button {
  margin: 0;
}

.error-message {
  padding: 0.25rem;
}
</style>
