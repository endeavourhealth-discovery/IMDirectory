<template>
  <div class="property-container">
    <Dropdown v-model="selectedProperty" :options="propertyOptions" optionLabel="propertyName" placeholder="Select a property" class="w-full md:w-14rem" />
    <ConceptSelect
      v-if="selectedProperty?.propertyType === 'class' || selectedProperty?.propertyType === 'node'"
      :datatype="selectedProperty.valueType"
      :property="property"
      :data-model-iri="dataModelIri"
      class="concept-select"
    />
    <DatatypeSelect v-else-if="selectedProperty?.propertyType === 'datatype'" :datatype="selectedProperty.valueType" :property="property" />
    <Button v-if="showDelete" @click="$emit('deleteProperty')" severity="danger" icon="fa-solid fa-trash" />
  </div>
</template>

<script setup lang="ts">
import { Where } from "@im-library/interfaces/AutoGen";
import { UIProperty } from "@im-library/interfaces";
import { Ref, onMounted, ref, watch } from "vue";
import { EntityService } from "@/services";
import DatatypeSelect from "./DatatypeSelect.vue";
import { cloneDeep } from "lodash-es";
import ConceptSelect from "./ConceptSelect.vue";
import { SHACL } from "@im-library/vocabulary";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { convertTTPropertyToUIProperty } from "@im-library/helpers/Transforms";
import { getNameFromRef } from "@im-library/helpers/TTTransform";

interface Props {
  property: Where;
  dataModelIri: string;
  showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showDelete: true });
const selectedProperty: Ref<UIProperty | undefined> = ref();
const propertyOptions: Ref<UIProperty[]> = ref([]);
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

watch(
  () => cloneDeep(selectedProperty.value),
  () => {
    if (selectedProperty.value) props.property["@id"] = selectedProperty.value.iri;
  }
);

async function init() {
  if (props.dataModelIri) propertyOptions.value = await getPropertyOptions();
  if (props.property["@id"] && isArrayHasLength(propertyOptions.value)) {
    const found = propertyOptions.value.find(prop => prop.iri === props.property["@id"]);
    if (found) selectedProperty.value = found;
  }
}

async function getPropertyOptions() {
  const uiProps: UIProperty[] = [];
  const propertiesEntity = await EntityService.getPartialEntity(props.dataModelIri, [SHACL.PROPERTY]);
  if (isArrayHasLength(propertiesEntity[SHACL.PROPERTY]))
    for (const ttprop of propertiesEntity[SHACL.PROPERTY]) {
      const uiProperty = convertTTPropertyToUIProperty(ttprop);
      if (isArrayHasLength(ttprop[SHACL.PATH])) {
        uiProperty.propertyName = getNameFromRef(ttprop[SHACL.PATH][0]);
      }
      uiProps.push(uiProperty);
    }
  return uiProps;
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
