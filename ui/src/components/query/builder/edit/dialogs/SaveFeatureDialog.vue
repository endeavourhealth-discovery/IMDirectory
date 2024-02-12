<template>
  <Dialog
    v-model:visible="showSaveFeatureDialog"
    modal
    header="Save feature"
    :style="{ minWidth: '25vw', maxWidth: '50vw', backgroundColor: 'var(--surface-section)' }"
  >
    <form @submit="onSubmit" class="flex flex-column gap-2 save-feature-form">
      <div class="flex flex-column gap-2" id="save-feature-full-iri">
        <span id="save-feature-iri-header">Iri</span>
        <InputText :model-value="fullIri" type="text" disabled />
        <small class="p-error" id="text-error">{{ errors.iri || "&nbsp;" }}</small>
      </div>

      <div class="flex flex-column gap-2" id="save-feature-scheme-iri">
        <span id="save-feature-scheme-header">Scheme</span>
        <Dropdown
          id="scheme"
          v-bind="scheme"
          type="text"
          :class="{ 'p-invalid': errors.scheme }"
          aria-describedby="text-error"
          :options="schemeOptions"
          option-label="name"
          option-value="@id"
          placeholder="Scheme"
          class="flex-1"
        />
        <small class="p-error flex-1" id="text-error">{{ errors.scheme || "&nbsp;" }}</small>
      </div>

      <div class="flex flex-column gap-2" id="save-feature-name">
        <span id="save-feature-name-header">Name</span>
        <InputText id="name" v-bind="name" type="text" :class="{ 'p-invalid': errors.name }" aria-describedby="text-error" />
        <small class="p-error" id="text-error">{{ errors.name || "&nbsp;" }}</small>
      </div>

      <span id="definition-title">Definition</span>
      <div class="save-feature-query-display"><QueryDisplay :definition="definition" /></div>
    </form>

    <template #footer>
      <Button label="Discard" severity="secondary" @click="onDiscard" text />
      <Button type="submit" text label="Submit" @click="onSubmit" :loading="loading" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import { useForm } from "vee-validate";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Node, TTIriRef, Match } from "@im-library/interfaces/AutoGen";
import { EntityService, FilerService, FunctionService, QueryService } from "@/services";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { useToast } from "primevue/usetoast";
import * as yup from "yup";
import QueryDisplay from "@/components/directory/viewer/QueryDisplay.vue";

interface Props {
  showDialog: boolean;
  feature: Match;
}

const props = defineProps<Props>();

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean"
});
const schema = yup.object({
  scheme: yup
    .string()
    .required()
    .label("Scheme")
    .default(IM.NAMESPACE + "M_"), // TODO: add to IM vocab
  iri: yup
    .string()
    .required()
    .test("isValidIri", "Iri exists", async () => await isValidIri())
    .label("Iri"),
  name: yup.string().required().label("Name"),
  type: yup.string().required().label("Type").default(IM.FEATURE)
});

const toast = useToast();

const { defineComponentBinds, handleSubmit, resetForm, errors, setFieldValue } = useForm({
  validationSchema: schema
});

const fullIri: ComputedRef<string> = computed(() => `${scheme.value.modelValue ?? ""}${iri.value.modelValue ?? ""}`);

const scheme = defineComponentBinds("scheme");
const iri = defineComponentBinds("iri");
const name = defineComponentBinds("name");

const schemeOptions: Ref<TTIriRef[]> = ref([]);
const showSaveFeatureDialog = ref(false);
const loading = ref(false);
const definition = ref("");

watch(showSaveFeatureDialog, async newValue => {
  if (newValue) await init();
  else emit("update:showDialog", newValue);
});

watch(
  () => name.value,
  () => onNameGenIri()
);

watch(
  () => props.showDialog,
  newValue => {
    showSaveFeatureDialog.value = newValue;
  }
);

onMounted(async () => {
  await init();
});

async function init() {
  schemeOptions.value = await getSchemeOptions();
  selectDefaults();
  definition.value = getDefinition();
}

async function isValidIri() {
  if (!scheme.value.modelValue) return false;
  const exists = await EntityService.iriExists(fullIri.value);
  return !exists;
}

async function getSchemeOptions(): Promise<TTIriRef[]> {
  return await FunctionService.runFunction(IM.NAMESPACE + "Function_GetUserEditableSchemes"); // TODO: add to IM FUNCTION vocab
}

function onNameGenIri() {
  if (name.value?.modelValue) {
    const nameValue: string = name.value.modelValue;
    setFieldValue("iri", nameValue.replaceAll(" ", ""));
  }
}

function selectDefaults() {
  if (isArrayHasLength(schemeOptions.value)) setFieldValue("scheme", schemeOptions.value[0]["@id"]);
  else setFieldValue("scheme", IM.NAMESPACE);
}

const onSubmit = handleSubmit(async () => {
  loading.value = true;
  const setEntity = buildSetEntity();
  try {
    await FilerService.fileEntity(setEntity, IM.NAMESPACE, IM.ADD_QUADS);
    const createdEntity = await EntityService.getFullEntity(setEntity["@id"]);
    if (isObjectHasKeys(createdEntity, [RDFS.LABEL, RDF.TYPE, IM.HAS_STATUS, IM.HAS_SCHEME, IM.IS_CONTAINED_IN, IM.DEFINITION]))
      toast.add({ severity: "success", summary: "Created", detail: "Created " + createdEntity[RDFS.LABEL], life: 3000 });
  } catch (e: any) {
    loading.value = false;
    toast.add({ severity: "error", summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
  }
  loading.value = false;
  showSaveFeatureDialog.value = false;
});

function onDiscard() {
  resetForm();
  showSaveFeatureDialog.value = false;
}

function getDefinition() {
  const definition = {
    match: [props.feature] as Match[]
  };
  return JSON.stringify(definition);
}

function buildSetEntity() {
  const setEntity = {} as any;
  setEntity["@id"] = fullIri.value;
  setEntity[RDFS.LABEL] = name.value.modelValue;
  setEntity[RDF.TYPE] = [{ "@id": IM.FEATURE }];
  setEntity[IM.HAS_STATUS] = [{ "@id": IM.DRAFT }];
  setEntity[IM.HAS_SCHEME] = [{ "@id": scheme.value.modelValue }];
  setEntity[IM.IS_CONTAINED_IN] = [{ "@id": IM.NAMESPACE + "M_CommonClauses" }]; // TODO: add to IM vocab
  setEntity[IM.DEFINITION] = definition.value;
  return setEntity;
}
</script>

<style scoped>
.save-feature-form {
  width: 100%;
}

.save-feature-query-display {
  height: 60%;
}
</style>
