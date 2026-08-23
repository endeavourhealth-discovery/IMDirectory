<template>
  <div v-if="loading" class="loading-container flex flex-row items-center justify-center">
    <ProgressSpinner />
  </div>
  <VueJsonPretty v-else :data="entityJSON.entity" :path="'res'" class="json" @nodeClick="onClick" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import { DisplayMode, IM } from "@endeavour/vue-library/enums";
import { isObjectHasKeys } from "@endeavour/vue-library/helpers";
import type { Query } from "@endeavour/vue-library/models";

import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

import { EntityService, QueryService } from "@/services";

const props = defineProps<{
  entityIri: string;
  viewerDisplayMode?: DisplayMode;
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
      if (props.viewerDisplayMode != DisplayMode.ORIGINAL) {
        const query = response.entity[IM.DEFINITION] as Query;
        response.entity[IM.DEFINITION] = await QueryService.getQueryDisplayFromQuery(
          query,
          props.viewerDisplayMode ? props.viewerDisplayMode : DisplayMode.ORIGINAL
        );
      }
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
