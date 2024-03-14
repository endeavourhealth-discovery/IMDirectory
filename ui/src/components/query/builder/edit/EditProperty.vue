<template>
  <div class="property-container">
    <div v-tooltip.right="tooltip" class="property-label">{{ getNameFromRef(property) }}:</div>
    <ClassSelect v-if="isObjectHasKeys(ttproperty, [SHACL.CLASS])" :class-iri="ttproperty[SHACL.CLASS]![0]['@id']" :property="ttproperty.property" />
    <DatatypeSelect
      v-else-if="isObjectHasKeys(ttproperty, [SHACL.DATATYPE])"
      :datatype="ttproperty[SHACL.DATATYPE]![0]['@id']"
      :property="ttproperty.property"
    />
    <ClassSelect v-else-if="isObjectHasKeys(ttproperty, [SHACL.NODE])" :class-iri="ttproperty[SHACL.NODE]![0]['@id']" :property="ttproperty.property" />
    <EntitySelect v-else :edit-node="ttproperty.property" />
  </div>

  <div class="button-bar">
    <Button class="button-bar-button" label="Cancel" severity="secondary" @click="emit('onCancel')" />
    <Button class="button-bar-button" label="Save" @click="emit('onSave')" />
  </div>
</template>

<script setup lang="ts">
import { Match, Where } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref, ComputedRef, computed } from "vue";
import ClassSelect from "./class/ClassSelect.vue";
import DatatypeSelect from "./datatype/DatatypeSelect.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TTProperty } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { QueryService } from "@/services";
import { SHACL } from "@im-library/vocabulary";
import EntitySelect from "./EntitySelect.vue";
import { useQueryStore } from "@/stores/queryStore";

const emit = defineEmits({
  removeMatch: () => true,
  onSave: () => true,
  onCancel: () => true
});

interface Props {
  property: Where;
  match?: Match;
  dataModelIri: string;
}

const props = defineProps<Props>();
const queryStore = useQueryStore();
const ttproperty: Ref<TTProperty> = ref({} as TTProperty);
const tooltip: Ref<string> = ref("");
const variableMap: ComputedRef<Map<string, any>> = computed(() => queryStore.$state.variableMap);

onMounted(async () => {
  await init();
});

async function init() {
  let dataModelIri = props.dataModelIri;
  const matchRef = getMatchNodeRef();
  if (isObjectHasKeys(props.match, ["nodeRef"]) && props.match?.nodeRef) {
    dataModelIri = variableMap.value.get(props.match.nodeRef).typeOf["@id"];
  } else if (matchRef) {
    dataModelIri = variableMap.value.get(matchRef).typeOf["@id"];
  }

  if (dataModelIri && props.property["@id"]) {
    const ttproperties: any = await QueryService.getDataModelProperty(dataModelIri, props.property["@id"]);
    if (isArrayHasLength(ttproperties)) {
      tooltip.value = getTooltip(ttproperties[0]);
      ttproperty.value = ttproperties[0];
      ttproperty.value.property = props.property;
    }
  }
}

function getTooltip(ttproperty: TTProperty) {
  let tooltip = "";
  if (isObjectHasKeys(ttproperty, [SHACL.CLASS])) tooltip += "with range of " + getNameFromRef(ttproperty["http://www.w3.org/ns/shacl#class"]![0]);
  else if (isObjectHasKeys(ttproperty, [SHACL.DATATYPE]))
    tooltip += "with datatype of " + getNameFromRef(ttproperty["http://www.w3.org/ns/shacl#datatype"]![0]);
  else if (isObjectHasKeys(ttproperty, [SHACL.NODE]))
    tooltip += "with range of data model " + getNameFromRef(ttproperty["http://www.w3.org/ns/shacl#node"]![0]);
  return tooltip;
}

function getMatchNodeRef() {
  // TODO: check string for identifier
  let foundMatch;
  for (const [key, match] of variableMap.value.entries()) {
    if (isChildOfMatch(match)) foundMatch = match;
  }
  if (isObjectHasKeys(foundMatch, ["nodeRef"])) return foundMatch.nodeRef;
  return undefined;
}

function isChildOfMatch(parentMatch: Match): boolean {
  if (!isArrayHasLength(parentMatch.match)) return false;
  let found = parentMatch.match?.some(child => JSON.stringify(child) === JSON.stringify(props.match));
  const hasGrandChildren = parentMatch.match?.some(child => isArrayHasLength(child.match));

  if (!found && hasGrandChildren) {
    for (const child of parentMatch.match!) {
      found = isChildOfMatch(child);
    }
  }

  return !!found;
}
</script>

<style scoped>
.property-container {
  margin-left: 1rem;
}
.property-input-container {
  margin-left: 0 !important;
}
.property-label {
  margin-bottom: 0.5rem !important;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}
</style>
