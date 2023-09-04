<template>
  <div id="role-group-builder">
    <h2 class="title">Role Groups</h2>
    <div class="children-container">
      <div v-for="(rg, rgIndex) in roleGroups" class="roleGroup">
        <div class="roleGroupRow">
          <label>Role Group {{ rgIndex }}</label>
          <Button icon="pi pi-trash" severity="danger" class="p-button-rounded p-button-text" @click="deleteRoleGroup(rgIndex)" size="small" />
        </div>
        <div v-for="(row, rIndex) in rg">
          <div v-if="row.key['@id'] != IM.GROUP_NUMBER" class="roleGroupRow">
            <AutoComplete
              class="roleProp"
              :dropdown="true"
              optionLabel="name"
              placeholder="Select property (key)"
              v-model="row.key"
              :suggestions="propertySuggestions"
              @complete="searchProperties"
              @drop="propertyDrop($event, row)"
              @dragover.prevent
              @dragenter.prevent
            ></AutoComplete>
            <span style="width: 1rem; text-align: center">:</span>
            <AutoComplete
              class="roleVal"
              :dropdown="true"
              optionLabel="name"
              placeholder="Select quantifier (value)"
              v-model="row.value"
              :suggestions="valueSuggestions"
              @complete="searchValues"
              @drop="valueDrop($event, row)"
              @dragover.prevent
              @dragenter.prevent
            ></AutoComplete>
            <Button icon="pi pi-trash" severity="danger" class="p-button-rounded p-button-text" @click="deleteRole(rg, rIndex)" />
          </div>
        </div>
        <div class="buttonGroup">
          <Button icon="pi pi-plus" label="Add role" severity="success" class="p-button" @click="addRole(rg)" />
          <Button icon="pi pi-trash" label="Delete group" severity="danger" class="p-button" @click="addRole(rg)" />
        </div>
      </div>
    </div>
    <div class="buttonGroup">
      <Button icon="pi pi-plus" label="Add Group" severity="success" class="p-button" @click="addRoleGroup" />
    </div>
    {{ roleGroups }}
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
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { Match, Property, PropertyShape, Query, QueryRequest, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDFS, SNOMED } from "@im-library/vocabulary";
import { isArray } from "lodash";
import { Ref, onMounted, ref } from "vue";
import { AutoCompleteCompleteEvent } from "primevue/autocomplete";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}

const props = defineProps<Props>();

const roleGroups: Ref<any[][]> = ref([]);
const loading = ref(false);
const propertySuggestions: Ref<TTIriRef[]> = ref([]);
const valueSuggestions: Ref<TTIriRef[]> = ref([]);

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
  const newData = [];
  if (props.value) {
    if (isArrayHasLength(props.value)) {
      for (const role of props.value) {
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
    }
  }
  roleGroups.value = newData;
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
    } as Query
  } as QueryRequest;
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
            } as Property
          ]
        } as Match
      ]
    } as Query
  } as QueryRequest;
  const results: SearchResultSummary[] = await QueryService.queryIMSearch(request);
  valueSuggestions.value = results.map(r => ({ "@id": r.iri, name: r.name } as TTIriRef));
}

async function propertyDrop(event: any, object: any) {
  console.log("DROP");
  console.log(event);
  const data = event.dataTransfer.getData("conceptIri");
  if (data) {
    const conceptIri = JSON.parse(data);
    const conceptName = (await EntityService.getPartialEntity(conceptIri, [RDFS.LABEL]))[RDFS.LABEL];
    const iriRef = { "@id": conceptIri, name: conceptName } as TTIriRef;
    object.key = iriRef;
  }
}

async function valueDrop(event: any, object: any) {
  console.log("DROP");
  console.log(event);
  const data = event.dataTransfer.getData("conceptIri");
  if (data) {
    const conceptIri = JSON.parse(data);
    const conceptName = (await EntityService.getPartialEntity(conceptIri, [RDFS.LABEL]))[RDFS.LABEL];
    const iriRef = { "@id": conceptIri, name: conceptName } as TTIriRef;
    object.value = iriRef;
  }
}
</script>

<style scoped>
.vertical-layout-container {
  margin: 0;
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

.roleProp {
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
