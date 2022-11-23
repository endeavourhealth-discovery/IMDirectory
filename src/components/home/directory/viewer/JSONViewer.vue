<template>
  <VueJsonPretty class="json" :path="'res'" :data="entityJSON.entity" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { EntityService } from "@/im_library/services";
import { DataTypeCheckers } from "@/im_library/helpers";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
const { isObjectHasKeys } = DataTypeCheckers;

const props = defineProps({ conceptIri: { type: String, required: true } });
const entityJSON = ref({ entity: {}, predicates: {} });
onMounted(async () => {
  const response = await EntityService.getBundleByPredicateExclusions(props.conceptIri, []);
  if (isObjectHasKeys(response, ["entity"])) {
    entityJSON.value = response;
  }
});
</script>

<style scoped></style>
