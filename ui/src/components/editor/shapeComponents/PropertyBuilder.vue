<template>
  <div class="property-builder">
    <h2 class="title">Properties</h2>
    <div :class="validationErrorMessage ? 'error-message' : ''">
      <span v-if="validationErrorMessage" class="error-message">{{ validationErrorMessage }}</span>
      <div class="children-container">
        <div v-for="(row, index) in dmProperties" class="roleGroup">
          <AutoComplete
            class="propertyPath"
            :dropdown="true"
            dropdownMode="current"
            optionLabel="name"
            placeholder="Select property"
            v-model="row.path"
            :suggestions="pathSuggestions"
            @complete="searchPath"
            @drop="pathDrop($event, row)"
            @itemSelect="selectPath($event, row)"
            @dragover.prevent
            @dragenter.prevent
          ></AutoComplete>
          <IMFontAwesomeIcon class="icon" icon="fa-regular fa-arrow-right" />
          <AutoComplete
            class="propertyPath"
            :dropdown="true"
            dropdownMode="current"
            optionLabel="name"
            placeholder="Select range"
            v-model="row.range"
            :suggestions="rangeSuggestions"
            @complete="searchRange"
            @drop="rangeDrop($event, row)"
            @itemSelect="selectRange($event, row)"
            @dragover.prevent
            @dragenter.prevent
          ></AutoComplete>
          <ToggleButton class="toggle-button" v-model="row.required" onLabel="Required" offLabel="Required" onIcon="pi pi-check" offIcon="pi pi-times" />
          <ToggleButton class="toggle-button" v-model="row.unique" onLabel="Unique" offLabel="Unique" onIcon="pi pi-check" offIcon="pi pi-times" />
          <Button icon="pi pi-chevron-up" class="p-button-rounded p-button-text" @click="moveUp(index)" />
          <Button icon="pi pi-chevron-down" class="p-button-rounded p-button-text" @click="moveDown(index)" />
          <Button icon="pi pi-trash" severity="danger" class="p-button-rounded p-button-text" @click="deleteProperty(index)" />
          {{ row }}
        </div>
        <div class="buttonGroup">
          <Button icon="pi pi-plus" label="Add property" severity="success" class="p-button" @click="addProperty" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Property } from "@im-library/interfaces";
import { PropertyShape, QueryRequest, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { onMounted, Ref, ref, watch } from "vue";
import _ from "lodash";
import { EditorMode, ToastSeverity } from "@im-library/enums";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import { IM, RDF, SNOMED } from "@im-library/vocabulary";
import { QueryService } from "@/services";
import { useToast } from "primevue/usetoast";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: Property[];
  position?: number;
}

interface SimpleProp {
  path: TTIriRef;
  range: TTIriRef;
  required: boolean;
  unique: boolean;
}

const toast = useToast();
const props = defineProps<Props>();
const dmProperties: Ref<SimpleProp[]> = ref([]);
const loading = ref(true);
const pathSuggestions: Ref<TTIriRef[]> = ref([]);
const rangeSuggestions: Ref<TTIriRef[]> = ref([]);
const validationErrorMessage: Ref<string | undefined> = ref();

watch(
  () => _.cloneDeep(props.value),
  (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) processProps();
  }
);

onMounted(async () => {
  loading.value = true;
  processProps();
  loading.value = false;
});

function processProps() {
  const newData: any[] = [];
  if (props.value && isArrayHasLength(props.value)) {
    for (const p of props.value) {
      processProperty(newData, p);
    }
  }

  dmProperties.value = newData;
}

function processProperty(newData: any[], property: Property) {
  if (!property["http://endhealth.info/im#inheritedFrom"]) {
    newData.push({
      path: property["http://www.w3.org/ns/shacl#path"]?.[0],
      range:
        property["http://www.w3.org/ns/shacl#datatype"]?.[0] ??
        property["http://www.w3.org/ns/shacl#class"]?.[0] ??
        property["http://www.w3.org/ns/shacl#node"]?.[0],
      required: property["http://www.w3.org/ns/shacl#minCount"] != 0,
      unique: property["http://www.w3.org/ns/shacl#maxCount"] != 0
    });
  }
}

async function searchPath(event: AutoCompleteCompleteEvent) {
  const ps: TTIriRef[] = [];

  if (event.query) {
    const request: QueryRequest = {
      textSearch: event.query,
      query: {
        activeOnly: true,
        match: [
          {
            instanceOf: {
              "@id": RDF.PROPERTY
            }
          }
        ]
      }
    };
    const results: SearchResultSummary[] = await QueryService.queryIMSearch(request);
    ps.push(...results.map(r => ({ "@id": r.iri, name: r.name } as TTIriRef)));
  }
  ps.push({ "@id": "", name: "<Create new path>" });
  pathSuggestions.value = ps;
}

async function searchRange(event: AutoCompleteCompleteEvent) {
  const ps: TTIriRef[] = [];

  if (event.query) {
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
    ps.push(...results.map(r => ({ "@id": r.iri, name: r.name } as TTIriRef)));
  }

  ps.push({ "@id": "", name: "<Create new path>" });
  rangeSuggestions.value = ps;
}

function addProperty() {
  dmProperties.value.push({} as SimpleProp);
}

function moveUp(index: number) {
  if (index > 0) {
    const newData = [];
    newData.push(...dmProperties.value);

    const tmp = newData[index];
    newData[index] = newData[index - 1];
    newData[index - 1] = tmp;

    dmProperties.value = newData;
  }
}

function moveDown(index: number) {
  if (index < dmProperties.value.length - 1) {
    const newData = [];
    newData.push(...dmProperties.value);

    const tmp = newData[index];
    newData[index] = newData[index + 1];
    newData[index + 1] = tmp;

    dmProperties.value = newData;
  }
}

function deleteProperty(index: number) {
  if (index >= 0 && index < dmProperties.value.length) {
    const newData = [];
    newData.push(...dmProperties.value);

    newData.splice(index, 1);

    dmProperties.value = newData;
  }
}

async function pathDrop(event: any, object: any) {}

async function rangeDrop(event: any, object: any) {}

async function selectPath(event: any, row: any) {
  console.log("UPDATE");
  console.log(row);
  if (event && event.value && event.value["@id"] === "") {
    toast.add({
      severity: ToastSeverity.WARN,
      summary: "Create new property",
      detail: "Create new property path",
      life: 3000
    });
    row.path = { "@id": "im:NewPath", name: "My new path" };
  }
}

async function selectRange(event: any, row: any) {
  console.log("UPDATE");
  console.log(row);
  if (event && event.value && event.value["@id"] === "") {
    toast.add({
      severity: ToastSeverity.WARN,
      summary: "Create new range",
      detail: "Create new property range",
      life: 3000
    });
    row.range = { "@id": "im:NewRange", name: "My new range" };
  }
}
</script>

<style scoped>
.toggle-button {
  margin-right: 0.5rem;
}

.property-builder {
  flex: 1 1 auto;
}
</style>
