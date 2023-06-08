<template>
  <div v-if="property">
    <div>{{ property?.["http://www.w3.org/ns/shacl#path"]?.[0].name ?? property?.["http://www.w3.org/ns/shacl#path"]?.[0]["@id"] }}:</div>
    <ClassSelect v-if="isObjectHasKeys(property, [SHACL.CLASS])" :class-iri="property[SHACL.CLASS][0]['@id']" />
    <DatatypeSelect v-else-if="isObjectHasKeys(property, [SHACL.DATATYPE])" :where="editMatch.where![0]" :datatype="property[SHACL.DATATYPE][0]['@id']" />
    <EntitySelect v-else />
  </div>
</template>

<script setup lang="ts">
import { Match, Where } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref, watch } from "vue";
import ClassSelect from "../clause/select/ClassSelect.vue";
import DatatypeSelect from "../clause/select/DatatypeSelect.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TTProperty } from "@im-library/interfaces";
import { resolveIri } from "@im-library/helpers/TTTransform";
import { EntityService } from "@/services";
import { SHACL } from "@im-library/vocabulary";
import EntitySelect from "../clause/select/EntitySelect.vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
interface Props {
  baseEntityIri: string;
  editMatch: Match;
}

const props = defineProps<Props>();

watch(
  () => props.editMatch.where,
  () => describeMatch([props.editMatch], "match")
);

const property: Ref<TTProperty | undefined> = ref({} as TTProperty);
const where: Ref<Where> = ref({} as Where);
const dataModelIri: Ref<string> = ref("");
const propertyIri: Ref<string> = ref("");

onMounted(async () => {
  dataModelIri.value = getDataModelIri(props.editMatch) ?? props.baseEntityIri;
  propertyIri.value = isObjectHasKeys(props.editMatch, ["where"]) ? props.editMatch.where?.[0]["@id"]! : "";
  where.value = isObjectHasKeys(props.editMatch, ["where"]) ? props.editMatch.where![0] : ({} as Where);

  if (dataModelIri.value && propertyIri.value) {
    const iri = resolveIri(dataModelIri.value);
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
    if (isArrayHasLength(entity[SHACL.PROPERTY])) {
      const properties = entity[SHACL.PROPERTY];
      const found = (properties as TTProperty[]).find(prop => prop["http://www.w3.org/ns/shacl#path"][0]["@id"] === propertyIri.value);
      property.value = found;
    }
  }
});

function getDataModelIri(match: Match) {
  if (!isObjectHasKeys(props.editMatch.path)) {
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
