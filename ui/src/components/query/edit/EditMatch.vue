<template>
  <!-- <div>{{ editMatch.description || editMatch.where?.[0].description }}</div> -->
  <!-- <div>{{ editMatch }}</div> -->
  <div v-if="property">
    {{ property?.["http://www.w3.org/ns/shacl#path"]?.[0].name ?? property?.["http://www.w3.org/ns/shacl#path"]?.[0]["@id"] }}:
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
  dataModelIri?: string;
  propertyIri?: string;
  editMatch: Match;
}

const props = defineProps<Props>();

watch(
  () => props.editMatch.where,
  () => describeMatch([props.editMatch], "match")
);

const property: Ref<TTProperty | undefined> = ref({} as TTProperty);
const where: Ref<Where> = ref({} as Where);

onMounted(async () => {
  where.value = isObjectHasKeys(props.editMatch, ["where"]) ? props.editMatch.where![0] : ({} as Where);
  if (props.dataModelIri && props.propertyIri) {
    const iri = resolveIri(props.dataModelIri);
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
    if (isArrayHasLength(entity[SHACL.PROPERTY])) {
      const properties = entity[SHACL.PROPERTY];
      const found = (properties as TTProperty[]).find(prop => prop["http://www.w3.org/ns/shacl#path"][0]["@id"] === props.propertyIri);
      property.value = found;
    }
  }
});
</script>

<style scoped></style>
