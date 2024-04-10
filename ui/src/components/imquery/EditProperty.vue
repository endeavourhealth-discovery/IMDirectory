<template>
  <div class="property-container">
    <div class="property-label">{{ uiProperty?.propertyName }}:</div>
    <ClassSelect v-if="uiProperty?.propertyType === 'class' || uiProperty?.propertyType === 'node'" :class-iri="uiProperty.valueType" :property="property" />
    <DatatypeSelect v-else-if="uiProperty?.propertyType === 'datatype'" :datatype="uiProperty.valueType" :property="property" />
    <!-- <EntitySelect v-else :edit-node="ttproperty.property" /> -->
  </div>
</template>

<script setup lang="ts">
import { Where } from "@im-library/interfaces/AutoGen";
import ClassSelect from "../query/builder/edit/class/ClassSelect.vue";
import { UIProperty } from "@im-library/interfaces";
import { Ref, onMounted, ref } from "vue";
import { QueryService } from "@/services";
import DatatypeSelect from "../query/builder/edit/datatype/DatatypeSelect.vue";

interface Props {
  property: Where;
  dataModelIri: string;
}

const props = defineProps<Props>();
const uiProperty: Ref<UIProperty | undefined> = ref();

onMounted(async () => {
  await init();
});

async function init() {
  if (props.dataModelIri && props.property["@id"]) {
    uiProperty.value = await QueryService.getDataModelProperty(props.dataModelIri, props.property["@id"]);
  }
}
</script>

<style scoped>
.property-container {
  margin-left: 1rem;
}
.property-input-container {
  margin-left: 0 !important;
}
.property-label {
  margin-bottom: 0.5rem !important;
}

.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.5rem;
}
</style>
