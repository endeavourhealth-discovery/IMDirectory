<template>
  <EditProperty v-if="editMode" :property="editProperty" :query-type-iri="queryTypeIri" :match="parentMatch" @on-cancel="editMode = false" @on-save="save" />
  <div class="property" v-else-if="property.description" v-html="property.description" @dblclick="editMode = true"></div>

  <EditDisplayProperty
    v-if="isArrayHasLength(property.property)"
    v-for="(nestedProperty, index) of property.property"
    :index="index"
    :parent-property="property"
    :property="nestedProperty"
    :query-type-iri="queryTypeIri"
    :selected-matches="selectedMatches"
  />

  <EditDisplayMatch
    v-if="isObjectHasKeys(property, ['match'])"
    :index="index"
    :parent-match="undefined"
    :match="property.match!"
    :query-type-iri="queryTypeIri"
    :selected-matches="selectedMatches"
  />
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { describeProperty, getDisplayFromLogic } from "@im-library/helpers/QueryDescriptor";
import { Match, Property } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";
import EditProperty from "../edit/EditProperty.vue";
import _ from "lodash";
import EditDisplayMatch from "./EditDisplayMatch.vue";
import { SelectedMatch } from "@im-library/interfaces";

interface Props {
  parentMatch?: Match;
  parentProperty?: Property;
  index: number;
  property: Property;
  queryTypeIri: string;
  selectedMatches: SelectedMatch[];
}

const props = defineProps<Props>();
const editMode: Ref<boolean> = ref(false);
const editProperty: Ref<Property> = ref({} as Property);

onMounted(() => {
  editProperty.value = _.cloneDeep(props.property);
});

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
  display: flex;
  flex-flow: column;
  margin-left: 1rem;
  margin-top: 0.1rem;
  margin-bottom: 0.1rem;
}
</style>