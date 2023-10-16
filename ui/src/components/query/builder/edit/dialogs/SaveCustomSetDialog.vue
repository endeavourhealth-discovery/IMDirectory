<template>
  <Button label="Save custom set" text severity="info" @click="showSaveCustomSetDialog = true" />
  <Dialog v-model:visible="showSaveCustomSetDialog" modal header="Save custom set" :style="{ maxWidth: '50vw', backgroundColor: 'var(--surface-section)' }">
    <form @submit="onSubmit" class="flex flex-column gap-2">
      <div class="flex flex-column" id="save-set-scheme-iri">
        <span id="save-set-scheme-header">Scheme</span>
        <div class="flex" id="save-set-graph-iri">
          <div class="flex flex-column flex-auto" id="save-set-graph">
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

          <div class="flex flex-column flex-auto" id="save-set-iri">
            <InputText id="iri" v-bind="iri" type="text" :class="{ 'p-invalid': errors.iri }" aria-describedby="text-error" />
            <small class="p-error" id="text-error">{{ errors.iri || "&nbsp;" }}</small>
          </div>
        </div>
      </div>

      <div class="flex flex-column gap-2" id="save-set-full-iri">
        <span id="save-set-iri-header">Iri</span>
        <InputText :model-value="fullIri" type="text" disabled />
      </div>

      <div class="flex flex-column gap-2" id="save-set-name">
        <span id="save-set-name-header">Name</span>
        <div class="p-inputgroup flex-1">
          <InputText id="name" v-bind="name" type="text" :class="{ 'p-invalid': errors.name }" aria-describedby="text-error" />
          <Button severity="warning" label="Generate iri" @click="onNameGenIri()" :disabled="!name.modelValue" />
        </div>
        <small class="p-error" id="text-error">{{ errors.name || "&nbsp;" }}</small>
      </div>

      <div class="flex flex-column gap-2" id="save-set-type">
        <span id="save-set-type-header">Type</span>

        <Dropdown
          id="type"
          v-bind="type"
          type="text"
          :class="{ 'p-invalid': errors.type }"
          aria-describedby="text-error"
          :options="typeOptions"
          option-label="name"
          option-value="@id"
        />
        <small class="p-error" id="text-error">{{ errors.type || "&nbsp;" }}</small>
      </div>

      <span id="members-title">Members</span>
      <Listbox v-model="selectedMember" :options="setMembers" optionLabel="name" class="flex flex-column" />
    </form>

    <template #footer>
      <Button label="Discard" severity="secondary" @click="onDiscard" text />
      <Button type="submit" text label="Submit" @click="onSubmit" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import { useForm } from "vee-validate";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Node, TTIriRef, Match } from "@im-library/interfaces/AutoGen";
import { EntityService, FilerService } from "@/services";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { useToast } from "primevue/usetoast";
import * as yup from "yup";

interface Props {
  setMembers: Node[];
}
const props = defineProps<Props>();

const schema = yup.object({
  scheme: yup.string().required().label("Scheme").default(IM.NAMESPACE),
  iri: yup
    .string()
    .required()
    .test("isValidIri", "Iri exists", async () => await isValidIri())
    .label("Iri"),
  name: yup.string().required().label("Name"),
  type: yup.string().required().label("Type").default(IM.CONCEPT_SET)
});

const toast = useToast();

const { defineComponentBinds, handleSubmit, resetForm, errors, setFieldValue } = useForm({
  validationSchema: schema
});

const fullIri: ComputedRef<string> = computed(() => `${scheme.value.modelValue ?? ""}${iri.value.modelValue ?? ""}`);

const scheme = defineComponentBinds("scheme");
const iri = defineComponentBinds("iri");
const name = defineComponentBinds("name");
const type = defineComponentBinds("type");

const schemeOptions: Ref<TTIriRef[]> = ref([]);
const typeOptions: Ref<TTIriRef[]> = ref([]);
const selectedMember: Ref<Node> = ref({});
const showSaveCustomSetDialog = ref(false);

watch(
  () => showSaveCustomSetDialog.value,
  async () => await init()
);

onMounted(async () => {
  await init();
});

async function init() {
  typeOptions.value = await getTypeOptions();
  schemeOptions.value = await getSchemeOptions();
  selectDefaults();
}

async function isValidIri() {
  if (!scheme.value.modelValue) return false;
  const exists = await EntityService.iriExists(fullIri.value);
  return !exists;
}

async function getTypeOptions(): Promise<TTIriRef[]> {
  const setTypes = await EntityService.getEntityChildren(IM.SET);
  return setTypes.map(setType => {
    return {
      "@id": setType["@id"],
      name: setType.name
    };
  });
}

async function getSchemeOptions(): Promise<TTIriRef[]> {
  const schemes = await EntityService.getEntityChildren(IM.GRAPH);
  return schemes.map(scheme => {
    return {
      "@id": scheme["@id"],
      name: scheme.name
    };
  });
}

function onNameGenIri() {
  setFieldValue("iri", name.value.modelValue);
}

function selectDefaults() {
  setFieldValue("scheme", IM.NAMESPACE);
  setFieldValue("type", IM.CONCEPT_SET);
}

const onSubmit = handleSubmit(async () => {
  const setEntity = buildSetEntity();
  try {
    await FilerService.fileEntity(setEntity, IM.NAMESPACE, IM.ADD_QUADS);
    const createdEntity = await EntityService.getFullEntity(setEntity["@id"]);
    if (isObjectHasKeys(createdEntity, [RDFS.LABEL, RDF.TYPE, IM.HAS_STATUS, IM.SCHEME, IM.IS_CONTAINED_IN, IM.DEFINITION]))
      toast.add({ severity: "success", summary: "Created", detail: "Created " + createdEntity[RDFS.LABEL], life: 3000 });
  } catch (e: any) {
    toast.add({ severity: "error", summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
  }
  showSaveCustomSetDialog.value = false;
});

function onDiscard() {
  resetForm();
  showSaveCustomSetDialog.value = false;
}

function getIsContainedIn() {
  switch (type.value.modelValue) {
    case IM.CONCEPT_SET:
      return IM.FOLDER_QUERY_CONCEPT_SETS;
    case IM.VALUE_SET:
      return IM.FOLDER_VALUESETS;
    default:
      return IM.FOLDER_SETS;
  }
}

function getDefinition() {
  const matches: Match[] = [];
  for (const member of props.setMembers) {
    matches.push({ name: member.name, instanceOf: member });
  }
  const definition = {
    match: [
      {
        match: matches,
        bool: "or"
      }
    ] as Match[]
  };
  return JSON.stringify(definition);
}

function buildSetEntity() {
  const setEntity = {} as any;
  setEntity["@id"] = fullIri.value;
  setEntity[RDFS.LABEL] = name.value.modelValue;
  setEntity[RDF.TYPE] = [{ "@id": type.value.modelValue }];
  setEntity[IM.HAS_STATUS] = [{ "@id": IM.DRAFT }];
  setEntity[IM.SCHEME] = name.value.modelValue;
  setEntity[IM.IS_CONTAINED_IN] = [{ "@id": getIsContainedIn() }];
  setEntity[IM.DEFINITION] = getDefinition();
  return setEntity;
}
</script>

<style scoped>
#save-set-full-iri {
  padding-bottom: 1rem;
}
</style>