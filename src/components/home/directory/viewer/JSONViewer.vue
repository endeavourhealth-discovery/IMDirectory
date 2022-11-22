<template>
  <VueJsonPretty class="json" :path="'res'" :data="entityJSON.entity" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { Services, Helpers } from "im-library";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
const {
  DataTypeCheckers: { isObjectHasKeys }
} = Helpers;
const { EntityService } = Services;
const props = defineProps({ conceptIri: { type: String, required: true } });
const entityService = new EntityService(axios);
const entityJSON = ref({ entity: {}, predicates: {} });
onMounted(async () => {
  const response = await entityService.getBundleByPredicateExclusions(props.conceptIri, []);
  if (isObjectHasKeys(response, ["entity"])) {
    entityJSON.value = response;
  }
});
</script>

<style scoped></style>
