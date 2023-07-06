<template>
  <div class="property-container">
    <span v-tooltip.right="ttproperty.toolTip" class="property-label">
      {{ ttproperty?.["http://www.w3.org/ns/shacl#path"]?.[0].name ?? ttproperty?.["http://www.w3.org/ns/shacl#path"]?.[0]["@id"] }}:
    </span>
    <ClassSelect
      v-if="isObjectHasKeys(ttproperty, [SHACL.CLASS])"
      :class-iri="ttproperty[SHACL.CLASS][0]['@id']"
      :property="ttproperty.property"
      class="property-input-container"
    />
    <DatatypeSelect
      v-else-if="isObjectHasKeys(ttproperty, [SHACL.DATATYPE])"
      :datatype="ttproperty[SHACL.DATATYPE][0]['@id']"
      :property="ttproperty.property"
      class="property-input-container"
    />
    <EntitySelect v-else :edit-node="ttproperty.property" :query-type-iri="queryTypeIri" />
  </div>

  <div class="button-bar">
    <Button class="button-bar-button" label="Cancel" severity="secondary" @click="emit('onCancel')" />
    <Button class="button-bar-button" label="Save" @click="emit('onSave')" />
  </div>
</template>

<script setup lang="ts">
import { Match, Property } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";
import ClassSelect from "./class/ClassSelect.vue";
import DatatypeSelect from "./datatype/DatatypeSelect.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TTProperty } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { QueryService } from "@/services";
import { SHACL } from "@im-library/vocabulary";
import _ from "lodash";
import EntitySelect from "./EntitySelect.vue";
const emit = defineEmits({
  removeMatch: () => true,
  onSave: () => true,
  onCancel: () => true
});

interface Props {
  queryTypeIri: string;
  property: Property;
  match?: Match;
}

const props = defineProps<Props>();
const ttproperty: Ref<TTProperty> = ref({} as TTProperty);
const tooltip: Ref<string> = ref("");
const propertyDisplay: Ref<string> = ref("");

onMounted(async () => {
  await init();
});

async function init() {
  const dataModelIri = props.match?.["@id"] ?? resolveIri(props.queryTypeIri);

  if (dataModelIri && props.property["@id"]) {
    const ttproperties: any = await QueryService.getDataModelProperty(dataModelIri, props.property["@id"]);
    if (isArrayHasLength(ttproperties)) {
      tooltip.value = getTooltip(ttproperties[0]);
      ttproperty.value = ttproperties[0];
      ttproperty.value.property = props.property;
    }
  }
}

function getPropertyDisplay() {}

function getTooltip(ttproperty: TTProperty) {
  let tooltip = "";
  if (isObjectHasKeys(ttproperty, [SHACL.CLASS])) tooltip += "with range of " + getNameFromRef(ttproperty["http://www.w3.org/ns/shacl#class"]![0]);
  else if (isObjectHasKeys(ttproperty, [SHACL.DATATYPE]))
    tooltip += "with datatype of " + getNameFromRef(ttproperty["http://www.w3.org/ns/shacl#datatype"]![0]);
  else if (isObjectHasKeys(ttproperty, [SHACL.NODE]))
    tooltip += "with range of data model " + getNameFromRef(ttproperty["http://www.w3.org/ns/shacl#node"]![0]);
  return tooltip;
}
</script>

<style scoped></style>
