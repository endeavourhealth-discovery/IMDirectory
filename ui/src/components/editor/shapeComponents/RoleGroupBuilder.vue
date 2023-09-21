<template>
  <div id="role-group-builder">
    <h2 class="title">Role Groups</h2>
    <div :class="validationErrorMessage ? 'error-message' : ''">
      <span v-if="validationErrorMessage" class="error-message">{{ validationErrorMessage }}</span>
      <div v-if="loading" class="loading-container">
        <ProgressSpinner strokeWidth="8" />
      </div>
      <div v-else class="children-container">
        <div v-for="(rg, rgIndex) in roleGroups" class="roleGroup">
          <div class="roleGroupRow">
            <label>Role Group {{ rgIndex }}</label>
            <Button icon="pi pi-trash" severity="danger" class="p-button-rounded p-button-text" @click="deleteRoleGroup(rgIndex)" size="small" />
          </div>
          <div v-for="(row, rIndex) in rg">
            <div v-if="row.key['@id'] != IM.GROUP_NUMBER" class="roleGroupRow">
              <AutoComplete
                class="propertyPath"
                :dropdown="true"
                dropdownMode="current"
                optionLabel="name"
                placeholder="Select property"
                v-model="row.key"
                :suggestions="propertySuggestions"
                @complete="searchProperties"
                @drop="propertyDrop($event, row)"
                @itemSelect="update"
                @dragover.prevent
                @dragenter.prevent
              ></AutoComplete>
              <span style="width: 1rem; text-align: center">:</span>
              <AutoComplete
                class="roleVal"
                :dropdown="true"
                dropdownMode="current"
                optionLabel="name"
                placeholder="Select quantifier"
                v-model="row.value"
                :suggestions="valueSuggestions"
                @complete="searchValues"
                @drop="valueDrop($event, row)"
                @itemSelect="update"
                @dragover.prevent
                @dragenter.prevent
              ></AutoComplete>
              <Button icon="pi pi-trash" severity="danger" class="p-button-rounded p-button-text" @click="deleteRole(rg, rIndex)" />
            </div>
          </div>
          <div class="buttonGroup">
            <Button icon="pi pi-plus" label="Add role" severity="success" class="p-button" @click="addRole(rg)" />
          </div>
        </div>
      </div>
      <div class="buttonGroup">
        <Button icon="pi pi-plus" label="Add Group" severity="success" class="p-button" @click="addRoleGroup" :disabled="loading" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EntityAutoComplete from "@/components/editor/shapeComponents/EntityAutoComplete.vue";

defineComponent({
  components: { EntityAutoComplete }
});
</script>

<script setup lang="ts">
import { EntityService, QueryService } from "@/services";
import { EditorMode, ToastSeverity } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { Argument, PropertyShape, QueryRequest, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDFS, SNOMED } from "@im-library/vocabulary";
import { isArray } from "lodash";
import { Ref, onMounted, ref, inject, watch } from "vue";
import { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { useToast } from "primevue/usetoast";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}

const toast = useToast();
const props = defineProps<Props>();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
if (forceValidation) {
  watch(forceValidation, () => {
    validateEntity();
  });
}

const roleGroups: Ref<any[][]> = ref([]);
const propertySuggestions: Ref<TTIriRef[]> = ref([]);
const valueSuggestions: Ref<TTIriRef[]> = ref([]);
const validationErrorMessage: Ref<string | undefined> = ref();
const loading = ref(true);

onMounted(async () => {
  await processProps();
});

function addRoleGroup() {
  roleGroups.value.push([{ key: { "@id": IM.GROUP_NUMBER, name: "Group Number" }, value: roleGroups.value.length }]);
}

function deleteRoleGroup(index: number) {
  roleGroups.value.splice(index, 1);
}

function addRole(rg: any) {
  rg.push({ key: { "@id": null, name: "" }, value: { "@id": null, name: "" } });
}

function deleteRole(rg: any, index: number) {
  rg.splice(index, 1);
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

async function searchProperties(event: AutoCompleteCompleteEvent) {
  const request: QueryRequest = {
    textSearch: event.query,
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
  const results: SearchResultSummary[] = await QueryService.queryIMSearch(request);
  propertySuggestions.value = results.map(r => ({ "@id": r.iri, name: r.name } as TTIriRef));
}

async function searchValues(event: AutoCompleteCompleteEvent) {
  const request: QueryRequest = {
    textSearch: event.query,
    query: {
      activeOnly: true,
      match: [
        {
          property: [
            {
              "@id": IM.SCHEME,
              is: [{ "@id": SNOMED.NAMESPACE }, { "@id": IM.NAMESPACE }]
            }
          ]
        }
      ]
    }
  };
  const results: SearchResultSummary[] = await QueryService.queryIMSearch(request);
  valueSuggestions.value = results.map(r => ({ "@id": r.iri, name: r.name } as TTIriRef));
}

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
  const request: QueryRequest = {
    argument: [{ parameter: "subject", valueIri: { "@id": iri } } as Argument],
    query: {
      match: [
        {
          instanceOf: {
            parameter: "subject"
          },
          property: [
            {
              "@id": IM.IS_A,
              is: [{ "@id": SNOMED.ATTRIBUTE }]
            }
          ]
        }
      ]
    }
  };

  const results: any = await QueryService.queryIM(request);

  return results?.entities && results.entities.length > 0;
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
  const request: QueryRequest = {
    argument: [{ parameter: "subject", valueIri: { "@id": iri } } as Argument],
    query: {
      match: [
        {
          instanceOf: {
            parameter: "subject"
          },
          property: [
            {
              "@id": IM.SCHEME,
              is: [{ "@id": SNOMED.NAMESPACE }, { "@id": IM.NAMESPACE }]
            }
          ]
        }
      ]
    }
  };

  const results: any = await QueryService.queryIM(request);

  return results?.entities && results.entities.length > 0;
}

async function update() {
  validateEntity();

  if (!validationErrorMessage.value) updateEntity();
}

function validateEntity() {
  validationErrorMessage.value = undefined;

  for (let group of roleGroups.value) {
    if (!isGroupValid(group)) return;
  }
}

function isGroupValid(group: any[]): boolean {
  if (group.length == 0 || (group.length == 1 && group[0].key["@id"] == IM.GROUP_NUMBER)) {
    validationErrorMessage.value = "Role groups can not be empty";
    return false;
  }
  for (const pair of group) {
    if (pair.key["@id"] != IM.GROUP_NUMBER) {
      if (!pair?.key?.["@id"] || pair.key["@id"] == "") {
        validationErrorMessage.value = "Missing role property";
        return false;
      }

      if (!pair?.value?.["@id"] || pair.value["@id"] == "") {
        validationErrorMessage.value = "Missing role quantifier";
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
      group[pair.key["@id"]] = pair.value;
    }
  }

  if (entityUpdate) entityUpdate(groups);
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
  border-radius: 3px;
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
}

.roleGroup {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.roleGroupRow {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.propertyPath {
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
</style>
