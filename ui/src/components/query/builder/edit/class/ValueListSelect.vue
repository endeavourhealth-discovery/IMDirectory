<template>
  <Listbox v-model="selectedValue" :options="options" optionLabel="name" :virtualScrollerOptions="{ itemSize: 38 }" listStyle="height:300px" filter></Listbox>
  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="emit('close')"></Button>
    <Button class="action-button" label="Select" @click="emit('onSelect', selectedValue)"></Button>
  </div>
</template>

<script setup lang="ts">
import { EntityService, QueryService } from "@/services";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { Query, QueryRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDFS } from "@im-library/vocabulary";
import { Ref, onMounted, ref } from "vue";

interface Props {
  classIri: string;
}

const props = defineProps<Props>();

const emit = defineEmits({ onSelect: (payload: any) => payload, close: () => true });

const selectedValue: Ref<any> = ref({});
const options: Ref<TTIriRef[]> = ref([]);

onMounted(async () => {
  const entity = await EntityService.getPartialEntity(props.classIri, [IM.DEFINITION]);
  const definition = JSON.parse(entity[IM.DEFINITION]);
  (definition as Query).return = [{ property: [{ "@id": RDFS.LABEL }] }];
  const queryRequest = { query: definition } as QueryRequest;
  const results = await QueryService.queryIM(queryRequest);
  options.value = results.entities.map(entity => {
    return { "@id": entity["@id"], name: entity[RDFS.LABEL] ?? getNameFromRef(entity) } as TTIriRef;
  });
});
</script>

<style scoped>
.action-button {
  margin-right: 0.1rem;
}
.footer-actions {
  display: flex;
  justify-content: end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
