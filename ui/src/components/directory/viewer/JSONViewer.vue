<template>
  <VueJsonPretty class="json" :path="'res'" :data="entityJSON.entity" @nodeClick="copy" />
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

const toast = useToast();
const props = defineProps({ conceptIri: { type: String, required: true } });
const entityJSON = ref({ entity: {}, predicates: {} });
onMounted(async () => {
  const response = await EntityService.getBundleByPredicateExclusions(props.conceptIri, []);
  if (isObjectHasKeys(response, ["entity"])) {
    if (isObjectHasKeys(response.entity, [IM.DEFINITION])) response.entity[IM.DEFINITION] = JSON.parse(response.entity[IM.DEFINITION]);
    entityJSON.value = response;
  }
});

async function copy() {
  await navigator.clipboard.writeText(JSON.stringify(entityJSON.value.entity));
  toast.add(new ToastOptions(ToastSeverity.SUCCESS, "JSON value copied to clipboard"));
}
</script>

<style scoped></style>
