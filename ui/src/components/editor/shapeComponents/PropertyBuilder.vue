<template>
  <div class="property-builder">
    <div class="title-bar">
      <h2 v-if="shape.showTitle" class="title">{{ shape.name }}</h2>
      <h2 v-if="showRequired && shape.showTitle" class="required">*</h2>
    </div>
    <div class="error-message-container" :class="invalid && showValidation ? 'error-message-container-highlight' : ''">
      <div class="children-container">
        <table>
          <template v-for="(row, index) in dmProperties" class="property">
            <tr>
              <td class="td-50">
                <AutoComplete
                  class="propertyPath"
                  :dropdown="true"
                  dropdownMode="current"
                  optionLabel="name"
                  placeholder="Select property"
                  v-model="row.path"
                  :suggestions="pathSuggestions"
                  @complete="debounce($event, searchPath, debouncePath)"
                  @drop="pathDrop(row, $event)"
                  @itemSelect="selectPath(row, $event)"
                  @clear="selectPath(row)"
                  @dragover.prevent
                  @dragenter.prevent
                  :disabled="row.inherited && row.inherited.length > 0"
                ></AutoComplete>
                <div v-if="invalid && showValidation && row.error" class="error-message-text">{{ row.error }}</div>
              </td>
              <td class="td-50">
                <AutoComplete
                  class="propertyPath"
                  :dropdown="true"
                  dropdownMode="current"
                  optionLabel="name"
                  placeholder="Select range"
                  v-model="row.range"
                  :suggestions="rangeSuggestions"
                  @complete="debounce($event, searchRange, debounceRange)"
                  @drop="rangeDrop(row, $event)"
                  @itemSelect="selectRange(row, $event)"
                  @clear="selectRange(row)"
                  @dragover.prevent
                  @dragenter.prevent
                  :disabled="row.inherited && row.inherited.length > 0"
                ></AutoComplete>
              </td>
              <td class="td-nw">
                <tag v-if="row.inherited && row.inherited.length > 0" severity="warning">(Inherited)</tag>
                <span v-else>
                  <ToggleButton
                    class="toggle-button"
                    v-model="row.required"
                    onLabel="Required"
                    offLabel="Required"
                    onIcon="fa-solid fa-check"
                    offIcon="fa-solid fa-xmark"
                  />
                  <ToggleButton
                    class="toggle-button"
                    v-model="row.unique"
                    onLabel="Unique"
                    offLabel="Unique"
                    onIcon="fa-solid fa-check"
                    offIcon="fa-solid fa-xmark"
                  />
                  <Button
                    icon="fa-solid fa-chevron-up"
                    class="p-button-rounded p-button-text"
                    @click="moveUp(index)"
                    :disabled="index == 0 || dmProperties[index - 1].inherited != undefined"
                  />
                  <Button
                    icon="fa-solid fa-chevron-down"
                    class="p-button-rounded p-button-text"
                    @click="moveDown(index)"
                    :disabled="index == dmProperties.length - 1"
                  />
                  <Button icon="fa-solid fa-trash" severity="danger" class="p-button-rounded p-button-text" @click="deleteProperty(index)" />
                </span>
              </td>
            </tr>
          </template>
        </table>
        <div class="buttonGroup">
          <Button icon="fa-solid fa-plus" label="Add property" severity="success" class="p-button" @click="addProperty" />
        </div>
      </div>
      <span v-if="invalid && showValidation" class="error-message-text">{{ validationErrorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Property } from "@im-library/interfaces";
import { Argument, PropertyShape, QueryRequest, SearchResponse, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { computed, ComputedRef, inject, onMounted, Ref, ref, watch } from "vue";
import _ from "lodash";
import { EditorMode, ToastSeverity } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
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
  inherited: TTIriRef[] | undefined;
  error: string | undefined;
}

const toast = useToast();
const props = defineProps<Props>();
const directService = new DirectService();

const debouncePath = ref(0);
const debounceRange = ref(0);

const showValidation = ref(false);

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableHasChanged = inject(injectionKeys.valueVariableMap)?.valueVariableHasChanged;
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

const dmProperties: Ref<SimpleProp[]> = ref([]);
const loading = ref(true);
const pathSuggestions: Ref<TTIriRef[]> = ref([]);
const rangeSuggestions: Ref<TTIriRef[]> = ref([]);
const validationErrorMessage: Ref<string | undefined> = ref();
const invalid = ref(false);

const key = props.shape.path["@id"];

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
  let rangeType;

  if (property[SHACL.DATATYPE]) {
    rangeType = SHACL.DATATYPE;
  } else if (property[SHACL.CLASS]) {
    rangeType = SHACL.CLASS;
  } else if (property[SHACL.NODE]) {
    rangeType = SHACL.NODE;
  } else {
    rangeType = "UNKNOWN";
  }

  const row: SimpleProp = {
    path: property[SHACL.PATH]?.[0],
    range: property[rangeType]?.[0],
    rangeType: rangeType,
    required: property[SHACL.MINCOUNT] != 0,
    unique: property[SHACL.MAXCOUNT] != 0,
    inherited: property[IM.INHERITED_FROM],
    error: undefined
  };

  if (!row?.path?.["@id"]) {
    row.error = "Property must have a path";
  } else if (!row?.range?.["@id"]) {
    row.error = "Property must have a range";
  }

  newData.push(row);
}

function addProperty() {
  dmProperties.value.push({} as SimpleProp);
  update();
}

function deleteProperty(index: number) {
  if (index >= 0 && index < dmProperties.value.length) {
    const newData = [];
    newData.push(...dmProperties.value);

    newData.splice(index, 1);

    dmProperties.value = newData;
    update();
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

  if (event.query && event.query.length > 2) {
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
    const results: SearchResponse = await QueryService.queryIMSearch(request);
    if (results?.entities && isArrayHasLength(results.entities)) ps.push(...results.entities.map(r => ({ "@id": r.iri, name: r.name }) as TTIriRef));
  }
  ps.push({ "@id": "<CREATE>", name: "<Create new path>" });
  pathSuggestions.value = ps;
}

function debounce(event: AutoCompleteCompleteEvent, searchFunction: Function, debounceTimer: number): void {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    searchFunction(event);
  }, 600);
}

async function selectPath(row: any, event?: AutoCompleteItemSelectEvent) {
  if (!event) {
    row.path = { "@id": "", name: "" };
  } else if ("<CREATE>" == event?.value?.["@id"]) {
    row.path = { "@id": "", name: "" };
    directService.create(RDF.PROPERTY);
  }
  await update();
}

async function pathDrop(object: any, event: DragEvent) {
  if (event.dataTransfer) {
    const data = event.dataTransfer.getData("conceptIri");
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
          where: [
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

  if (event.query && event.query.length > 2) {
    const request: QueryRequest = {
      textSearch: event.query,
      query: {
        activeOnly: true,
        match: [
          {
            where: [
              {
                "@id": RDF.TYPE,
                is: [{ "@id": IM.CONCEPT_SET }, { "@id": IM.VALUE_SET }, { "@id": IM.CONCEPT }, { "@id": SHACL.NODESHAPE }, { "@id": RDFS.DATATYPE }]
              },
              {
                "@id": IM.HAS_SCHEME,
                is: [{ "@id": SNOMED.NAMESPACE }, { "@id": IM.NAMESPACE }]
              }
            ]
          }
        ]
      }
    };
    const results: SearchResponse = await QueryService.queryIMSearch(request);
    if (results?.entities && isArrayHasLength(results.entities)) ps.push(...results.entities.map(r => ({ "@id": r.iri, name: r.name }) as TTIriRef));
  }

  ps.push({ "@id": "<CREATE>", name: "<Create new path>" });
  rangeSuggestions.value = ps;
}

async function selectRange(row: any, event?: AutoCompleteItemSelectEvent) {
  if (!event) {
    row.range = { "@id": "", name: "" };
  } else if ("<CREATE>" == event?.value?.["@id"]) {
    row.range = { "@id": "", name: "" };
    directService.create();
  } else {
    row.rangeType = await getRangeType(event.value["@id"]);
  }
  await update();
}

async function rangeDrop(object: any, event: DragEvent) {
  if (event.dataTransfer) {
    const data = event.dataTransfer.getData("conceptIri");
    const conceptIri = JSON.parse(data);
    const conceptName = (await EntityService.getPartialEntity(conceptIri, [RDFS.LABEL]))[RDFS.LABEL];

    if (await isValidRange(conceptIri)) {
      object.range = { "@id": conceptIri, name: conceptName } as TTIriRef;
      object.rangeType = await getRangeType(conceptIri);
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

async function getRangeType(iri: string) {
  const partial = await EntityService.getPartialEntity(iri, [RDF.TYPE]);
  const types: TTIriRef[] = partial?.[RDF.TYPE];

  if (types.some(t => t["@id"] == IM.CONCEPT)) return SHACL.CLASS;
  else if (types.some(t => t["@id"] == IM.CONCEPT_SET)) return SHACL.CLASS;
  else if (types.some(t => t["@id"] == RDFS.DATATYPE)) return SHACL.DATATYPE;
  else return SHACL.NODE;
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

  const results: any = await QueryService.queryIM(request);

  return results?.entities && results.entities.length > 0;
}

// Update/validation
async function update() {
  updateEntity();
  await validateEntity();
}

async function validateEntity() {
  if (updateValidity) await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
  if (updateValidationCheckStatus) await updateValidationCheckStatus(key);
}

function updateEntity() {
  if (entityUpdate) {
    const deltas: any[] = [];

    dmProperties.value.forEach((value, index) => {
      const p: any = {};
      p[IM.ORDER] = index;
      p[SHACL.PATH] = [value.path];
      p[value.rangeType] = [value.range];
      p[SHACL.MINCOUNT] = value.required ? 1 : 0;
      p[SHACL.MAXCOUNT] = value.unique ? 1 : 0;
      p[IM.INHERITED_FROM] = value.inherited;

      deltas.push(p);
    });

    const update: any = {};
    update[key] = deltas;

    entityUpdate(update);
  }
}
</script>

<style scoped>
.error-message-text {
  color: red;
}

.error-message-container {
  padding: 0.3rem;
}

.error-message-container-highlight {
  padding: 0.3rem;
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

.propertyPath {
  width: 100%;
}

.td-50 {
  width: 50%;
  vertical-align: top;
}

.td-nw {
  white-space: nowrap;
  vertical-align: top;
}

.title-bar {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
}

.required {
  color: var(--red-500);
}
</style>
