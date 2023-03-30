<template>
  <div>{{ from.data["@id"] }}</div>
  <div>{{ textQuery.type }}</div>
  <div>{{ textQuery.data }}</div>
  <div class="desc-wrapper">Description: <InputText type="text" v-model="description" /></div>

  <div class="property-wrapper">
    <PropertySelect :from="from" :property="property" />
    <div v-if="textQuery.data.isNull">is Null</div>
    <ValueSelect v-else :selected-property="property" :from="from" :selected="textQuery" />
  </div>

  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="cancel"></Button>
    <Button class="action-button" label="Save" @click="save"></Button>
  </div>
</template>

<script setup lang="ts">
import { ITextQuery, TTProperty } from "@im-library/interfaces";
import Tree, { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import PropertySelect from "./editTextQuery/PropertySelect.vue";
import ValueSelect from "./editTextQuery/ValueSelect.vue";
import { buildPropertyTreeNode } from "@im-library/helpers/PropertyTreeNodeBuilder";
import { EntityService } from "@/services";
import { RDF, RDFS, SHACL } from "@im-library/vocabulary";

const emit = defineEmits({ onCancel: () => true });

const props = defineProps({
  from: { type: Object as PropType<ITextQuery>, required: true },
  textQuery: { type: Object as PropType<ITextQuery>, required: true }
});
const description: Ref<string> = ref("");
const property: Ref<TreeNode> = ref({});

onMounted(async () => {
  description.value = props.textQuery.display;
  property.value = await getPropertyTreeNode();
});

async function getPropertyTreeNode() {
  const dataModelentity = await EntityService.getPartialEntity(props.from.data["@id"], [SHACL.PROPERTY]);
  let ttproperty: TTProperty | undefined = (dataModelentity[SHACL.PROPERTY] as []).find(ttProperty => ttProperty[SHACL.PATH] === props.textQuery.data["@id"]);
  if (!ttproperty) {
    const propEntity = await EntityService.getPartialEntity(props.textQuery.data["@id"], []);
    console.log(propEntity);
    ttproperty = { "http://www.w3.org/ns/shacl#path": props.textQuery.data["@id"], "http://www.w3.org/ns/shacl#class": propEntity[RDFS.RANGE] } as TTProperty;
  }
  console.log(ttproperty);
  return buildPropertyTreeNode(ttproperty);
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

.property-wrapper {
  display: flex;
  align-items: center;
}
</style>
