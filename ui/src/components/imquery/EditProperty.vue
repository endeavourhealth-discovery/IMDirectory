<template>
  <div v-if="loading" class="flex">
    <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
  </div>
  <div class="ml-1 mt-1 flex flex-row items-center gap-2">
    <InputText v-if="selectedProperty" v-model="selectedProperty.propertyName" class="w-full md:w-56" disabled />
    <div v-if="selectedProperty?.propertyType === 'class' || selectedProperty?.propertyType === 'node'" class="flex flex-row flex-nowrap gap-2">
      <span class="self-center"> is </span>

      <InputGroup class="flex flex-row flex-nowrap">
        <div class="border-1 border-border-surface flex flex-row rounded border border-solid p-1">
          <div v-if="property.valueLabel"><Chip :label="property.valueLabel" /></div>
          <div v-else v-for="is of property.is"><Chip :label="truncateName(getNameFromRef(is))" v-tooltip.bottom="getNameFromRef(is)" /></div>
        </div>
        <Button icon="fa-solid fa-chevron-down" severity="secondary" @click="toggleDropdown" />
        <Button label="Edit" @click="showBuildFeatureDialog = true" data-testid="edit-list-button" />
        <SaveCustomSetDialog v-if="property.is" :set-members="property.is" @on-save="onSaveCustomSet" />
      </InputGroup>
      <Popover ref="dropdown">
        <div class="flex max-h-96 max-w-96 flex-col divide-y overflow-y-auto">
          <span v-for="is of property.is" class="p-1">{{ getNameFromRef(is) }}</span>
        </div>
      </Popover>
      <AddNewFeatureDialog
        v-model:show-dialog="showBuildFeatureDialog"
        :dataModelIri="dataModelIri"
        :header="'Add new feature'"
        :show-variable-options="false"
        :can-clear-path="false"
        :has-next-step="false"
        :match="editMatch"
        :property-iri="selectedProperty.iri"
        :isList="property.is"
        :show-type-filters="false"
        @on-match-add="onMatchAdd"
      />
    </div>

    <DatatypeSelect v-else-if="selectedProperty?.propertyType === 'datatype'" :datatype="selectedProperty.valueType" :property="property" />
    <Button v-if="showDelete" @click="$emit('deleteProperty')" severity="danger" icon="fa-solid fa-trash" />
  </div>
</template>

<script setup lang="ts">
import { Match, Node, Where } from "@im-library/interfaces/AutoGen";
import { UIProperty } from "@im-library/interfaces";
import { Ref, onMounted, ref, watch } from "vue";
import { EntityService } from "@/services";
import DatatypeSelect from "./DatatypeSelect.vue";
import { IM, SHACL } from "@im-library/vocabulary";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { convertTTPropertyToUIProperty, convertUIPropertyFromDMConcept } from "@im-library/helpers/Transforms";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import AddNewFeatureDialog from "./addNewFeatureDialog/AddNewFeatureDialog.vue";
import { cloneDeep } from "lodash-es";
import SaveCustomSetDialog from "./SaveCustomSetDialog.vue";

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
const loading = ref(true);

const dropdown = ref();

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
  loading.value = true;
  if (props.dataModelIri && props.property?.["@id"]) selectedProperty.value = await getProperty();
  loading.value = false;
}

async function getProperty() {
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

  const found = uiProps.find(prop => prop.iri === props.property["@id"]);
  if (found) return found;
}

function onMatchAdd(updatedMatch: Match) {
  props.editMatch.where = updatedMatch.where;
}

function truncateName(name: string) {
  if (name.length > 25) return name.substring(0, 25) + "...";
  return name;
}

function toggleDropdown(event: MouseEvent) {
  dropdown.value.toggle(event);
}

function onSaveCustomSet(newSet: Node) {
  props.property.is = [newSet];
  props.property.memberOf = true;
}
</script>

<style scoped>
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

.is-title {
  padding: 1rem;
}
</style>
