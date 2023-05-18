<template>
  <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
    <ProgressSpinner />
  </div>
  <VueJsonPretty v-else class="json" :path="'res'" :data="entityJSON.entity" @nodeClick="copy" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { EntityService } from "@/services";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";
import { IM } from "@im-library/vocabulary";

interface Props {
  conceptIri: string;
}
const props = defineProps<Props>();

const toast = useToast();
const entityJSON = ref({ entity: {}, predicates: {} });
const loading = ref(false);
onMounted(async () => {
  loading.value = true;
  const response = await EntityService.getBundleByPredicateExclusions(props.conceptIri, []);
  if (isObjectHasKeys(response, ["entity"])) {
    if (isObjectHasKeys(response.entity, [IM.DEFINITION])) response.entity[IM.DEFINITION] = JSON.parse(response.entity[IM.DEFINITION]);
    entityJSON.value = Object.freeze(response);
  }
  loading.value = false;
});

async function copy() {
  await navigator.clipboard.writeText(JSON.stringify(entityJSON.value.entity));
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "JSON value copied to clipboard"));
}
</script>

<style scoped>
.loading-container {
  width: 100%;
  height: 20rem;
}
</style>
