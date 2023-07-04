<template>
  <div class="property-match-button-container">
    <div @click="editMatch.exclude = !editMatch.exclude" :class="editMatch.exclude ? 'exclude' : 'include'">
      {{ editMatch.exclude ? "exclude" : "include" }}
    </div>
  </div>
  <div v-if="isArrayHasLength(properties)" v-for="(property, index) in properties" class="property-container">
    <Divider v-if="index" align="center">
      <div :class="editMatch.boolWhere" @click="toggleBoolWhere">{{ editMatch.boolWhere }}</div>
    </Divider>
    <div class="remove-property">
      <Button icon="fa-solid fa-xmark" :severity="'danger'" @click="properties.splice(index, 1)"></Button>
    </div>
    <div v-if="property && isObjectHasKeys(property)">
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
      <!-- <EntitySelect v-else :edit-match="editMatch" :base-entity-match-iri="baseEntityMatchIri" /> -->
    </div>
  </div>
  <!-- <EntitySelect v-else :edit-match="editMatch" :base-entity-match-iri="baseEntityMatchIri" /> -->

  <Dialog v-model:visible="showAddProperty" modal :header="'Add property'" :style="{ width: '60vw' }">
    <AddPropertyDialog :match="editMatch" :base-type="baseEntityMatchIri" @on-close="showAddProperty = false" @on-add-property="addProperty" />
  </Dialog>

  <DirectorySearchDialog v-model:showDialog="showSearchDialog" @on-close="showSearchDialog = false" />

  <div class="button-bar">
    <Button class="button-bar-button" label="Cancel" severity="secondary" @click="emit('cancel')" />

    <Button class="button-bar-button" label="Save" @click="save" />
  </div>
</template>

<script setup lang="ts">
import { Bool, Match, Where } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref, watch } from "vue";
// import ClassSelect from "./edit/class/ClassSelect.vue";
import DatatypeSelect from "./edit/datatype/DatatypeSelect.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TTProperty } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { EntityService } from "@/services";
import { SHACL } from "@im-library/vocabulary";
import EntitySelect from "./edit/EntitySelect.vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import _ from "lodash";
import AddPropertyDialog from "./edit/AddPropertyDialog.vue";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
const emit = defineEmits({
  removeMatch: () => true,
  save: (_payload: Match) => true,
  cancel: () => true
});

interface Props {
  baseEntityMatchIri: string;
  match: Match;
}

const props = defineProps<Props>();
const editMatch: Ref<Match> = ref({} as Match);
const showAddProperty: Ref<boolean> = ref(false);
const showSearchDialog: Ref<boolean> = ref(false);
watch(
  () => editMatch.value.where,
  () => describeMatch([editMatch.value], "match")
);

const properties: Ref<TTProperty[]> = ref([]);
const dataModelIri: Ref<string> = ref("");

onMounted(async () => {
  await init();
});

function toggleBoolWhere() {
  if (editMatch.value.boolWhere === "and") editMatch.value.boolWhere = "or";
  else if (editMatch.value.boolWhere === "or") editMatch.value.boolWhere = "and";
}

async function addProperty(newMatch: Match) {
  if (!newMatch.boolWhere) newMatch.boolWhere = "and";
  if (isArrayHasLength(newMatch.where))
    for (const where of newMatch.where!) {
      const property = await getPropertyFromWhere(where);
      if (property && !hasProperty(properties.value, property)) properties.value.push(property);
    }
  editMatch.value.where = newMatch.where;
  showAddProperty.value = false;
}

function save() {
  emit("save", editMatch.value);
}

async function init() {
  editMatch.value = _.cloneDeep(props.match);
  const resolvedIri = resolveIri(props.baseEntityMatchIri);
  properties.value = [];
  dataModelIri.value = getDataModelIri(editMatch.value) ?? resolvedIri;
  if (isObjectHasKeys(editMatch.value, ["where"]) && isArrayHasLength(editMatch.value.where)) {
    for (const where of editMatch.value.where!) {
      const property = await getPropertyFromWhere(where);
      if (property) properties.value.push(property);
    }
  }
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

<style scoped>
.button-bar {
  display: flex;
  justify-content: end;
}

.property-container {
  display: flex;
  flex-flow: wrap;
  width: 100%;
}

.property-label {
  margin-bottom: 0.5rem;
}

.property-match-button-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0;
}

.property-input-container {
  display: flex;
  flex-flow: wrap;
  gap: 0.5rem;
}

.remove-property {
  display: flex;
  align-items: center;
  padding-right: 1rem;
}
</style>
