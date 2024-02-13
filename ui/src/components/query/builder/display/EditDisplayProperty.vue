<template>
  <!-- {{ getNameFromIri(dataModelIri) }} - {{ getNameFromIri(property["@id"]!) }} | {{ getNameFromIri(propertyType) }} - {{ getNameFromIri(propertyValueType) }} -->
  <ClassSelect v-if="propertyType === SHACL.CLASS" :class-iri="propertyValueType" :property="property" />
  <DatatypeSelect v-else-if="propertyType === SHACL.DATATYPE" :datatype="propertyValueType" :property="property" />
  <EditDisplayMatch
    v-else-if="isObjectHasKeys(property, ['match'])"
    :parent-match="parentMatch"
    :match="property.match!"
    :data-model-iri="dataModelIri"
    :index="0"
  />
  <ClassSelect v-else-if="propertyType === SHACL.NODE" :class-iri="propertyValueType" :property="property" />
  <EditDisplayProperty
    v-if="isArrayHasLength(property.property)"
    v-for="nestedProperty of property.property"
    :property="nestedProperty"
    :data-model-iri="dataModelIri"
    :parent-match="parentMatch"
  />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Property, QueryRequest } from "@im-library/interfaces/AutoGen";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import EditProperty from "../edit/EditProperty.vue";
import _, { cloneDeep } from "lodash";
import EditDisplayMatch from "./EditDisplayMatch.vue";
import { useQueryStore } from "@/stores/queryStore";
import ClassSelect from "../edit/class/ClassSelect.vue";
import DatatypeSelect from "../edit/datatype/DatatypeSelect.vue";
import { SHACL } from "@im-library/vocabulary";
import { QueryService } from "@/services";
import { getNameFromIri } from "@im-library/helpers/TTTransform";

interface Props {
  property: Property;
  dataModelIri: string;
  parentMatch: Match;
}

const props = defineProps<Props>();
const queryStore = useQueryStore();
const propertyType: Ref<string> = ref("");
const propertyValueType: Ref<string> = ref("");

watch(
  () => props.property["@id"],
  async () => await init()
);

onMounted(async () => {
  await init();
});

async function init() {
  const ttproperties: any[] = await QueryService.getDataModelProperty(props.dataModelIri, props.property["@id"]!);
  // console.log(props.dataModelIri + " - " + props.property["@id"] + " - " + ttproperties.length);
  if (isArrayHasLength(ttproperties)) {
    propertyType.value = getPropertyType(ttproperties[0]);
    propertyValueType.value = getPropertyValueType(ttproperties[0], propertyType.value);
  }
}

function getPropertyType(ttProperty: any) {
  if (isObjectHasKeys(ttProperty, [SHACL.CLASS])) return SHACL.CLASS;
  else if (isObjectHasKeys(ttProperty, [SHACL.DATATYPE])) return SHACL.DATATYPE;
  else if (isObjectHasKeys(ttProperty, [SHACL.NODE])) return SHACL.NODE;
  return "";
}

function getPropertyValueType(ttProperty: any, propertyType: string) {
  if (propertyType && isArrayHasLength(ttProperty[propertyType])) return ttProperty[propertyType][0]["@id"];
  return "";
}
</script>

<style scoped></style>
