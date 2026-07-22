<template>
  <Button v-tooltip="'Save custom set'" icon="fa-solid fa-floppy-disk" severity="info" @click="showSaveCustomSetDialog = true" />
  <Dialog v-model:visible="showSaveCustomSetDialog" :style="{ minWidth: '25vw', maxWidth: '50vw' }" header="Save custom set" modal>
    <form class="save-set-form flex flex-col gap-2" @submit="onSubmit">
      <div id="save-set-full-iri" class="flex flex-col gap-2">
        <span id="save-set-iri-header">Iri</span>
        <InputText :model-value="fullIri" disabled type="text" />
        <small id="text-error" class="p-error">{{ errors.iri || "&nbsp;" }}</small>
      </div>

      <div id="save-set-scheme-iri" class="flex flex-col gap-2">
        <span id="save-set-scheme-header">Scheme</span>
        <Select
          id="scheme"
          v-model="scheme"
          :class="{ 'p-invalid': errors.scheme }"
          :options="schemeOptions"
          aria-describedby="text-error"
          class="flex-1"
          option-label="name"
          option-value="iri"
          placeholder="Scheme"
          type="text"
          v-bind="schemeAttrs"
        />
        <small id="text-error" class="p-error flex-1">{{ errors.scheme || "&nbsp;" }}</small>
      </div>

      <div id="save-set-name" class="flex flex-col gap-2">
        <span id="save-set-name-header">Name</span>
        <InputText id="name" v-model="setName" :class="{ 'p-invalid': errors.name }" aria-describedby="text-error" type="text" v-bind="nameAttrs" />
        <small id="text-error" class="p-error">{{ errors.name || "&nbsp;" }}</small>
      </div>

      <div id="save-set-type" class="flex flex-col gap-2">
        <span id="save-set-type-header">Type</span>

        <Select
          id="type"
          v-model="setType"
          :class="{ 'p-invalid': errors.type }"
          :options="typeOptions"
          aria-describedby="text-error"
          option-label="name"
          option-value="iri"
          type="text"
          v-bind="typeAttrs"
        />
        <small id="text-error" class="p-error">{{ errors.type || "&nbsp;" }}</small>
      </div>

      <span id="members-title">Members</span>
      <Listbox v-model="selectedMember" :options="setMembers" class="flex flex-col" optionLabel="name" />
    </form>

    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="onDiscard" />
      <Button :loading="loading" label="Save" text @click="onSubmit" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";

import { IM, IM_FUNCTION, NAMESPACE, RDF, RDFS } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isObjectHasKeys, parseArray } from "@endeavour/vue-library/helpers";
import { type Match, MatchSchema, type Node, NodeSchema, type TTIriRef, TTIriRefSchema } from "@endeavour/vue-library/models";

import { isString } from "lodash-es";
import { useToast } from "primevue/usetoast";
import { useForm } from "vee-validate";
import * as yup from "yup";

import { EntityService, FilerService, FunctionService } from "@/services";

interface Props {
  setMembers: Node[];
}
const props = defineProps<Props>();

const emit = defineEmits<{ onSave: [payload: Node] }>();

const schema = yup.object({
  scheme: yup.string().required().label("Scheme").default(NAMESPACE.IM),
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
const [iri] = defineField("iri");
const [setName, nameAttrs] = defineField("name");
const [setType, typeAttrs] = defineField("type");

const schemeOptions: Ref<TTIriRef[]> = ref([]);
const typeOptions: Ref<TTIriRef[]> = ref([]);
const selectedMember: Ref<Node> = ref(NodeSchema.parse({}));
const showSaveCustomSetDialog = ref(false);
const loading = ref(false);
watch(
  () => showSaveCustomSetDialog.value,
  async () => await init()
);

watch(
  () => setName.value,
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
      iri: setType.iri,
      name: setType.name
    };
  });
}

async function getSchemeOptions(): Promise<TTIriRef[]> {
  const result = await FunctionService.runFunction(IM_FUNCTION.GET_USER_EDITABLE_SCHEMES);
  return parseArray(result, TTIriRefSchema);
}

function onNameGenIri() {
  if (setName.value && setName.value) {
    const nameValue: string = setName.value;
    setFieldValue("iri", nameValue.replaceAll(" ", ""));
  }
}

function selectDefaults() {
  if (isArrayHasLength(schemeOptions.value)) setFieldValue("scheme", schemeOptions.value[0].iri);
  else setFieldValue("scheme", NAMESPACE.IM);

  setFieldValue("type", IM.CONCEPT_SET);
}

const onSubmit = handleSubmit(async () => {
  loading.value = true;
  const setEntity = buildSetEntity();
  try {
    await FilerService.fileEntity(setEntity, NAMESPACE.IM, IM.ADD_QUADS);
    const createdEntity = await EntityService.getFullEntity(setEntity.iri);
    if (isObjectHasKeys(createdEntity, [RDFS.LABEL, RDF.TYPE, IM.HAS_STATUS, IM.HAS_SCHEME, IM.IS_CONTAINED_IN, IM.DEFINITION]))
      toast.add({ severity: "success", summary: "Created", detail: "Created " + createdEntity[RDFS.LABEL], life: 3000 });
  } catch (e: any) {
    loading.value = false;
    toast.add({ severity: "error", summary: e.response.data.title, detail: e.response.data.detail, life: 3000 });
  }
  loading.value = false;
  showSaveCustomSetDialog.value = false;
  emit("onSave", NodeSchema.parse({ iri: setEntity.iri, name: setEntity[RDFS.LABEL] }));
});

function onDiscard() {
  resetForm();
  showSaveCustomSetDialog.value = false;
}

function getIsContainedIn() {
  switch (setType.value) {
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
    if (isString(member.name)) {
      matches.push(MatchSchema.parse({ name: member.name, is: member }));
    }
  }
  const definition = {
    or: matches
  };
  return JSON.stringify(definition);
}

function buildSetEntity() {
  const setEntity = {} as any;
  setEntity.iri = fullIri.value;
  setEntity[RDFS.LABEL] = setName.value;
  setEntity[RDF.TYPE] = [{ iri: setType.value }];
  setEntity[IM.HAS_STATUS] = [{ iri: IM.DRAFT }];
  setEntity[IM.HAS_SCHEME] = [{ iri: scheme.value }];
  setEntity[IM.IS_CONTAINED_IN] = [{ iri: getIsContainedIn() }];
  setEntity[IM.DEFINITION] = getDefinition();
  return setEntity;
}
</script>

<style scoped>
.save-set-form {
  width: 100%;
}
</style>
