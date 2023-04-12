<template>
  <SimpleJsonEditor :text-query="textQuery" />
  <div class="desc-wrapper">Description: <InputText type="text" v-model="description" /></div>
  <PropertySelect v-if="isObjectHasKeys(textQuery.data, ['@id'])" :from="from" :property="property" />
  <div v-if="isObjectHasKeys(textQuery.data, ['@set'])">Set: <EntitySearch :entity-value="textQuery.data" /></div>
  <div v-if="isObjectHasKeys(textQuery.data, ['@type'])">Type: <EntitySearch :entity-value="textQuery.data" /></div>
  <span v-if="textQuery.data.isNull">is Null</span>
  <ValueSelect
    v-else-if="isObjectHasKeys(property.data, [SHACL.CLASS]) || isObjectHasKeys(property.data, [SHACL.NODE])"
    :selected-property="property"
    :from="from"
    :selectedValue="value"
  />
  <div v-else-if="isObjectHasKeys(property.data, [SHACL.DATATYPE])">
    <ComparisonSelect v-if="textQuery.data.operator" :selected-comparison="textQuery.data" :title="'Value:'" />
    <RangeSelect
      v-if="!textQuery.data.in && !textQuery.data.notIn && textQuery.data.range"
      :selected-property="property"
      :from="from"
      :selected-range="textQuery.data.range"
    />
  </div>
  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="cancel"></Button>
    <Button class="action-button" label="Save" @click="save"></Button>
  </div>
</template>

<script setup lang="ts">
import { ITextQuery, TTProperty } from "@im-library/interfaces";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import PropertySelect from "./editTextQuery/PropertySelect.vue";
import ValueSelect from "./editTextQuery/ValueSelect.vue";
import { buildPropertyTreeNode } from "@im-library/helpers/PropertyTreeNodeBuilder";
import { EntityService, QueryService } from "@/services";
import { SHACL } from "@im-library/vocabulary";
import RangeSelect from "./editTextQuery/RangeSelect.vue";
import ComparisonSelect from "./editTextQuery/ComparisonSelect.vue";
import SimpleJsonEditor from "./editTextQuery/SimpleJsonEditor.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { resolveIri } from "@im-library/helpers/TTTransform";
import EntitySearch from "./editTextQuery/EntitySearch.vue";

const emit = defineEmits({ onCancel: () => true });

const props = defineProps({
  from: { type: Object as PropType<ITextQuery>, required: true },
  textQuery: { type: Object as PropType<ITextQuery>, required: true }
});
const description: Ref<string> = ref("");
const property: Ref<TreeNode> = ref({});
const value: Ref<TreeNode> = ref({});

onMounted(async () => {
  description.value = props.textQuery.display;
  property.value = await getPropertyTreeNode();
});

async function getPropertyTreeNode() {
  const propertyIri = resolveIri(props.textQuery.data["@id"]);
  const dataModelIri: string = props.from.data["@id"] || props.from.data["@type"] || props.from.data["@set"];
  const entity = await EntityService.getPartialEntity(resolveIri(dataModelIri), [SHACL.PROPERTY]);
  const ttproperties: TTProperty[] = entity[SHACL.PROPERTY];
  console.log(ttproperties);
  console.log(props.textQuery.data["@id"]);
  const property = ttproperties.find(ttproperty => ttproperty["http://www.w3.org/ns/shacl#path"][0]["@id"] === propertyIri);
  console.log(property);
  if (property) return buildPropertyTreeNode(property);

  // const results = await QueryService.queryIM({
  //   argument: [
  //     {
  //       parameter: "dataModel",
  //       valueIri: props.from.data["@id"] || props.from.data["@type"] || props.from.data["@set"]
  //     },
  //     {
  //       parameter: "property",
  //       valueIri: props.textQuery.data["@id"]
  //     }
  //   ],
  //   query: {
  //     "@id": "http://endhealth.info/im#Query_PropertyFromDataModel"
  //   }
  // } as any);
  // if (isArrayHasLength(results.entities) && isObjectHasKeys(results.entities[0], [SHACL.PROPERTY]) && isArrayHasLength(results.entities[0][SHACL.PROPERTY])) {
  //   const ttproperties: TTProperty[] = results.entities[0][SHACL.PROPERTY];
  //   return buildPropertyTreeNode(ttproperties[0]);
  // }

  return {};
}

function cancel() {
  emit("onCancel");
}

function save() {
  props.textQuery.display = description.value;
  emit("onCancel");
}
</script>

<style scoped>
.footer-actions {
  display: flex;
  justify-content: end;
}
.action-button {
  margin-right: 0.1rem;
}

.desc-wrapper {
  display: flex;
  flex-flow: column;
  padding-bottom: 1rem;
}
</style>
