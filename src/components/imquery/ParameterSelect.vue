<template>
  <div class="parameter-select">
    <Select
      type="text"
      :placeholder="placeholder"
      :options="paramOptions"
      v-model="selectedParam"
      option-label="name"
      option-value="value"
      @change="option => emit('updateParameterValue', option.value)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { IM, QUERY, RDFS, SHACL } from "@/vocabulary";
import { EntityService, QueryService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { QueryRequest, TTIriRef } from "@/interfaces/AutoGen";
interface Props {
  propertyIri: string;
  param?: TTIriRef;
}

interface Option {
  id: string;
  name: string;
  value: TTIriRef;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  updateParameterValue: [payload: TTIriRef];
}>();

const paramOptions: Ref<Option[]> = ref([]);
const selectedParam = ref();
const placeholder: Ref<string> = ref("");
watch(
  () => props.propertyIri,
  async () => {
    paramOptions.value = await getParameters();
  }
);

onMounted(async () => {
  paramOptions.value = await getParameters();
  // TODO: populate the parameter if param
});

async function getParameters() {
  let options: Option[] = [];
  const response = await EntityService.getPartialEntity(props.propertyIri, []);
  if (isArrayHasLength(response?.[IM.PARAMETER])) {
    const param = response[IM.PARAMETER][0];
    if (param[RDFS.LABEL]) placeholder.value = param[RDFS.LABEL];
    if (isArrayHasLength(param[SHACL.CLASS]) && param[SHACL.CLASS][0]["@id"]) options = await getOptions(param[SHACL.CLASS][0]["@id"]);
  }
  return options;
}

async function getOptions(iri: string) {
  let options: Option[] = [];
  const qr: QueryRequest = {
    query: { "@id": QUERY.GET_SUBCLASSES },
    argument: [
      {
        parameter: "this",
        valueIri: {
          "@id": iri
        }
      }
    ]
  };
  const response = await QueryService.queryIM(qr);
  if (isArrayHasLength(response.entities)) {
    options = response.entities.map(entity => {
      return { id: entity[IM.CODE], name: entity[RDFS.LABEL], value: { "@id": entity["@id"], name: entity[RDFS.LABEL] } } as Option;
    });
  }

  return options;
}
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}

.property-input {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  flex-wrap: wrap;
}

.property-input-title {
  width: 4rem;
}

.property-range {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}
</style>
