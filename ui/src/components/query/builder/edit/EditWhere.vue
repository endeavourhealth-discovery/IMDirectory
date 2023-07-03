<template>
  <div class="property-container">
    <span v-tooltip.right="property.toolTip" class="property-label">
      {{ property?.["http://www.w3.org/ns/shacl#path"]?.[0].name ?? property?.["http://www.w3.org/ns/shacl#path"]?.[0]["@id"] }}:
    </span>
    <ClassSelect
      v-if="isObjectHasKeys(property, [SHACL.CLASS])"
      :class-iri="property[SHACL.CLASS][0]['@id']"
      :where="property.where"
      class="property-input-container"
    />
    <DatatypeSelect
      v-else-if="isObjectHasKeys(property, [SHACL.DATATYPE])"
      :datatype="property[SHACL.DATATYPE][0]['@id']"
      :where="property.where"
      class="property-input-container"
    />
    <EntitySelect v-else :edit-node="property.where" :query-type-iri="queryTypeIri" />
  </div>

  <div class="button-bar">
    <Button class="button-bar-button" label="Cancel" severity="secondary" @click="emit('onCancel')" />
    <Button class="button-bar-button" label="Save" @click="save" />
  </div>
</template>

<script setup lang="ts">
import { Bool, Match, Where } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref, watch } from "vue";
import ClassSelect from "./class/ClassSelect.vue";
import DatatypeSelect from "./datatype/DatatypeSelect.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TTProperty } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { EntityService, QueryService } from "@/services";
import { SHACL } from "@im-library/vocabulary";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import _ from "lodash";
import EntitySelect from "./EntitySelect.vue";
const emit = defineEmits({
  removeMatch: () => true,
  save: (_payload: Match) => true,
  onCancel: () => true
});

interface Props {
  queryTypeIri: string;
  where: Where;
  match?: Match;
}

const props = defineProps<Props>();
const property: Ref<TTProperty> = ref({} as TTProperty);
const tooltip: Ref<string> = ref("");
const propertyDisplay: Ref<string> = ref("");

onMounted(async () => {
  await init();
});

async function init() {
  const dataModelIri = props.match?.["@id"] ?? resolveIri(props.queryTypeIri);

  if (dataModelIri && props.where["@id"]) {
    const ttproperties: any = await QueryService.getDataModelProperty(dataModelIri, props.where["@id"]);
    if (isArrayHasLength(ttproperties)) {
      tooltip.value = getTooltip(ttproperties[0]);
      property.value = ttproperties[0];
      property.value.where = props.where;
    }
  }
}

function getPropertyDisplay() {}

function getTooltip(property: TTProperty) {
  let tooltip = "";
  if (isObjectHasKeys(property, [SHACL.CLASS])) tooltip += "with range of " + getNameFromRef(property["http://www.w3.org/ns/shacl#class"]![0]);
  else if (isObjectHasKeys(property, [SHACL.DATATYPE])) tooltip += "with datatype of " + getNameFromRef(property["http://www.w3.org/ns/shacl#datatype"]![0]);
  else if (isObjectHasKeys(property, [SHACL.NODE])) tooltip += "with range of data model " + getNameFromRef(property["http://www.w3.org/ns/shacl#node"]![0]);
  return tooltip;
}
</script>

<style scoped></style>
