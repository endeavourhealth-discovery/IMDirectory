<template>
  <div class="property-container">
    <InputText v-if="selectedProperty" v-model="selectedProperty.propertyName" class="w-full md:w-14rem" disabled />
    <!-- <ConceptSelect
      v-if="selectedProperty?.propertyType === 'class' || selectedProperty?.propertyType === 'node'"
      :datatype="selectedProperty.valueType"
      :property="property"
      :data-model-iri="dataModelIri"
      class="concept-select"
    /> -->
    <span v-if="selectedProperty?.propertyType === 'class' || selectedProperty?.propertyType === 'node'">
      <InputText value="is" disabled />
      <span v-if="property.valueLabel">
        <InputText :value="property.valueLabel" @click="showBuildFeatureDialog = true" />
      </span>

      <span v-else-if="isArrayHasLength(property.instanceOf)" @click="showBuildFeatureDialog = true">
        <span>[{{ property.instanceOf!.map(instanceOf => getNameFromRef(instanceOf)).join(", ") }}]</span>
      </span>
      <AddNewFeatureDialog
        v-model:show-dialog="showBuildFeatureDialog"
        :dataModelIri="dataModelIri"
        :header="'Add new feature'"
        :show-variable-options="false"
        :can-clear-path="false"
        :has-next-step="false"
        :match="editMatch"
        :isList="property.instanceOf"
        @on-match-add="onMatchAdd"
      />
    </span>

    <DatatypeSelect v-else-if="selectedProperty?.propertyType === 'datatype'" :datatype="selectedProperty.valueType" :property="property" />
    <Button v-if="showDelete" @click="$emit('deleteProperty')" severity="danger" icon="fa-solid fa-trash" />
  </div>
</template>

<script setup lang="ts">
import { Match, Where } from "@im-library/interfaces/AutoGen";
import { UIProperty } from "@im-library/interfaces";
import { Ref, onMounted, ref, watch } from "vue";
import { EntityService } from "@/services";
import DatatypeSelect from "./DatatypeSelect.vue";
import { cloneDeep } from "lodash-es";
import ConceptSelect from "./ConceptSelect.vue";
import { IM, SHACL } from "@im-library/vocabulary";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { convertTTPropertyToUIProperty, convertUIPropertyFromDMConcept } from "@im-library/helpers/Transforms";
import { getNameFromIri, getNameFromRef } from "@im-library/helpers/TTTransform";
import AddNewFeatureDialog from "./addNewFeatureDialog/AddNewFeatureDialog.vue";

interface Props {
  property: Where;
  dataModelIri: string;
  showDelete?: boolean;
  editMatch: Match;
}

const props = withDefaults(defineProps<Props>(), { showDelete: true });
const selectedProperty: Ref<UIProperty | undefined> = ref();
const showBuildFeatureDialog: Ref<boolean> = ref(false);
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
  if (props.dataModelIri && props.property["@id"]) selectedProperty.value = await getProperty(props.dataModelIri, props.property["@id"]);
}

async function getProperty(dmIri: string, propIri: string) {
  const conceptProp = IM.NAMESPACE + "concept";
  const uiProps: UIProperty[] = [];
  const propertiesEntity = await EntityService.getPartialEntity(props.dataModelIri, [SHACL.PROPERTY, conceptProp]);
  if (isArrayHasLength(propertiesEntity[SHACL.PROPERTY]))
    for (const ttprop of propertiesEntity[SHACL.PROPERTY]) {
      const uiProperty = convertTTPropertyToUIProperty(ttprop);
      if (isArrayHasLength(ttprop[SHACL.PATH])) {
        uiProperty.propertyName = getNameFromRef(ttprop[SHACL.PATH][0]);
      }
      uiProps.push(uiProperty);
    }

  if (isArrayHasLength(propertiesEntity[conceptProp])) {
    const uiProperty = convertUIPropertyFromDMConcept(propertiesEntity[conceptProp][0]["@id"]);
    uiProps.push(uiProperty);
  }

  const found = uiProps.find(prop => prop.iri === props.property["@id"]);
  if (found) return found;
}

function onMatchAdd(updatedMatch: Match) {
  props.editMatch.where = updatedMatch.where;
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
