<template>
  <div class="property-value-container">
    <div class="property-name-container">
      <Button icon="pi pi-times" severity="danger" class="p-button-rounded p-button-text" @click="removeProperty" />
      <Dropdown v-model="propertyName" :options="classProperties" placeholder="Select property to add" optionLabel="name" @change="onSelect" />
    </div>
    <div v-if="props.property.type" class="property-value-container">
      <!-- TODO -->
      <!-- <PropertyIs v-if="isPropertyIs" :include-properties="includeProperties" :parent-property="props.property" /> -->
      <Dropdown v-if="isStatus" v-model="property.value" :options="options?.status" optionLabel="name" placeholder="Select status" />
      <Dropdown v-else-if="isScheme" v-model="property.value" :options="options?.scheme" optionLabel="name" placeholder="Select scheme" />
      <MultiSelect v-else-if="isType" v-model="property.value" :options="options?.type" optionLabel="name" placeholder="Select type" />
      <Chips v-else-if="isListOfTextInput" type="text" v-model="property.value" />
      <InputText v-else-if="isTextInput" type="text" v-model="property.value" />
      <Dropdown v-else-if="isBoolean" v-model="property.value" optionLabel="name" :options="options?.boolean" />
      <!-- <FullQueryBuilderEntityAutocomplete v-else-if="isListOfIriRefs || isIriRef" :property="property" :parentType="parentType" />
      <EntityAutocompleteWithInclusions
        v-else-if="isTTAlias || isListOfTTAlias"
        :property="property"
        :parentType="parentType"
        :include-properties="includeProperties"
      /> -->
      <Button v-else-if="!property.value && property.label" icon="pi pi-pencil" label="Edit value" @click="addValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SimplifiedType, QueryObject, FieldDto } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ClassService } from "@/services";
import { computed, onMounted, PropType, ref } from "vue";
// import FullQueryBuilderEntityAutocomplete from "./FullQueryBuilderEntityAutocomplete.vue";
// import EntityAutocompleteWithInclusions from "./EntityAutocompleteWithInclusions.vue";
// import PropertyIs from "./PropertyIs.vue";

const props = defineProps({
  property: { type: Object as PropType<QueryObject>, required: true },
  parentType: { type: Object as PropType<SimplifiedType>, required: true },
  options: { type: Object as PropType<{ status: TTIriRef[]; scheme: TTIriRef[]; type: TTIriRef[]; boolean: { name: string; value: boolean }[] }> },
  includeProperties: { type: Array<String>, required: false }
});
const emit = defineEmits({
  changeCurrentObject: (_payload: QueryObject) => true,
  removeProperty: (_payload: number) => true
});

const propertyName = ref<FieldDto>();
const classProperties = ref<FieldDto[]>([]);

const SIMPLE_TYPES = ["java.lang.String", "boolean", "org.endeavourhealth.imapi.model.tripletree.TTAlias"];

const isTextInput = computed(() => {
  return isOfClassType(props.property, "java.lang.String");
});

const isListOfTextInput = computed(() => {
  return isOfClassType(props.property, "java.lang.String", "java.util.List");
});

const isBoolean = computed(() => {
  return isOfClassType(props.property, "boolean");
});

const isSelectable = computed(() => {
  return !isOfClassTypes(props.property, SIMPLE_TYPES);
});

const isIriRef = computed(() => {
  return isOfClassType(props.property, "org.endeavourhealth.imapi.model.tripletree.TTIriRef");
});

const isListOfIriRefs = computed(() => {
  return isOfClassType(props.property, "org.endeavourhealth.imapi.model.tripletree.TTIriRef", "java.util.List");
});

const isTTAlias = computed(() => {
  return isOfClassType(props.property, "org.endeavourhealth.imapi.model.tripletree.TTAlias");
});

const isListOfTTAlias = computed(() => {
  return isOfClassType(props.property, "org.endeavourhealth.imapi.model.tripletree.TTAlias", "java.util.List");
});

const isStatus = computed(() => {
  return props.property.label === "status" && isIriRef;
});

const isScheme = computed(() => {
  return props.property.label === "scheme" && isIriRef;
});

const isPropertyIs = computed(() => {
  return props.property.label === "propertyIs";
});

const isType = computed(() => {
  return props.property.label === "type" && isIriRef;
});

function isOfClassType(queryOjbect: QueryObject, firstType: string, secondType?: string) {
  if (!isObjectHasKeys(queryOjbect.type, ["firstType"])) return false;
  const firstTypeMatch = queryOjbect.type.firstType === firstType;
  if (secondType) return firstTypeMatch && queryOjbect.type.secondType === secondType;
  return firstTypeMatch;
}

function isOfClassTypes(queryOjbect: QueryObject, firstTypes: string[]) {
  let isClassTypes = false;
  let i = 0;
  while (!isClassTypes && i < firstTypes.length) {
    if (isOfClassType(queryOjbect, firstTypes[i])) {
      isClassTypes = true;
    }
    i++;
  }

  return isClassTypes;
}

onMounted(async () => {
  classProperties.value = await getClassProperties(props.parentType.firstType);
  setDisplayLabel();
});

async function setDisplayLabel() {
  if (props.property.label) {
    const labelOption = classProperties.value.filter(classProp => classProp.name === props.property.label);
    propertyName.value = labelOption[0];
  }
}

async function getClassProperties(type: string) {
  let fields = await ClassService.getClassFields(type);
  if (props.includeProperties) {
    fields = fields.filter(field => props.includeProperties?.includes(field.name));
  }
  const containsProperty = fields.some(field => field.name === "property");
  const containsIs = fields.some(field => field.name === "is");
  if (containsProperty && containsIs) {
    fields = fields.filter(field => field.name !== "property" && field.name !== "is");
    fields.push({ name: "propertyIs", firstType: "propertyIs" });
  }

  return fields;
}

function onSelect(event: any) {
  const field = event.value as FieldDto;
  props.property.label = field.name;
  props.property.type = field;
  props.property.selectable = isSelectable.value;
}

function addValue() {
  emit("changeCurrentObject", props.property);
}

function removeProperty() {
  if (props.property.key) emit("removeProperty", props.property.key);
}
</script>

<style scoped>
.property-value-container {
  padding-left: 1rem;
  padding-right: 1rem;
}
.property-value-container {
  display: flex;
  flex-flow: row wrap;
  align-items: baseline !important;
  justify-content: center;
}
</style>
