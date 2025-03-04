<template>
  <div v-if="loading" class="flex">
    <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
  </div>
  <div class="ml-1 mt-1 flex flex-row items-center gap-2">
    <InputText v-if="selectedProperty" v-model="selectedProperty.name" class="w-full md:w-56" disabled />
    <div v-if="selectedProperty?.propertyType === 'class' || selectedProperty?.propertyType === 'node'" class="flex flex-row flex-nowrap gap-2">
      <span class="self-center"> is </span>
      <InputGroup class="flex flex-row flex-nowrap">
        <div class=" border-border-surface flex flex-row rounded-sm border border-solid p-1">
          <div v-if="property.valueLabel">
            <Chip :label="property.valueLabel" />
          </div>
          <div v-for="is of property.is" v-else>
            <Chip v-tooltip.bottom="getNameFromRef(is)" :label="truncateName(getNameFromRef(is))" />
          </div>
        </div>
        <Button icon="fa-solid fa-chevron-down" severity="secondary" @click="toggleDropdown" />
        <Button data-testid="edit-list-button" label="Edit" @click="showBuildFeatureDialog = true" />
        <SaveCustomSetDialog v-if="property.is" :set-members="property.is" @on-save="onSaveCustomSet" />
        <InputGroupAddon class="gap-1">
          <Checkbox v-model="property.inverse" inputId="inverse" binary />
          <label for="inverse" v-tooltip="'Invert the property<-value relationship'"> invert </label>
        </InputGroupAddon>
      </InputGroup>

      <Popover ref="dropdown">
        <div class="flex max-h-96 max-w-96 flex-col divide-y overflow-y-auto">
          <span v-for="is of property.is" class="p-1">{{ getNameFromRef(is) }}</span>
        </div>
      </Popover>
      <AddNewFeatureDialog
        v-model:show-dialog="showBuildFeatureDialog"
        :show-navigate="false"
        :can-clear-path="false"
        :dataModelIri="dataModelIri"
        :has-next-step="false"
        :header="'Add new feature'"
        :isList="property.is"
        :match="editMatch"
        :property-iri="selectedProperty.iri"
        :show-all-type-filters="false"
        @on-match-add="onMatchAdd"
      />
    </div>

    <DatatypeSelect v-else-if="selectedProperty?.propertyType === 'datatype'" :ui-property="selectedProperty" :property="property" />
    <Button v-if="showDelete" icon="fa-solid fa-trash" severity="danger" @click="$emit('deleteProperty')" />
  </div>
</template>

<script lang="ts" setup>
import { Match, Node, Where } from "@/interfaces/AutoGen";
import { UIProperty } from "@/interfaces";
import { onMounted, Ref, ref, watch } from "vue";
import { DataModelService } from "@/services";
import DatatypeSelect from "./DatatypeSelect.vue";
import { getNameFromRef } from "@/helpers/TTTransform";
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
  if (props.dataModelIri && props.property?.["@id"]) selectedProperty.value = await DataModelService.getUIProperty(props.dataModelIri, props.property["@id"]);
  loading.value = false;
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
