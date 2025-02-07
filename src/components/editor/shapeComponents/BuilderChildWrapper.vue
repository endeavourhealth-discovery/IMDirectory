<template>
  <div class="builder-child">
    <div class="builder-child-wrapper">
      <div class="builder-child-container" :id="id">
        <component
          :is="processComponentType(shape.componentType)"
          :shape="shape"
          :mode="mode"
          @updateClicked="updateClicked"
          :value="value"
          :position="position"
        />
        <UpDownButtons :show="{ up: showButtons.up, down: showButtons.down }" :position="position" @moveUpClicked="upClicked" @moveDownClicked="downClicked" />
      </div>

      <AddDeleteButtons
        :show="{ minus: showButtons.minus, plus: false }"
        :position="position"
        :options="nextComponentOptions"
        @deleteClicked="deleteClicked"
        @addNextClicked="addNextClicked"
      />
    </div>
    <div class="indented-add-button">
      <AddDeleteButtons
        :show="{ minus: false, plus: showButtons.plus }"
        :position="position"
        :options="nextComponentOptions"
        @deleteClicked="deleteClicked"
        @addNextClicked="addNextClicked"
      />
    </div>
  </div>
</template>

<script lang="ts">
import EntitySearch from "./EntitySearch.vue";
import EntityAutoComplete from "./EntityAutoComplete.vue";
import ComponentGroup from "./ComponentGroup.vue";
import PropertyBuilder from "./PropertyBuilder.vue";
import TermCodeEditor from "./TermCodeEditor.vue";
import EntityDropdown from "./EntityDropdown.vue";
import EntityDisplay from "./EntityDisplay.vue";
import AutocompleteSearchBarWrapper from "./AutocompleteSearchBarWrapper.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: { EntitySearch, EntityAutoComplete, ComponentGroup, PropertyBuilder, TermCodeEditor, EntityDropdown, EntityDisplay, AutocompleteSearchBarWrapper }
});
</script>

<script setup lang="ts">
import AddDeleteButtons from "@/components/editor/shapeComponents/AddDeleteButtons.vue";
import UpDownButtons from "@/components/editor/shapeComponents/UpDownButtons.vue";
import { ComponentDetails } from "@/interfaces";
import { PropertyShape } from "@/interfaces/AutoGen";
import { ComponentType, EditorMode } from "@/enums";
import { processComponentType } from "@/helpers/EditorMethods";

interface Props {
  id: string;
  position: number;
  value?: any;
  showButtons: { minus: boolean; plus: boolean; up: boolean; down: boolean };
  shape: PropertyShape;
  mode: EditorMode;
  nextComponentOptions: { type: ComponentType; name: string }[];
}

const props = defineProps<Props>();

const emit = defineEmits({
  updateClicked: (_payload: ComponentDetails) => true,
  addNextOptionsClicked: (_payload: any) => true,
  deleteClicked: (_payload: any) => true,
  addClicked: (_payload: any) => true,
  moveUpClicked: (_payload: any) => true,
  moveDownClicked: (_payload: any) => true,
  verifyChild: (_payload: { valid: boolean; validateErrorMessage: string | undefined; position: number }) => true
});

function createEntity(data?: any): ComponentDetails {
  if (data)
    return {
      value: data,
      id: props.id,
      position: props.position,
      type: ComponentType.BUILDER_CHILD_WRAPPER,
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
      type: ComponentType.BUILDER_CHILD_WRAPPER,
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

function upClicked(): void {
  emit("moveUpClicked", createEntity());
}

function downClicked(): void {
  emit("moveDownClicked", createEntity());
}

function addNextClicked(item: any): void {
  emit("addNextOptionsClicked", {
    position: props.position + 1,
    selectedType: item.type
  });
}
</script>

<style scoped>
.builder-child-wrapper {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow: auto;
}

.builder-child {
  width: 100%;
  flex: 1 1 auto;
  align-self: flex-start;
  overflow: auto;
  display: flex;
  flex-flow: column;
}

.builder-child-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  overflow: auto;
}

.label-container {
  flex: 1 1 auto;
  padding: 1rem;
  border-radius: var(--p-textarea-border-radius);
  position: relative;
  min-width: 15rem;
}

.label {
  cursor: pointer;
  border: 1px solid var(--p-textarea-border-color);
  border-radius: var(--p-textarea-border-radius);
  background-color: var(--p-content-background);
  padding: 0.25rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: var(--p-text-color);
}

.search-input {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.indented-add-button {
  margin-top: 0.5rem;
}
</style>
