<template>
  <div v-if="loading" class="loading-container flex flex-row items-center justify-center">
    <ProgressSpinner />
  </div>
  <VueJsonPretty v-else class="json" :path="'res'" :data="entityJSON.entity" @nodeClick="onClick" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { EntityService } from "@/services";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { IM } from "@/vocabulary";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";

const props = defineProps<{
  entityIri: string;
}>();

const entityJSON = ref({ entity: {}, predicates: {} });
const { copyObjectToClipboard } = setupCopyToClipboard();
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const response = await EntityService.getBundleByPredicateExclusions(props.entityIri, [IM.HAS_MEMBER]);
  if (isObjectHasKeys(response, ["entity"])) {
    if (isObjectHasKeys(response.entity, [IM.DEFINITION])) response.entity[IM.DEFINITION] = JSON.parse(response.entity[IM.DEFINITION]);
    entityJSON.value = Object.freeze(response);
  }
  loading.value = false;
});

async function onClick() {
  copyObjectToClipboard(navigator, entityJSON.value.entity);
}
</script>

<style scoped>
.loading-container {
  width: 100%;
  height: 20rem;
}
</style>
