<template>
  <div class="builder-child-container" :id="id">
    <component :is="processComponentType(shape.componentType)" :shape="shape" :mode="mode" @updateClicked="updateClicked" :value="value" />
    <AddDeleteButtons
      :show="showButtons"
      :position="position"
      :options="nextComponentOptions"
      @deleteClicked="deleteClicked"
      @addNextClicked="addNextClicked"
    />
  </div>
</template>

<script lang="ts">
import EntitySearch from "./EntitySearch.vue";
import EntityAutoComplete from "./EntityAutoComplete.vue";
import ComponentGroup from "./ComponentGroup.vue";

export default defineComponent({
  components: { EntitySearch, EntityAutoComplete, ComponentGroup }
});
</script>

<script setup lang="ts">
import { PropType, defineComponent } from "vue";
import _ from "lodash";
import AddDeleteButtons from "@/components/editor/shapeComponents/AddDeleteButtons.vue";
import { ComponentDetails } from "@im-library/interfaces";
import { PropertyShape } from "@im-library/models/AutoGen";
import { ComponentType, EditorMode } from "@im-library/enums";
import {} from "@im-library/helpers/DataTypeCheckers";
import { processComponentType } from "@im-library/helpers/EditorMethods";

const props = defineProps({
  id: { type: String, required: true },
  position: { type: Number, required: true },
  value: { type: Object as PropType<any>, required: false },
  showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean; up: boolean; down: boolean }>, required: true },
  shape: { type: Object as PropType<PropertyShape>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  nextComponentOptions: { type: Array as PropType<{ type: ComponentType; name: string }[]>, required: true }
});

const emit = defineEmits({
  updateClicked: (_payload: ComponentDetails) => true,
  addNextOptionsClicked: (_payload: any) => true,
  deleteClicked: (_payload: any) => true,
  addClicked: (_payload: any) => true
});

function createEntity(data?: any): ComponentDetails {
  if (data)
    return {
      value: data,
      id: props.id,
      position: props.position,
      type: ComponentType.BUILDER_DROPDOWN_CHILD_WRAPPER,
      json: data,
      showButtons: props.showButtons,
      shape: props.shape,
      mode: props.mode
    };
  else {
    return {
      value: undefined,
      id: props.id,
      position: props.position,
      type: ComponentType.BUILDER_DROPDOWN_CHILD_WRAPPER,
      json: {},
      showButtons: props.showButtons,
      shape: props.shape,
      mode: props.mode
    };
  }
}

function deleteClicked(): void {
  emit("deleteClicked", createEntity());
}

function updateClicked(data: any): void {
  emit("updateClicked", createEntity(data));
}

function addNextClicked(item: any): void {
  emit("addNextOptionsClicked", {
    position: props.position + 1,
    selectedType: item.type
  });
}
</script>

<style scoped>
.builder-child-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.label-container {
  flex: 1 1 auto;
  padding: 1rem;
  border-radius: 3px;
  position: relative;
  min-width: 15rem;
}

.label {
  cursor: pointer;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  background-color: #ffffff;
  padding: 0.25rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}

.search-input {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
