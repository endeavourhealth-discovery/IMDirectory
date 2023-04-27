<template>
  <div class="property-builder">
    <div class="content-container">
      <ToggleButton v-model="isInherited" onLabel="" offLabel="" onIcon="pi pi-check" offIcon="pi pi-times" disabled />
      <EntityAutoComplete :value="propertyPath" :shape="propertyPathShape" :mode="mode" @updateClicked="updatePath" :disabled="!!inheritedFrom" />
      <IMFontAwesomeIcon class="icon" icon="fa-regular fa-arrow-right" />
      <EntityAutoComplete :value="propertyRange" :shape="propertyRangeShape" :mode="mode" @updateClicked="updateRange" />
      <ToggleButton v-model="required" onLabel="" offLabel="" onIcon="pi pi-check" offIcon="pi pi-times" />
      <ToggleButton v-model="unique" onLabel="" offLabel="" onIcon="pi pi-check" offIcon="pi pi-times" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Property } from "@im-library/interfaces";
import { PropertyShape } from "@im-library/interfaces/AutoGen";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import { computed, inject, onMounted, PropType, Ref, ref, watch } from "vue";
import EntityAutoComplete from "./EntityAutoComplete.vue";
import _ from "lodash";
import { XmlSchemaDatatypes } from "@im-library/config";
import { EditorMode } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { EntityService, QueryService } from "@/services";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import router from "@/router";

const props = defineProps({
  shape: { type: Object as PropType<PropertyShape>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: Object as PropType<Property>, required: false },
  position: { type: Number, required: true }
});

const emit = defineEmits({
  updateClicked: (_payload: Property) => true
});

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;

const propertyPath: Ref<TTIriRef> = ref({} as TTIriRef);
const propertyRange: Ref<TTIriRef | undefined> = ref(undefined);
const inheritedFrom: Ref<TTIriRef | undefined> = ref(undefined);
const required = ref(false);
const unique = ref(false);
const loading = ref(true);
const invalid = ref(false);
let isInherited = false;

watch(
  [propertyPath, propertyRange, inheritedFrom, required, unique],
  ([newPath, newRange, newInherited, newRequired, newUnique], [oldPath, oldRange, oldInherited, oldRequired, oldUnique]) => {
    if (!loading.value) {
      // if (!(newPath === oldPath && newRange === oldRange && newInherited === oldInherited && newRequired === oldRequired && newUnique === oldUnique))
      updateAll();
    }
  }
);

let key = props.shape.path["@id"];

const order = computed(() => props.position);

const propertyPathShape: PropertyShape = {
  comment: "selects an entity based on select query",
  name: "Path",
  componentType: { "@id": IM.ENTITY_AUTO_COMPLETE_COMPONENT },
  path: props.shape.path,
  builderChild: true,
  order: 1,
  select: [{ "@id": "http://endhealth.info/im#Query_GetIsas" }],
  argument: [{ valueIri: { "@id": IM.DATAMODEL_PROPERTY }, parameter: "this" }]
} as PropertyShape;
const propertyRangeShape: Ref<PropertyShape> = ref({
  comment: "selects an entity based on select query",
  name: "Range",
  order: 1,
  componentType: { "@id": IM.ENTITY_AUTO_COMPLETE_COMPONENT },
  path: props.shape.path,
  select: [{ name: "Get range", "@id": "http://endhealth.info/im#Query_DataModelPropertyRange" }],
  argument: [
    { valueIri: { "@id": propertyPath.value["@id"] }, parameter: "myProperty" },
    { valueIri: { "@id": router.currentRoute.value.params.selectedIri as string }, parameter: "myDataModel" }
  ],
  builderChild: true
} as PropertyShape);

watch(propertyPath, newValue => {
  if (newValue["@id"] && propertyRangeShape.value.argument[0] && propertyRangeShape.value.argument[0].valueIri) {
    propertyRangeShape.value.argument[0].valueIri["@id"] = newValue["@id"];
  }
});

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
  await updateAll();
});

function processProps() {
  if (props.value) {
    if (isObjectHasKeys(props.value, ["http://www.w3.org/ns/shacl#path"]) && props.value["http://www.w3.org/ns/shacl#path"].length === 1)
      propertyPath.value = props.value["http://www.w3.org/ns/shacl#path"][0];
    if (
      isObjectHasKeys(props.value, ["http://www.w3.org/ns/shacl#node"]) &&
      _.isArray(props.value["http://www.w3.org/ns/shacl#node"]) &&
      props.value["http://www.w3.org/ns/shacl#node"].length === 1
    )
      propertyRange.value = props.value["http://www.w3.org/ns/shacl#node"][0];
    if (
      isObjectHasKeys(props.value, ["http://www.w3.org/ns/shacl#datatype"]) &&
      _.isArray(props.value["http://www.w3.org/ns/shacl#datatype"]) &&
      props.value["http://www.w3.org/ns/shacl#datatype"].length === 1
    )
      propertyRange.value = props.value["http://www.w3.org/ns/shacl#datatype"][0];
    if (
      isObjectHasKeys(props.value, ["http://www.w3.org/ns/shacl#class"]) &&
      _.isArray(props.value["http://www.w3.org/ns/shacl#class"]) &&
      props.value["http://www.w3.org/ns/shacl#class"].length === 1
    )
      propertyRange.value = props.value["http://www.w3.org/ns/shacl#class"][0];
    if (
      isObjectHasKeys(props.value, ["http://endhealth.info/im#inheritedFrom"]) &&
      _.isArray(props.value["http://endhealth.info/im#inheritedFrom"]) &&
      props.value["http://endhealth.info/im#inheritedFrom"].length === 1
    ) {
      inheritedFrom.value = props.value["http://endhealth.info/im#inheritedFrom"][0];
      isInherited = true;
    }
    if (isObjectHasKeys(props.value, ["http://www.w3.org/ns/shacl#minCount"]) && typeof props.value["http://www.w3.org/ns/shacl#minCount"] === "number")
      required.value = props.value["http://www.w3.org/ns/shacl#minCount"] > 0;
    else required.value = false;
    if (isObjectHasKeys(props.value, ["http://www.w3.org/ns/shacl#maxCount"]) && typeof props.value["http://www.w3.org/ns/shacl#maxCount"] === "number")
      unique.value = props.value["http://www.w3.org/ns/shacl#maxCount"] !== 0;
    else unique.value = false;
  } else {
    propertyPath.value = {} as TTIriRef;
    propertyRange.value = undefined;
    inheritedFrom.value = undefined;
  }
}

async function updatePath(data: any) {
  if (props.value && Object.keys(props.value["http://www.w3.org/ns/shacl#path"][0]).length === 0) {
    props.value["http://www.w3.org/ns/shacl#path"][0] = { "@id": data["@id"] } as TTIriRef;
  }
}

function updateRange(data: any) {
  propertyRange.value = data;
}

async function updateAll() {
  const property = await createProperty();
  if (!props.shape.builderChild) {
    updateEntity(property);
  } else {
    emit("updateClicked", property);
  }
  updateValueVariableMap(property);
  await updateValidity();
}

async function createProperty() {
  const property = {} as Property;
  property["http://www.w3.org/ns/shacl#path"] = [propertyPath.value];
  await setRange(property);
  if (inheritedFrom.value) property["http://endhealth.info/im#inheritedFrom"] = [inheritedFrom.value];
  if (required.value) property["http://www.w3.org/ns/shacl#minCount"] = 1;
  else property["http://www.w3.org/ns/shacl#minCount"] = 0;
  if (unique.value) property["http://www.w3.org/ns/shacl#maxCount"] = 1;
  else property["http://www.w3.org/ns/shacl#maxCount"] = 0;
  return property;
}

async function setRange(property: Property) {
  if (propertyRange.value) {
    if (XmlSchemaDatatypes.find(p => propertyRange.value && p === propertyRange.value["@id"])) {
      property["http://www.w3.org/ns/shacl#datatype"] = [propertyRange.value];
    } else {
      const type = await EntityService.getPartialEntity(propertyRange.value["@id"], [RDF.TYPE]);
      if (type[RDF.TYPE]) {
        switch (type[RDF.TYPE]) {
          case IM.CONCEPT:
          case IM.CONCEPT_SET:
            property["http://www.w3.org/ns/shacl#class"] = [propertyRange.value];
            break;
          default:
            property["http://www.w3.org/ns/shacl#node"] = [propertyRange.value];
        }
      }
    }
  }
}

function updateEntity(data: Property) {
  const result = {} as any;
  result[key] = data;
  if (entityUpdate) entityUpdate(result);
}

function updateValueVariableMap(data: Property) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

async function updateValidity() {
  if (isObjectHasKeys(props.shape, ["validation"]) && editorEntity) {
    invalid.value = !(await QueryService.checkValidation(props.shape.validation["@id"], editorEntity.value));
  } else {
    invalid.value = !defaultValidity();
  }
  if (validityUpdate) validityUpdate({ key: key, valid: !invalid.value });
}

function defaultValidity() {
  return true;
}
</script>

<style scoped>
.content-container {
  display: flex;
  flex-flow: row wrap;
  align-items: baseline;
}

.p-togglebutton {
  margin-right: 2.5rem;
}
</style>
