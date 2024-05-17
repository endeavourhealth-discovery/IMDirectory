<template>
  <div class="property-container">
    <div class="property-title"><InputText :value="uiProperty?.propertyName" disabled /></div>
    <ConceptSelect
      v-if="uiProperty?.propertyType === 'class' || uiProperty?.propertyType === 'node'"
      :datatype="uiProperty.valueType"
      :property="property"
      class="concept-select"
    />
    <DatatypeSelect v-else-if="uiProperty?.propertyType === 'datatype'" :datatype="uiProperty.valueType" :property="property" />
    <Button v-if="showDelete" @click="$emit('deleteProperty')" severity="danger" icon="fa-solid fa-trash" />
  </div>
</template>

<script setup lang="ts">
import { Where } from "@im-library/interfaces/AutoGen";
import { UIProperty } from "@im-library/interfaces";
import { Ref, onMounted, ref, watch } from "vue";
import { QueryService } from "@/services";
import DatatypeSelect from "./DatatypeSelect.vue";
import { cloneDeep } from "lodash";
import ConceptSelect from "./ConceptSelect.vue";

interface Props {
  property: Where;
  dataModelIri: string;
  showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showDelete: true });
const uiProperty: Ref<UIProperty | undefined> = ref();

const emit = defineEmits({ deleteProperty: () => true });

onMounted(async () => {
  await init();
});

watch(
  () => cloneDeep(props.property),
  async () => await init()
);

watch(
  () => props.dataModelIri,
  async () => await init()
);

async function init() {
  if (props.dataModelIri && props.property["@id"]) {
    uiProperty.value = await QueryService.getDataModelProperty(props.dataModelIri, props.property["@id"]);
  }
}
</script>

<style scoped>
.property-container {
  display: flex;
  flex-flow: row;
  margin-left: 1rem;
  margin-top: 1rem;
  align-items: baseline;
}

.property-label {
  padding: 0.1rem;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}

.property {
  display: flex;
}

.concept-select {
  width: 100%;
}
</style>
