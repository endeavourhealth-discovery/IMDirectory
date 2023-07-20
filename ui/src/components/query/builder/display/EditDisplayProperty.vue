<template>
  <EditProperty v-if="editMode" :property="editProperty" :query-type-iri="queryTypeIri" :match="parentMatch" @on-cancel="editMode = false" @on-save="save" />
  <div class="property" v-else-if="property.description">
    <div v-tooltip="'Double click to edit'" v-html="property.description" @dblclick="editMode = true"></div>
  </div>

  <EditDisplayProperty
    v-if="isArrayHasLength(property.property)"
    v-for="(nestedProperty, index) of property.property"
    :index="index"
    :parent-match="parentMatch"
    :parent-property="property"
    :property="nestedProperty"
    :query-type-iri="queryTypeIri"
    :selected-matches="selectedMatches"
    :variable-map="variableMap"
  />

  <EditDisplayMatch
    v-if="isObjectHasKeys(property, ['match'])"
    :index="index"
    :parent-match="parentMatch"
    :match="property.match!"
    :query-type-iri="queryTypeIri"
    :selected-matches="selectedMatches"
    :variable-map="variableMap"
  />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Match, Property } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref, watch } from "vue";
import EditProperty from "../edit/EditProperty.vue";
import _, { cloneDeep } from "lodash";
import EditDisplayMatch from "./EditDisplayMatch.vue";
import { SelectedMatch } from "@im-library/interfaces";

interface Props {
  parentMatch?: Match;
  parentProperty?: Property;
  index: number;
  property: Property;
  queryTypeIri: string;
  selectedMatches: SelectedMatch[];
  variableMap: Map<string, any>;
}

const props = defineProps<Props>();
const editMode: Ref<boolean> = ref(false);
const editProperty: Ref<Property> = ref({} as Property);

onMounted(() => {
  editProperty.value = _.cloneDeep(props.property);
});

watch(
  () => cloneDeep(props.property),
  newValue => {
    editProperty.value = _.cloneDeep(props.property);
  }
);

function save() {
  for (const key of Object.keys(props.property)) {
    delete (props.property as any)[key];
  }
  for (const key of Object.keys(editProperty.value)) {
    (props.property as any)[key] = (editProperty.value as any)[key];
  }
  editMode.value = false;
}
</script>

<style scoped>
.property {
  margin-left: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
  display: flex;
}
</style>
