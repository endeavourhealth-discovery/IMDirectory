<template>
  <div class="property-builder">
    <div class="title-bar">
      <h2 v-if="shape.showTitle" class="title">{{ shape.name }}</h2>
      <h2 v-if="showRequired && shape.showTitle" class="required">*</h2>
    </div>
    <div :class="invalid && showValidation ? 'error-message-container-highlight' : ''" class="error-message-container">
      <div
        :class="[hover ? 'children-container-hover' : 'children-container', invalid && showValidation ? 'error-message-container-highlight' : '']"
        class="error-message-container"
        @mouseout="mouseout"
        @mouseover="mouseover($event, true)"
      >
        <table data-testid="property-builder">
          <tbody>
          <template v-for="(row, index) in dmProperties">
            <tr class="property" @mouseout="mouseout" @mouseover="mouseover($event, row)">
              <td :class="[hover === row ? 'table-row-hover' : 'table-row']" class="td-50">
                <AutocompleteSearchBar
                  v-model:selected="row.path"
                  :class="row.error === 'Property must have a path' && invalid && showValidation ? 'error-message-container-highlight' : ''"
                  :im-query="pSuggestions"
                  :root-entities="['http://endhealth.info/im#Properties']"
                  :search-placeholder="'Select property'"
                  class="search-bar"
                  data-testid="property-autocomplete"
                />
                <div v-if="invalid && showValidation && row.error" class="error-message-text">{{ row.error }}</div>
              </td>
              <td :class="[hover === row ? 'table-row-hover' : 'table-row']" class="td-50">
                <AutocompleteSearchBar
                  v-model:selected="row.range"
                  :class="row.error === 'Property must have a range' && invalid && showValidation ? 'error-message-container-highlight' : ''"
                  :im-query="rSuggestions"
                  :search-placeholder="'Select range'"
                  data-testid="range-autocomplete"
                />
                <div v-if="invalid && showValidation && row.error" class="error-message-text opacity-0">{{ row.error }}</div>
              </td>
              <td :class="[hover === row ? 'table-row-hover' : 'table-row']" class="row-buttons">
                <span>
                  <ToggleButton
                    v-model="row.required"
                    class="toggle-button"
                    offIcon="fa-solid fa-xmark"
                    offLabel="Required"
                    onIcon="fa-solid fa-check"
                    onLabel="Required"
                  />
                  <ToggleButton
                    v-model="row.unique"
                    class="toggle-button"
                    offIcon="fa-solid fa-xmark"
                    offLabel="Unique"
                    onIcon="fa-solid fa-check"
                    onLabel="Unique"
                  />
                  <Button
                    :disabled="index == 0 || dmProperties[index - 1].inherited != undefined"
                    class="p-button-rounded p-button-text"
                    icon="fa-solid fa-chevron-up"
                    @click="moveUp(index)"
                  />
                  <Button
                    :disabled="index == dmProperties.length - 1"
                    class="p-button-rounded p-button-text"
                    icon="fa-solid fa-chevron-down"
                    @click="moveDown(index)"
                  />
                  <Button
                    class="p-button-danger"
                    icon="fa-solid fa-trash"
                    severity="danger"
                    @click="deleteProperty(index, row)"
                    data-testid="delete-property-button"
                  />
                </span>
              </td>
            </tr>
          </template>
          <tr class="button-group">
            <Button
              :class="!hover && 'hover-button'"
              :outlined="!hover"
              :severity="hover ? 'success' : 'secondary'"
              class="builder-button"
              icon="fa-solid fa-plus"
              label="Add property"
              @click="addProperty"
              data-testid="add-property-button"
            />
            <Button
              :class="!hover && 'hover-button'"
              :outlined="!hover"
              :severity="hover ? 'primary' : 'secondary'"
              class="builder-button"
              icon="fa-solid fa-pencil"
              label="Create new"
              @click="directService.create()"
              data-testid="create-new-property-button"
            />
          </tr>
          <template v-for="(row, index) in dmPropertiesInherited" class="property">
            <tr class="property" @mouseout="mouseout" @mouseover="mouseover($event, row)">
              <td :class="[hover === row ? 'table-row-hover' : 'table-row']" class="td-50">
                <AutocompleteSearchBar
                  v-model:selected="row.path"
                  :disabled="true"
                  :imQuery="pSuggestions"
                  :root-entities="['http://endhealth.info/im#Properties']"
                  class="search-bar"
                  data-testid="property-path-search"
                />
                <div v-if="invalid && showValidation && row.error" class="error-message-text">{{ row.error }}</div>
              </td>
              <td :class="[hover === row ? 'table-row-hover' : 'table-row']" class="td-50">
                <AutocompleteSearchBar v-model:selected="row.range" :disabled="true" data-testid="property-range-search" />
              </td>
              <td :class="[hover === row ? 'table-row-hover' : 'table-row']" class="td-nw items-center">
                <tag
                  v-if="row.inherited && row.inherited.length > 0"
                  @click="directService.view(row.inherited[0]['@id'])"
                  severity="info"
                  v-tooltip.top="getInheritedTooltipName(row.inherited)"
                  class="cursor-pointer align-middle"
                  ><span>(Inherited <IMFontAwesomeIcon icon="fa-duotone fa-arrow-up-right-from-square" /> )</span></tag
                >
              </td>
            </tr>
          </template>
        </tbody>
        </table>
      </div>
      <span v-if="invalid && showValidation" class="error-message-text">{{ validationErrorMessage }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Property, RecentActivityItem, SearchOptions } from "@/interfaces";
import { PropertyShape, QueryRequest, SearchResultSummary, TTIriRef } from "@/interfaces/AutoGen";
import { computed, ComputedRef, inject, onMounted, Ref, ref, watch } from "vue";
import { cloneDeep } from "lodash-es";
import { EditorMode, ToastSeverity } from "@/enums";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { IM, RDF, RDFS, SHACL, SNOMED, XSD } from "@/vocabulary";
import { DirectService, EntityService, QueryService } from "@/services";
import { useToast } from "primevue/usetoast";
import injectionKeys from "@/injectionKeys/injectionKeys";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: Property[];
  position?: number;
}

interface SimpleProp {
  path: SearchResultSummary;
  range: SearchResultSummary | undefined;
  rangeType: string;
  required: boolean;
  unique: boolean;
  inherited: TTIriRef[] | undefined;
  error: string | undefined;
}

const toast = useToast();
const props = defineProps<Props>();
const directService = new DirectService();

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
  return !!(props.shape.minCount && props.shape.minCount > 0);
});

const dmProperties: Ref<SimpleProp[]> = ref([]);
const dmPropertiesInherited: Ref<SimpleProp[]> = ref([]);
const loading = ref(true);
const pSuggestions: Ref<QueryRequest | undefined> = ref({
  query: {
    activeOnly: true,
    match: [
      {
        typeOf: {
          "@id": RDF.PROPERTY
        }
      }
    ]
  }
});
const rSuggestions: Ref<QueryRequest | undefined> = ref({
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
            is: [{ "@id": SNOMED.NAMESPACE }, { "@id": IM.NAMESPACE }, { "@id": XSD.NAMESPACE }]
          }
        ]
      }
    ]
  }
});
const validationErrorMessage: Ref<string | undefined> = ref();
const invalid = ref(false);

const key = props.shape.path["@id"];

watch(
  () => cloneDeep(props.value),
  (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) processProps();
  }
);

watch(
  () => cloneDeep(dmProperties.value),
  async (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue) && JSON.stringify(loading.value) === "false") {
      for (const v in newValue) {
        if (
          oldValue.length <= newValue.length &&
          oldValue[v] &&
          newValue[v].range !== undefined &&
          JSON.stringify(newValue[v].range?.iri) !== JSON.stringify(oldValue[v].range?.iri)
        ) {
          if (newValue[v].range?.iri) {
            const newRangeType = await getRangeType(newValue[v].range!.iri!.toString());
            dmProperties.value[v].rangeType = newRangeType!.toString();
          }
        }
      }
      await update();
    }
  }
);

onMounted(async () => {
  loading.value = true;
  processProps();
  loading.value = false;
});

const hover = ref();

function mouseover(event: Event, row: any) {
  event.stopPropagation();
  hover.value = row;
}

function mouseout(event: Event) {
  event.stopPropagation();
  hover.value = false;
}

function processProps() {
  const newData: any[] = [];
  const newInheritedData: any[] = [];
  const newSearchData: any[] = [];
  if (props.value && isArrayHasLength(props.value)) {
    for (const p of props.value) {
      processProperty(newData, newInheritedData, p);
    }
  }
  dmProperties.value = newData;
  dmPropertiesInherited.value = newInheritedData;
}

function getInheritedTooltipName(inherited: TTIriRef[]) {
  return inherited.length ? inherited[0].name : "";
}

function processProperty(newData: any[], newInheritedData: any[], property: any) {
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

  let pathIri = undefined;
  let pathName = undefined;
  let rangeIri = undefined;
  let rangeName = undefined;
  if (property[SHACL.PATH]?.[0]) {
    pathIri = property[SHACL.PATH]?.[0]["@id"];
  }
  if (property[SHACL.PATH]?.[0]) {
    pathName = property[SHACL.PATH]?.[0].name;
  }
  if (property[rangeType]?.[0]) {
    rangeIri = property[rangeType]?.[0]["@id"];
  }
  if (property[rangeType]?.[0]) {
    rangeName = property[rangeType]?.[0].name;
  }
  const row: SimpleProp = {
    path: {
      iri: pathIri,
      name: pathName,
      scheme: { "@id": "", name: "" },
      status: { "@id": "", name: "" },
      entityType: []
    },
    range: {
      iri: rangeIri,
      name: rangeName,
      scheme: { "@id": "", name: "" },
      status: { "@id": "", name: "" },
      entityType: []
    },
    rangeType: rangeType,
    required: property[SHACL.MINCOUNT] != 0,
    unique: property[SHACL.MAXCOUNT] != 0,
    inherited: property[IM.INHERITED_FROM],
    error: undefined
  };

  row.error = propertyError(row);

  if (property[IM.INHERITED_FROM]) {
    newInheritedData.push(row);
  } else newData.push(row);
}

function propertyError(row: any) {
  if (!row?.path?.iri) {
    return "Property must have a path";
  } else if (!row?.range?.iri) {
    return "Property must have a range";
  } else {
    return "";
  }
}

function addProperty() {
  let a = {
    path: {
      iri: "",
      name: "",
      scheme: { "@id": "", name: "" },
      status: { "@id": "", name: "" },
      entityType: []
    },
    range: {
      iri: "",
      name: "",
      scheme: { "@id": "", name: "" },
      status: { "@id": "", name: "" },
      entityType: []
    },
    rangeType: "UNKNOWN",
    required: false,
    unique: false,
    inherited: undefined,
    error: undefined
  } as SimpleProp;
  dmProperties.value.push(a);
  update();
}

function deleteProperty(index: number, row: any) {
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
  const filterOptions: SearchOptions = {
    textSearch: iri,
    isA: [{ "@id": RDF.PROPERTY }],
    page: { pageNumber: 1, pageSize: 1 }
  } as SearchOptions;
  const imQuery = buildIMQueryFromFilters(filterOptions);
  const results = await QueryService.queryIMSearch(imQuery);

  if (results.entities) return results.entities.length > 0;
  return false;
}

// Range functions

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
  if (isArrayHasLength(types)) {
    if (types.some(t => t["@id"] == IM.CONCEPT)) return SHACL.CLASS;
    else if (types.some(t => t["@id"] == IM.CONCEPT_SET)) return SHACL.CLASS;
    else if (types.some(t => t["@id"] == RDFS.DATATYPE)) return SHACL.DATATYPE;
    else return SHACL.NODE;
  }
}

async function isValidRange(iri: string): Promise<boolean> {
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
    const dmAllProperties = dmProperties.value.concat(dmPropertiesInherited.value);
    dmAllProperties.forEach((value, index) => {
      const p: any = {};
      let fullPath = {} as TTIriRef;
      let fullRange = {} as TTIriRef;

      if (value.path) fullPath = { "@id": value.path.iri, name: value.path.name } as TTIriRef;
      if (value.range) fullRange = { "@id": value.range.iri, name: value.range.name } as TTIriRef;

      p[SHACL.ORDER] = index;
      p[SHACL.PATH] = [fullPath];
      p[value.rangeType] = [fullRange];
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
  border-radius: var(--p-textarea-border-radius);
}

.toggle-button {
  margin-right: 0.5rem;
}

.property-builder {
  flex: 1 1 auto;
}

.property {
  display: flex;
  margin-bottom: 4px;
  height: 49px;
}

.property > * {
  margin-right: 4px;
}

.propertyPath {
  width: 100%;
}

.td-50 {
  max-width: 50%;
  vertical-align: center;
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
  color: var(--p-red-500);
}

.children-container {
  background-color: #781c8110;
  border: #781c8130 1px solid;
  border-radius: 5px;
  padding: 0 0.5rem;
}

.children-container-hover {
  background-color: #781c8110;
  border: #781c81 1px solid;
  border-radius: 5px;
  padding: 0 0.5rem;
}

.table-row {
  background-color: #781c8110;
  border: #781c8130 1px;
  border-style: solid none solid none;
  padding: 0.5rem;
  margin: 0;
  grow: 1;
  display: flex;
  flex-direction: column;
}

.table-row-hover {
  background-color: #781c8110;
  border: #781c81 1px;
  border-style: solid none solid none;
  padding: 0.5rem;
  margin: 0;
  grow: 1;
  display: flex;
  flex-direction: column;
}

table {
  border-collapse: inherit;
  border-spacing: 0px 0.5rem;
  width: 100%;
}

td {
  border: #781c8130 1px;
  border-style: solid none solid none;
  padding: 0.5rem;
  margin: 0.5rem;
}

td:last-child {
  border-radius: 0 5px 5px 0;
  border-style: solid solid solid none;
  align-self: right;
}

td:first-child {
  border-radius: 5px 0 0 5px;
  border-style: solid none solid solid;
}

.hover-button {
  color: #00000030 !important;
  border-style: dashed !important;
  background-color: transparent;
}

.button-group {
  min-width: 70%;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.builder-button {
  min-width: 10rem;
}

.row-buttons {
  flex: 0 0 auto;
}
</style>
