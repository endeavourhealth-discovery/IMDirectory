<template>
  <div class="property-builder">
    <h2 class="title">Properties</h2>
    <div :class="validationErrorMessage ? 'error-message' : ''">
      <span v-if="validationErrorMessage" class="error-message">{{ validationErrorMessage }}</span>
      <div class="children-container">
        <div v-for="(row, index) in dmProperties" class="property">
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
import { Argument, PropertyShape, QueryRequest, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { inject, onMounted, Ref, ref, watch } from "vue";
import _ from "lodash";
import { EditorMode, ToastSeverity } from "@im-library/enums";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { AutoCompleteCompleteEvent, AutoCompleteItemSelectEvent } from "primevue/autocomplete";
import { IM, RDF, RDFS, SHACL, SNOMED } from "@im-library/vocabulary";
import { DirectService, EntityService, QueryService } from "@/services";
import { useToast } from "primevue/usetoast";
import injectionKeys from "@/injectionKeys/injectionKeys";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: Property[];
  position?: number;
}

interface SimpleProp {
  path: TTIriRef;
  range: TTIriRef;
  rangeType: string;
  required: boolean;
  unique: boolean;
}

const toast = useToast();
const props = defineProps<Props>();
const directService = new DirectService();

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
// const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
// const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
// const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
if (forceValidation) {
  watch(forceValidation, () => {
    validateEntity();
  });
}

const dmProperties: Ref<SimpleProp[]> = ref([]);
const loading = ref(true);
const pathSuggestions: Ref<TTIriRef[]> = ref([]);
const rangeSuggestions: Ref<TTIriRef[]> = ref([]);
const validationErrorMessage: Ref<string | undefined> = ref();
const invalid = ref(false);

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

function processProperty(newData: any[], property: any) {
  if (!property[IM.INHERITED_FROM]) {
    let rangeType = "";
    if (property[SHACL.DATATYPE]) {
      rangeType = SHACL.DATATYPE;
    } else if (property[SHACL.CLASS]) {
      rangeType = SHACL.CLASS;
    } else if (property[SHACL.NODE]) {
      rangeType = SHACL.NODE;
    } else {
      validationErrorMessage.value = "Unhandled property range (" + property[SHACL.PATH] + ")";
      return;
    }

    newData.push({
      path: property[SHACL.PATH]?.[0],
      range: property[rangeType][0],
      rangeType: rangeType,
      required: property[SHACL.MINCOUNT] != 0,
      unique: property[SHACL.MAXCOUNT] != 0
    });
  }
}

function addProperty() {
  dmProperties.value.push({} as SimpleProp);
}

function deleteProperty(index: number) {
  if (index >= 0 && index < dmProperties.value.length) {
    const newData = [];
    newData.push(...dmProperties.value);

    newData.splice(index, 1);

    dmProperties.value = newData;
  }
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

// Path functions

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

async function selectPath(event: AutoCompleteItemSelectEvent, row: any) {
  if (event?.value?.["@id"]) {
    await update();
  } else {
    row.path = { "@id": "", name: "" };
    directService.create(RDF.PROPERTY);
  }
}

async function pathDrop(event: any, object: any) {
  const data = event.dataTransfer.getData("conceptIri");
  if (data) {
    const conceptIri = JSON.parse(data);
    const conceptName = (await EntityService.getPartialEntity(conceptIri, [RDFS.LABEL]))[RDFS.LABEL];

    if (await isValidPath(conceptIri)) {
      object.path = { "@id": conceptIri, name: conceptName } as TTIriRef;
      await update();
    } else {
      toast.add({
        severity: ToastSeverity.WARN,
        summary: "Failed to set path",
        detail: "'" + conceptName + "' is not a valid property path",
        life: 3000
      });
    }
  }
}

async function isValidPath(iri: string): Promise<boolean> {
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
              is: [{ "@id": RDF.PROPERTY }]
            }
          ]
        }
      ]
    }
  };

  const results: any = await QueryService.queryIM(request);

  return results?.entities && results.entities.length > 0;
}

// Range functions

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

async function selectRange(event: any, row: any) {
  if (event?.value?.["@id"]) {
    await update();
  } else {
    row.range = { "@id": "", name: "" };
    directService.create();
  }
}

async function rangeDrop(event: any, object: any) {
  const data = event.dataTransfer.getData("conceptIri");
  if (data) {
    const conceptIri = JSON.parse(data);
    const conceptName = (await EntityService.getPartialEntity(conceptIri, [RDFS.LABEL]))[RDFS.LABEL];

    if (await isValidRange(conceptIri)) {
      object.range = { "@id": conceptIri, name: conceptName } as TTIriRef;
      await update();
    } else {
      toast.add({
        severity: ToastSeverity.WARN,
        summary: "Failed to set range",
        detail: "'" + conceptName + "' is not a valid property range",
        life: 3000
      });
    }
  }
}

async function isValidRange(iri: string): Promise<boolean> {
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

// Update/validation
async function update() {
  await validateEntity();

  if (!validationErrorMessage.value) updateEntity();
}

async function validateEntity() {
  validationErrorMessage.value = undefined;

  if (dmProperties.value.length == 0) {
    validationErrorMessage.value = "Data models must have at least 1 property";
  } else {
    for (const prop of dmProperties.value) {
      if (!prop?.path?.["@id"]) {
        validationErrorMessage.value = "Invalid property path";
        break;
      }

      if (!prop?.range?.["@id"]) {
        validationErrorMessage.value = "Invalid property range";
        break;
      }
    }
  }

  invalid.value = !(validationErrorMessage.value == undefined);

  // if (updateValidity) await updateValidity(props.shape, editorEntity, valueVariableMap, props.shape.path["@id"], invalid, validationErrorMessage);
}

function updateEntity() {
  if (entityUpdate) {
    const deltas: any[] = [];

    dmProperties.value.forEach((value, index) => {
      const p: any = {};
      p[IM.ORDER] = index;
      p[SHACL.PATH] = value.path;
      p[value.rangeType] = value.range; // TODO: Add in type (datatype/class/node)
      p[SHACL.MINCOUNT] = value.required ? 1 : 0;
      p[SHACL.MAXCOUNT] = value.unique ? 1 : 0;

      deltas.push(p);
    });

    const update: any = {};
    update[RDF.PROPERTY] = deltas;

    entityUpdate(update);
  }
}
</script>

<style scoped>
span.error-message {
  color: red;
}

div.error-message {
  border: 1px solid red;
  border-radius: 3px;
}

.toggle-button {
  margin-right: 0.5rem;
}

.property-builder {
  flex: 1 1 auto;
}

.property {
  margin-bottom: 4px;
}

.property > * {
  margin-right: 4px;
}
</style>
