<template>
  <div class="set-definition-container">
    <SelectButton v-model="builderMode" :options="builderModeOptions" class="set-definition-mode-select" />
    <div class="set-definition-builder">
      <SetDefinitionForm v-if="builderMode === 'Form'" :clauses="clauses" />
      <SetDefinitionECL v-else="builderMode === 'ECL'" :ecl="ecl" @updateECL="updateECL" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, Ref, PropType, inject } from "vue";
import "vue-json-pretty/lib/styles.css";
import SetDefinitionForm from "./setDefinition/SetDefinitionForm.vue";
import SetDefinitionECL from "./setDefinition/SetDefinitionECL.vue";
import { PropertyGroup, Refinement, SetQueryObject, TTAlias, Query } from "@/im_library/interfaces";
import { EditorMode } from "@/im_library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@/im_library/helpers/modules/DataTypeCheckers";
import { SetService } from "@/im_library/services";
import _ from "lodash";
import injectionKeys from "@/injectionKeys/injectionKeys";

const props = defineProps({
  shape: { type: Object as PropType<PropertyGroup>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: Object as PropType<any>, required: false }
});

const builderMode: Ref<string> = ref("Form");
const imquery: Ref<Query> = ref({} as Query);
const ecl: Ref<string> = ref("");
const defaultTTAlias = { includeSubtypes: true } as TTAlias;
const clauses: Ref<SetQueryObject[]> = ref([]);
const builderModeOptions: Ref<string[]> = ref(["Form", "ECL"]);

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;

const key = props.shape.path["@id"];
const value = props.value ? JSON.parse(props.value) : {};

watch(ecl, async () => {
  if (builderMode.value === "ECL" && ecl.value) {
    const eclQuery = await SetService.getQueryFromECL(ecl.value);
    if (eclQuery) {
      const constructedClauses = await SetService.getSetQueryObjectFromQuery(eclQuery);
      clauses.value = constructedClauses;
    }
  }
});

watch(
  () => _.cloneDeep(clauses.value),
  async () => {
    imquery.value = await SetService.getQueryFromSetQueryObject(clauses.value);

    const queryIsNotDefault = JSON.stringify(imquery.value) !== JSON.stringify({ where: { from: [{ includeSubtypes: true }] } });
    if (builderMode.value === "Form" && isValidQuery(clauses.value) && queryIsNotDefault) {
      const convertedECL = await SetService.getECLFromQuery(imquery.value);
      if (convertedECL) {
        const isValid = await SetService.isValidECL(convertedECL);
        if (isValid) {
          ecl.value = convertedECL;
        }
      }
    }
  }
);

watch(
  () => _.cloneDeep(imquery.value),
  async () => {
    updateEntity();
    updateValidity();
  }
);

onMounted(async () => {
  addClause();
  if (isObjectHasKeys(value)) {
    const setQueryObject = await SetService.getSetQueryObjectFromQuery(value);
    if (isArrayHasLength(setQueryObject)) clauses.value = setQueryObject;
  }
});

async function updateValidity() {
  if (validityUpdate) {
    validityUpdate({ key: key, valid: true });
  }
}

function updateEntity() {
  if (entityUpdate) {
    const result = {} as any;
    result[key] = JSON.stringify(imquery.value);
    entityUpdate(result);
  }
}

function isValidQuery(clauses: SetQueryObject[]) {
  const conceptHasId = clauses.every(clause => isObjectHasKeys(clause?.concept, ["@id"]));
  const refinementsHaveIds = clauses.every(clause =>
    clause.refinements.every(refinement => isObjectHasKeys(refinement.property, ["@id"]) && isObjectHasKeys(refinement.is, ["@id"]))
  );
  return conceptHasId && refinementsHaveIds;
}

async function updateECL(data: string): Promise<void> {
  const isValid = await SetService.isValidECL(data);
  if (isValid) ecl.value = data;
}

function addClause() {
  const newObject = {
    include: true,
    concept: { ...defaultTTAlias },
    refinements: [] as Refinement[]
  } as SetQueryObject;
  clauses.value.push(newObject);
}
</script>

<style scoped>
.set-definition-builder {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  overflow: auto;
}

.set-definition-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  overflow: auto;
}

.set-definition-mode-select {
  align-self: center;
  padding: 2rem;
}
</style>
