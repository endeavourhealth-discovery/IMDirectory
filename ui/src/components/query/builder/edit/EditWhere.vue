<template>
  <div class="property-container">
    <div v-tooltip.right="property.toolTip" class="property-label">
      {{ property?.["http://www.w3.org/ns/shacl#path"]?.[0].name ?? property?.["http://www.w3.org/ns/shacl#path"]?.[0]["@id"] }}:
    </div>
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
import { EntityService } from "@/services";
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
}

const props = defineProps<Props>();
const editMatch: Ref<Match> = ref({} as Match);
const showAddProperty: Ref<boolean> = ref(false);
const showSearchDialog: Ref<boolean> = ref(false);
watch(
  () => editMatch.value.where,
  () => describeMatch([editMatch.value], "match")
);

const property: Ref<TTProperty> = ref({} as TTProperty);
const dataModelIri: Ref<string> = ref("");

onMounted(async () => {
  await init();
});

function toggleBoolWhere() {
  if (editMatch.value.boolWhere === "and") editMatch.value.boolWhere = "or";
  else if (editMatch.value.boolWhere === "or") editMatch.value.boolWhere = "and";
}

function save() {
  emit("save", editMatch.value);
}

async function init() {
  const resolvedIri = resolveIri(props.queryTypeIri);
  dataModelIri.value = getDataModelIri(editMatch.value) ?? resolvedIri;

  const propFromWhere = await getPropertyFromWhere(props.where);
  if (propFromWhere) property.value = propFromWhere;
}

function hasProperty(properties: TTProperty[], ttproperty: TTProperty) {
  const found = properties.find(property => property["http://www.w3.org/ns/shacl#path"][0]["@id"] === ttproperty["http://www.w3.org/ns/shacl#path"][0]["@id"]);
  return !!found;
}

async function getPropertyFromWhere(where: Where) {
  let property;
  const propertyIri = where["@id"];
  if (dataModelIri.value && propertyIri) {
    const iri = resolveIri(dataModelIri.value);
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
    if (isArrayHasLength(entity[SHACL.PROPERTY])) {
      const ttproperties = entity[SHACL.PROPERTY];
      const found = (ttproperties as TTProperty[]).find(prop => prop["http://www.w3.org/ns/shacl#path"][0]["@id"] === propertyIri);
      if (found) {
        property = found;
        property.tooltip = getTooltip(property);
        property.where = where;
        return property;
      }
    }
  }
}

function getTooltip(property: TTProperty) {
  let tooltip = "";
  if (isObjectHasKeys(property, [SHACL.CLASS])) tooltip += "with range of " + getNameFromRef(property["http://www.w3.org/ns/shacl#class"]![0]);
  else if (isObjectHasKeys(property, [SHACL.DATATYPE])) tooltip += "with datatype of " + getNameFromRef(property["http://www.w3.org/ns/shacl#datatype"]![0]);
  else if (isObjectHasKeys(property, [SHACL.NODE])) tooltip += "with range of data model " + getNameFromRef(property["http://www.w3.org/ns/shacl#node"]![0]);
  return tooltip;
}

function getDataModelIri(match: Match) {
  if (!isObjectHasKeys(editMatch.value.path)) {
    return undefined;
  }
  const found: string[] = [];
  getLastNode(match.path, found);
  return found[0] ?? undefined;
}

function getLastNode(pathOrNode: any, found: string[]) {
  if (pathOrNode.node) getLastNode(pathOrNode.node, found);
  else if (pathOrNode.path) getLastNode(pathOrNode.path, found);
  else if (isObjectHasKeys(pathOrNode, ["@type"])) found.push(pathOrNode["@type"]);
}
</script>

<style scoped></style>
