<template>
  <div @click="editMatch.exclude = !editMatch.exclude" :class="editMatch.exclude ? 'exclude' : 'include'">
    {{ editMatch.exclude ? "exclude" : "include" }}
  </div>
  <div v-if="isArrayHasLength(properties)" v-for="(property, index) in properties" class="property-container">
    <Divider v-if="index" align="center">
      <div :class="editBoolWhere" @click="toggleBoolWhere">{{ editBoolWhere }}</div>
    </Divider>
    <Button class="property-delete-button" icon="fa-solid fa-xmark" :severity="'danger'" @click="deleteProperty"></Button>
    <div v-if="property && isObjectHasKeys(property)">
      <div v-tooltip.right="property.toolTip">
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
      <EntitySelect v-else :edit-match="editMatch" :base-entity-match="baseEntityMatch" />
    </div>
  </div>
  <EntitySelect v-else :edit-match="editMatch" :base-entity-match="baseEntityMatch" />

  <div class="button-bar">
    <Button class="button-bar-button" label="Cancel" severity="secondary" @click="emit('cancel')" />
    <Button class="button-bar-button" label="Save" @click="emit('save', editMatch)" />
  </div>
</template>

<script setup lang="ts">
import { Bool, Match } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref, watch } from "vue";
import ClassSelect from "../clause/select/ClassSelect.vue";
import DatatypeSelect from "../clause/select/DatatypeSelect.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TTProperty } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { EntityService } from "@/services";
import { SHACL } from "@im-library/vocabulary";
import EntitySelect from "../clause/select/EntitySelect.vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import _ from "lodash";
const emit = defineEmits({
  removeProperty: (_payload: Match, _flag: boolean) => true,
  save: (_payload: Match) => true,
  cancel: () => true
});

interface Props {
  baseEntityMatch: Match;
  match: Match;
}

const props = defineProps<Props>();
const editMatch: Ref<Match> = ref({} as Match);

watch(
  () => editMatch.value.where,
  () => describeMatch([editMatch.value], "match")
);

const editBoolWhere: Ref<Bool> = ref("and");
const properties: Ref<TTProperty[]> = ref([]);
const dataModelIri: Ref<string> = ref("");

onMounted(async () => {
  await init();
});

function deleteProperty() {
  emit("removeProperty", editMatch.value, true);
}

function toggleBoolWhere() {
  if (editBoolWhere.value === "and") editBoolWhere.value = "or";
  else if (editBoolWhere.value === "or") editBoolWhere.value = "and";
}

async function init() {
  editMatch.value = _.cloneDeep(props.match);
  const iri = (props.baseEntityMatch["@id"] || props.baseEntityMatch["@set"] || props.baseEntityMatch["@type"]) as string;
  const resolvedIri = resolveIri(iri);
  properties.value = [];
  dataModelIri.value = getDataModelIri(editMatch.value) ?? resolvedIri;
  if (isObjectHasKeys(editMatch.value, ["where"]) && isArrayHasLength(editMatch.value.where)) {
    for (const where of editMatch.value.where!) {
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
            properties.value.push(property);
          }
        }
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

<style scoped>
.property-delete-button {
  position: relative;
  top: 0;
  right: 0;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.property-container {
  display: flex;
  flex-flow: wrap;
  width: 100%;
}

.property-label-button-container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.property-input-container {
  display: flex;
  width: 100%;
  gap: 0.5rem;
}
</style>
