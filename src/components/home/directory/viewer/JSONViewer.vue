<template>
  <VueJsonPretty class="json" :path="'res'" :data="entityJSON.entity" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { Services } from "im-library";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
const { EntityService } = Services;
const props = defineProps({ conceptIri: { type: String, required: true } });
const entityService = new EntityService(axios);
const entityJSON = ref({ entity: {}, predicates: {} });
onMounted(async () => {
  entityJSON.value = await entityService.getBundleByPredicateExclusions(props.conceptIri, []);
});
</script>

<style scoped></style>
