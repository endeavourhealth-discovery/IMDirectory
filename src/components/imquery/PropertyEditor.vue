<template>
  <div v-if="loading" class="flex">
    <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
  </div>
  <div class="property-value-container">
    <div class="property-display">
      <span class="property-label">{{ propertyPath }}</span>
    </div>
    <div v-if="selectedProperty?.propertyType === 'class'">
      <WhereIsEditor v-model:property="property" :uiProperty="selectedProperty" />
      <!-- <InputGroup class="flex flex-row flex-nowrap">
        <div class="border-border-surface flex flex-row rounded-sm border border-1 border-solid p-1">
          <div v-if="property.valueLabel">
            <Chip :label="property.valueLabel" />
          </div>
          <div v-for="is of property.is" :key="getNameFromRef(is)" v-else>
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
      </InputGroup>-->

      <Popover ref="dropdown">
        <div class="flex max-h-96 max-w-96 flex-col divide-y overflow-y-auto">
          <span v-for="is of property.is" :key="getNameFromRef(is)" class="p-1">{{ getNameFromRef(is) }}</span>
        </div>
      </Popover>
    </div>
    <div v-else-if="selectedProperty?.propertyType === 'datatype'">
      <DatatypeSelect :ui-property="selectedProperty" v-model:property="property!" />
    </div>
    <Button v-if="showDelete" icon="fa-solid fa-trash" severity="danger" @click="$emit('deleteProperty')" />
  </div>
</template>

<script lang="ts" setup>
import { Match, Node, Where } from "@/interfaces/AutoGen";
import { UIProperty } from "@/interfaces";
import { onMounted, Ref, ref, watch, computed } from "vue";
import { DataModelService } from "@/services";
import DatatypeSelect from "./DatatypeSelect.vue";
import { getNameFromRef } from "@/helpers/TTTransform";
import { cloneDeep } from "lodash-es";
import SaveCustomSetDialog from "./SaveCustomSetDialog.vue";
import WhereIsEditor from "./WhereIsEditor.vue";
const props = withDefaults(
  defineProps<{
    dataModelIri: string;
    showDelete?: boolean;
    editMatch: Match;
  }>(),
  { showDelete: true }
);
defineEmits<{
  deleteProperty: [];
}>();
const selectedProperty: Ref<UIProperty | undefined> = ref();
const showBuildFeatureDialog: Ref<boolean> = ref(false);
const loading = ref(true);
const property = defineModel<Where>("property", { default: {} });
const dropdown = ref();
const propertyPath = computed(() => {
  if (property.value.nodeRef)
    return property.value.nodeRef + "/" + (property.value.name ? property.value.name : property.value.iri ? property.value.iri.split("#")[1] : "");
  else return property.value.name ? property.value.name : property.value.iri ? property.value.iri.split("#")[1] : "";
});
onMounted(async () => {
  await init();
});

watch(
  () => cloneDeep(property),
  async () => await init()
);

watch(
  () => props.dataModelIri,
  async () => await init()
);

async function init() {
  loading.value = true;
  if (props.dataModelIri && property!.value.iri) selectedProperty.value = await DataModelService.getUIProperty(props.dataModelIri, property!.value.iri);
  loading.value = false;
}

function truncateName(name: string) {
  if (name.length > 25) return name.substring(0, 25) + "...";
  return name;
}

function toggleDropdown(event: MouseEvent) {
  dropdown.value.toggle(event);
}

function onSaveCustomSet(newSet: Node) {
  property.value.is = [newSet];
  property.value.memberOf = true;
}
</script>

<style scoped>
.property-value-container {
  display: flex;
  flex-flow: row;
  flex: 1;
  border: 0.5px solid #999999;
}

.property-display {
  width: 20rem;
  display: flex;
  flex-flow: wrap;
  align-items: flex-start;
}
.property-label {
  background: #e0f7fa;
}
</style>
