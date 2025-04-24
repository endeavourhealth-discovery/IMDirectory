<template>
  <Button v-tooltip="'Save custom set'" icon="fa-solid fa-floppy-disk" severity="info" @click="showSaveCustomSetDialog = true" />
  <Dialog v-model:visible="showSaveCustomSetDialog" modal header="Save custom set" :style="{ minWidth: '25vw', maxWidth: '50vw' }">
    <form @submit="onSubmit" class="save-set-form flex flex-col gap-2">
      <div class="flex flex-col gap-2" id="save-set-full-iri">
        <span id="save-set-iri-header">Iri</span>
        <InputText :model-value="fullIri" type="text" disabled />
        <small class="p-error" id="text-error">{{ errors.iri || "&nbsp;" }}</small>
      </div>

      <div class="flex flex-col gap-2" id="save-set-scheme-iri">
        <span id="save-set-scheme-header">Scheme</span>
        <Select
          id="scheme"
          v-model="scheme"
          v-bind="schemeAttrs"
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

      <div class="flex flex-col gap-2" id="save-set-name">
        <span id="save-set-name-header">Name</span>
        <InputText id="name" v-model="name" v-bind="nameAttrs" type="text" :class="{ 'p-invalid': errors.name }" aria-describedby="text-error" />
        <small class="p-error" id="text-error">{{ errors.name || "&nbsp;" }}</small>
      </div>

      <div class="flex flex-col gap-2" id="save-set-type">
        <span id="save-set-type-header">Type</span>

        <Select
          id="type"
          v-model="type"
          v-bind="typeAttrs"
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
      <Listbox v-model="selectedMember" :options="setMembers" optionLabel="name" class="flex flex-col" />
    </form>

    <template #footer>
      <Button label="Cancel" severity="secondary" @click="onDiscard" text />
      <Button label="Save" text @click="onSubmit" :loading="loading" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
import { useForm } from "vee-validate";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Node, TTIriRef, Match } from "@/interfaces/AutoGen";
import { EntityService, FilerService, FunctionService, QueryService } from "@/services";
import { IM, RDF, RDFS, IM_FUNCTION } from "@/vocabulary";
import { useToast } from "primevue/usetoast";
import * as yup from "yup";

interface Props {
  setMembers: Node[];
}
const props = defineProps<Props>();

const emit = defineEmits<{ onSave: [payload: Node] }>();

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

const { defineField, handleSubmit, resetForm, errors, setFieldValue } = useForm({
  validationSchema: schema
});

const fullIri: ComputedRef<string> = computed(() => `${scheme.value ?? ""}${iri.value ?? ""}`);

const [scheme, schemeAttrs] = defineField("scheme");
const [iri, iriAttrs] = defineField("iri");
const [name, nameAttrs] = defineField("name");
const [type, typeAttrs] = defineField("type");

const schemeOptions: Ref<TTIriRef[]> = ref([]);
const typeOptions: Ref<TTIriRef[]> = ref([]);
const selectedMember: Ref<Node> = ref({});
const showSaveCustomSetDialog = ref(false);
const loading = ref(false);
watch(
  () => showSaveCustomSetDialog.value,
  async () => await init()
);

watch(
  () => name.value,
  () => onNameGenIri()
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
  if (!scheme.value) return false;
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
  return await FunctionService.runFunction(IM_FUNCTION.GET_USER_EDITABLE_SCHEMES);
}

function onNameGenIri() {
  if (name.value && name.value) {
    const nameValue: string = name.value;
    setFieldValue("iri", nameValue.replaceAll(" ", ""));
  }
}

function selectDefaults() {
  if (isArrayHasLength(schemeOptions.value)) setFieldValue("scheme", schemeOptions.value[0]["@id"]);
  else setFieldValue("scheme", IM.NAMESPACE);

  setFieldValue("type", IM.CONCEPT_SET);
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
  showSaveCustomSetDialog.value = false;
  emit("onSave", { "@id": setEntity["@id"], name: setEntity[RDFS.LABEL] });
});

function onDiscard() {
  resetForm();
  showSaveCustomSetDialog.value = false;
}

function getIsContainedIn() {
  switch (type.value) {
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
    matches.push({ name: member.name, instanceOf: [member] });
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
  setEntity[RDFS.LABEL] = name.value;
  setEntity[RDF.TYPE] = [{ "@id": type.value }];
  setEntity[IM.HAS_STATUS] = [{ "@id": IM.DRAFT }];
  setEntity[IM.HAS_SCHEME] = [{ "@id": scheme.value }];
  setEntity[IM.IS_CONTAINED_IN] = [{ "@id": getIsContainedIn() }];
  setEntity[IM.DEFINITION] = getDefinition();
  return setEntity;
}
</script>

<style scoped>
.save-set-form {
  width: 100%;
}
</style>
