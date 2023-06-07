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
import { Match } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";
import ClassSelect from "../clause/select/ClassSelect.vue";
import DatatypeSelect from "../clause/select/DatatypeSelect.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TTProperty } from "@im-library/interfaces";
import { resolveIri } from "@im-library/helpers/TTTransform";
import { EntityService } from "@/services";
import { SHACL } from "@im-library/vocabulary";
import EntitySelect from "../clause/select/EntitySelect.vue";
interface Props {
  dataModelIri?: string;
  propertyIri?: string;
  editMatch: Match;
}

const property: Ref<TTProperty | undefined> = ref({} as TTProperty);

onMounted(async () => {
  if (props.dataModelIri && props.propertyIri) {
    const iri = resolveIri(props.dataModelIri);
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
    if (isArrayHasLength(entity[SHACL.PROPERTY])) {
      const properties = entity[SHACL.PROPERTY];
      const found = (properties as TTProperty[]).find(prop => prop["http://www.w3.org/ns/shacl#path"][0]["@id"] === props.propertyIri);
      property.value = found ?? undefined;
    }
  }
});

const props = defineProps<Props>();
</script>

<style scoped></style>
