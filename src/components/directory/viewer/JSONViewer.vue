<template>
  <div v-if="loading" class="loading-container flex flex-row items-center justify-center">
    <ProgressSpinner />
  </div>
  <VueJsonPretty v-else class="json" :path="'res'" :data="entityJSON.entity" @nodeClick="onClick" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import { IM } from "@endeavour/vue-library/enums";
import { isObjectHasKeys } from "@endeavour/vue-library/helpers";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

import { EntityService } from "@/services";

const props = defineProps<{
  entityIri: string;
}>();

const entityJSON = ref({ entity: {}, predicates: {} });
const { copyObjectToClipboard } = useCopyToClipboard();
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const response = await EntityService.getBundleByPredicateExclusions(props.entityIri, [IM.HAS_MEMBER]);
  if (isObjectHasKeys(response, ["entity"])) {
    if (isObjectHasKeys(response.entity, [IM.DEFINITION]) && typeof response.entity[IM.DEFINITION] === "string") {
      response.entity[IM.DEFINITION] = JSON.parse(response.entity[IM.DEFINITION]);
    } else if (isObjectHasKeys(response.entity, [IM.HAS_DATASET]) && typeof response.entity[IM.HAS_DATASET] === "string") {
      response.entity[IM.HAS_DATASET] = JSON.parse(response.entity[IM.HAS_DATASET]);
    }
    entityJSON.value = Object.freeze(response);
  }
  loading.value = false;
});

async function onClick() {
  await copyObjectToClipboard(navigator, entityJSON.value.entity);
}
</script>

<style scoped>
.loading-container {
  width: 100%;
  height: 20rem;
}
</style>
