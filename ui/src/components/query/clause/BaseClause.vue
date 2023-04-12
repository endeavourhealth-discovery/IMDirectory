<template>
  <div class="base-clause">
    <Dropdown v-model="selectedType" :options="clauseTypes" optionLabel="name" placeholder="Select a type" @change="emit('onSelectType', $event.value)" />
    <PropertySelect v-if="selectedType.name === 'Property'" :from="from" :property="{}" @on-select="emit('onSelectTypeValue', $event)" />
    <EntitySearch v-else :entity-value="selectedTypeValue" @on-change="emit('onSelectTypeValue', $event)" />
    <AncestorDescendantSelect />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, Ref, PropType } from "vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
import { Element } from "@im-library/interfaces/AutoGen";
import AncestorDescendantSelect from "../editTextQuery/AncestorDescendantSelect.vue";
import { ConceptSummary, ITextQuery } from "@im-library/interfaces";
import PropertySelect from "../editTextQuery/PropertySelect.vue";
import { TreeNode } from "primevue/tree";
const props = defineProps({
  from: { type: Object as PropType<ITextQuery>, required: true },
  textQuery: { type: Object as PropType<ITextQuery>, required: true }
});

const emit = defineEmits({
  onSelectType: (payload: { name: string; prop: string }) => payload,
  onSelectTypeValue: (payload: ConceptSummary | TreeNode) => payload
});

const selectedType = ref({} as { name: string; prop: string });
const selectedTypeValue: Ref<Element> = ref({} as Element);
const clauseTypes = ref([
  { name: "Type", prop: "@type" },
  { name: "Set", prop: "@set" },
  { name: "Entity", prop: "@id" },
  { name: "Property", prop: "@id" }
]);

onMounted(async () => {});
</script>

<style scoped>
.base-clause {
  display: flex;
  flex-flow: row;
  height: 100%;
  width: 100%;
}
</style>
