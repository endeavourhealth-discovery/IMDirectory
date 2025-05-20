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

interface SelectOption {
  id: string;
  name: string;
  value: TTIriRef;
}

const props = defineProps<{
  propertyIri: string;
  param?: TTIriRef;
}>();

const emit = defineEmits<{
  updateParameterValue: [payload: TTIriRef];
}>();

const paramOptions: Ref<SelectOption[]> = ref([]);
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
  let options: SelectOption[] = [];
  const response = await EntityService.getPartialEntity(props.propertyIri, []);
  if (isArrayHasLength(response?.[IM.PARAMETER])) {
    const param = response[IM.PARAMETER][0];
    if (param[RDFS.LABEL]) placeholder.value = param[RDFS.LABEL];
    if (isArrayHasLength(param[SHACL.CLASS]) && param[SHACL.CLASS][0].iri) options = await getOptions(param[SHACL.CLASS][0].iri);
  }
  return options;
}

async function getOptions(iri: string) {
  let options: SelectOption[] = [];
  const qr: QueryRequest = {
    query: { iri: QUERY.GET_SUBCLASSES },
    argument: [
      {
        parameter: "this",
        valueIri: {
          iri: iri
        }
      }
    ]
  };
  const response = await QueryService.queryIM(qr);
  if (isArrayHasLength(response.entities)) {
    options = response.entities.map(entity => {
      return { id: entity[IM.CODE], name: entity[RDFS.LABEL], value: { iri: entity.iri, name: entity[RDFS.LABEL] } } as SelectOption;
    });
  }

  return options;
}
</script>
