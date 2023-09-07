<template>
  <div id="cohort-query-definition-editor">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <CohortEditor v-else v-model:queryDefinition="queryDefinition" />
  </div>
</template>

<script setup lang="ts">
import CohortEditor from "@/components/query/builder/CohortEditor.vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { QueryService } from "@/services";
import { resolveIri } from "@im-library/helpers/TTTransform";
import { Match, Query } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { cloneDeep } from "lodash";
import { ComputedRef, Ref, computed, inject, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const queryIri: ComputedRef<string> = computed(() => route.params.selectedIri as string);
const loading = ref(true);
const queryDefinition: Ref<Query> = ref({ match: [] as Match[] } as Query);
const validationErrorMessage: Ref<string | undefined> = ref();
const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;

if (forceValidation) {
  watch(forceValidation, () => {
    validateEntity();
  });
}

watch(
  () => cloneDeep(queryDefinition.value),
  () => update()
);

async function update() {
  validateEntity();
  if (!validationErrorMessage.value) updateEntity();
}

onMounted(async () => {
  await init();
});

watch(
  () => queryIri.value,
  async () => await init()
);

async function init() {
  await setQuery();
  loading.value = false;
}

async function setQuery() {
  const resolvedIri = resolveIri(queryIri.value);
  if (resolvedIri) queryDefinition.value = await QueryService.getQueryDisplay(resolvedIri);
}

function validateEntity() {
  validationErrorMessage.value = undefined;
}

function updateEntity() {
  const imDefinition: any = {};
  imDefinition[IM.DEFINITION] = JSON.stringify(cloneDeep(queryDefinition.value));
  if (entityUpdate) entityUpdate(imDefinition);
}
</script>

<style>
#cohort-query-definition-editor {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column;
}
</style>
