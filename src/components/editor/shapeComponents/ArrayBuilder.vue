<template>
  <div class="array-builder-container">
    <div class="title-bar">
      <h2 v-if="shape.showTitle">{{ shape.name }}</h2>
      <h2 v-if="showRequired && shape.showTitle" class="required">*</h2>
    </div>
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else :class="invalid && showValidation && 'invalid'" class="children-container" data-testid="array-builder">
      <template v-for="(item, index) in build" :key="item.id">
        <component
          :is="item.type"
          :value="item.value"
          :id="item.id"
          :position="item.position"
          :showButtons="item.showButtons"
          :shape="item.shape"
          :mode="mode"
          :nextComponentOptions="getNextComponentOptions()"
          @deleteClicked="deleteItem"
          @addClicked="addItemWrapper"
          @updateClicked="updateItemWrapper"
          @addNextOptionsClicked="addItemWrapper"
          @moveUpClicked="moveItemUp"
          @moveDownClicked="moveItemDown"
        />
      </template>
    </div>
    <div class="validate-error-container">
      <small v-if="invalid && showValidation" class="validate-error">{{ validationErrorMessage }}</small>
    </div>
  </div>
</template>

<script lang="ts">
import BuilderChildWrapper from "./BuilderChildWrapper.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: { BuilderChildWrapper }
});
</script>

<script setup lang="ts">
import { ref, Ref, watch, computed, onMounted, inject, ComputedRef } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { cloneDeep, isEqual } from "lodash-es";
import { ComponentDetails } from "@/interfaces";
import { PropertyShape } from "@/interfaces/AutoGen";
import { ComponentType, EditorMode } from "@/enums";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { processComponentType } from "@/helpers/EditorMethods";
import { generateNewComponent, updatePositions, addItem, updateItem } from "@/helpers/EditorBuilderJsonMethods";
import { SHACL } from "@/vocabulary";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any[];
}

const props = defineProps<Props>();

const emit = defineEmits({ updateClicked: _payload => true });

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const updateValidity = inject(injectionKeys.editorValidity)?.updateValidity;
const valueVariableMap = inject(injectionKeys.valueVariableMap)?.valueVariableMap;
const valueVariableMapUpdate = inject(injectionKeys.valueVariableMap)?.updateValueVariableMap;
const valueVariableHasChanged = inject(injectionKeys.valueVariableMap)?.valueVariableHasChanged;
const forceValidation = inject(injectionKeys.forceValidation)?.forceValidation;
const validationCheckStatus = inject(injectionKeys.forceValidation)?.validationCheckStatus;
const updateValidationCheckStatus = inject(injectionKeys.forceValidation)?.updateValidationCheckStatus;
if (forceValidation) {
  watch(forceValidation, async () => {
    if (forceValidation && updateValidity) {
      if (props.shape.builderChild) {
        hasData();
      } else {
        await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
        if (updateValidationCheckStatus) updateValidationCheckStatus(key);
      }
      showValidation.value = true;
    }
  });
}

if (props.shape.argument?.some(arg => arg.valueVariable) && valueVariableMap) {
  watch(
    () => cloneDeep(valueVariableMap),
    async (newValue, oldValue) => {
      if (valueVariableHasChanged && valueVariableHasChanged(props.shape, newValue, oldValue)) {
        if (updateValidity) {
          if (props.shape.builderChild) {
            hasData();
            showValidation.value = true;
          } else if (props.shape.minCount === 0 && build.value.length === 1 && !isObjectHasKeys(build.value[0].json)) {
            invalid.value = false;
            validationErrorMessage.value = undefined;
          } else {
            await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
            showValidation.value = true;
          }
        }
      }
    }
  );
}

const showRequired: ComputedRef<boolean> = computed(() => {
  if (props.shape.minCount && props.shape.minCount > 0) return true;
  else return false;
});

let key = props.shape.path["@id"];

const loading = ref(true);
const invalid = ref(false);
const validationErrorMessage: Ref<string | undefined> = ref();
const showValidation = ref(false);
const build: Ref<ComponentDetails[]> = ref([]);
onMounted(async () => {
  init();
  if (updateValidity) {
    if (props.shape.minCount === 0 && build.value.length === 1 && !isObjectHasKeys(build.value[0].json)) {
      invalid.value = false;
      validationErrorMessage.value = undefined;
    } else {
      await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
    }
  }
});

watch([() => cloneDeep(props.value), () => cloneDeep(props.shape)], ([newPropsValue, newPropsShape], [oldPropsValue, oldPropsShape]) => {
  // updateBuildLength();
  if (!isEqual(newPropsValue, oldPropsValue) && build.value.length) updateBuildPropsValue();
  if (!isEqual(newPropsShape.path["@id"], oldPropsShape.path["@id"])) init();
});

watch(
  () => cloneDeep(build.value),
  async (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      if (!loading.value && finishedChildLoading.value) {
        if (entityUpdate && isArrayHasLength(newValue)) updateEntity();
        if (updateValidity) {
          if (props.shape.minCount === 0 && build.value.length === 1 && !isObjectHasKeys(build.value[0].json)) {
            invalid.value = false;
            validationErrorMessage.value = undefined;
          } else {
            await updateValidity(props.shape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
          }
        }
        updateValueVariableMap(props.value);
      }
    }
  }
);

function updateBuildPropsValue() {
  if (props.value && isArrayHasLength(props.value))
    props.value.forEach((v, i) => {
      if (build.value[i] && build.value[i].value !== v) build.value[i].value = v;
    });
}

const finishedChildLoading = computed(
  () => !build.value.some(c => (isObjectHasKeys(c.value) && !isObjectHasKeys(c.json)) || (isArrayHasLength(c.value) && !isObjectHasKeys(c.json)))
);

function init() {
  key = props.shape.path["@id"];
  createBuild();
}

function createBuild() {
  loading.value = true;
  build.value = [];
  if (!props.value || !isArrayHasLength(props.value)) {
    createDefaultBuild();
    loading.value = false;
    return;
  }
  let position = 0;
  props.value.forEach(item => {
    build.value.push(processChild(item, position));
    updateButtons();
    position++;
  });
  if (!isArrayHasLength(build.value)) {
    createDefaultBuild();
  }
  loading.value = false;
}

function createDefaultBuild() {
  build.value = [];
  if (isObjectHasKeys(props.shape, ["property"])) {
    props.shape.property!.forEach(property => {
      build.value.push(
        generateNewComponent(ComponentType.BUILDER_CHILD_WRAPPER, property.order - 1, undefined, property, setButtons(property.order - 1, true), props.mode)
      );
    });
  }
}

function processChild(child: any, position: number) {
  return generateNewComponent(
    ComponentType.BUILDER_CHILD_WRAPPER,
    position,
    child,
    props.shape.property?.[0] ?? ({} as PropertyShape),
    setButtons(position, true),
    props.mode
  );
}

function setButtons(position: number, isNewItem: boolean): { minus: boolean; plus: boolean; up: boolean; down: boolean } {
  if (props.shape.arrayButtons) {
    if (props.shape.arrayButtons.addOnlyIfLast) {
      return addButtonOnlyIfLast(position, isNewItem);
    } else
      return {
        minus: props.shape.arrayButtons?.minus ?? true,
        plus: props.shape.arrayButtons?.plus ?? true,
        up: props.shape.arrayButtons?.up ?? true,
        down: props.shape.arrayButtons?.down ?? true
      };
  } else return { minus: true, plus: true, up: true, down: true };
}

function addButtonOnlyIfLast(position: number, isNewItem: boolean) {
  if (isNewItem && position !== build.value.length)
    return {
      minus: props.shape.arrayButtons?.minus ?? true,
      plus: false,
      up: props.shape.arrayButtons?.up ?? true,
      down: props.shape.arrayButtons?.down ?? true
    };
  else if (!isNewItem && position !== build.value.length - 1)
    return {
      minus: props.shape.arrayButtons?.minus ?? true,
      plus: false,
      up: props.shape.arrayButtons?.up ?? true,
      down: props.shape.arrayButtons?.down ?? true
    };
  else
    return {
      minus: props.shape.arrayButtons?.minus ?? true,
      plus: props.shape.arrayButtons?.plus ?? true,
      up: props.shape.arrayButtons?.up ?? true,
      down: props.shape.arrayButtons?.down ?? true
    };
}

function updateButtons() {
  build.value.forEach(child => (child.showButtons = setButtons(child.position, false)));
}

function generateBuildAsJson() {
  const jsonBuild = [] as any[];
  build.value.forEach(item => {
    if (isObjectHasKeys(item.json)) {
      jsonBuild.push(item.json);
    }
  });
  return jsonBuild;
}

function updateEntity() {
  const value = generateBuildAsJson();
  const result = {} as any;
  result[key] = value;
  if (props.shape.builderChild) {
    emit("updateClicked", result);
    return;
  } else if (!value.length && deleteEntityKey) deleteEntityKey(key);
  else if (entityUpdate) entityUpdate(result);
}

function addItemWrapper(data: { selectedType: ComponentType; position: number; value: any; shape: PropertyShape }): void {
  let shape;
  if (isObjectHasKeys(props.shape, ["property"])) {
    shape = props.shape.property!.find(p => processComponentType(p.componentType) === data.selectedType);
  }
  if (data.selectedType !== ComponentType.BUILDER_CHILD_WRAPPER) {
    data.selectedType = ComponentType.BUILDER_CHILD_WRAPPER;
  }
  if (shape) addItem(data, build.value, setButtons(data.position, true), shape, props.mode);
  updateButtons();
}

function deleteItem(data: ComponentDetails): void {
  const index = build.value.findIndex(item => item.position === data.position);
  build.value.splice(index, 1);
  if (build.value.length === 0) {
    if (deleteEntityKey) deleteEntityKey(key);
    createDefaultBuild();
    return;
  }
  updatePositions(build.value);
  updateButtons();
}

function updateItemWrapper(data: ComponentDetails) {
  updateItem(data, build.value);
}

function getNextComponentOptions() {
  if (isObjectHasKeys(props.shape, ["property"]))
    return props.shape.property!.map(property => {
      return { type: processComponentType(property.componentType), name: property.name };
    });
  else return;
}

function moveItemUp(item: ComponentDetails) {
  if (item.position === 0) return;
  const found = build.value.find(o => o.position === item.position);
  if (found && found.showButtons) {
    if (props.shape.path["@id"] === SHACL.PROPERTY) {
      found.showButtons.plus = false;
    }
    build.value.splice(item.position, 1);
    build.value.splice(item.position - 1, 0, found);
    if (props.shape.path["@id"] === SHACL.PROPERTY) {
      const i = build.value.length - 1;
      const lastItem = build.value[i];
      if (lastItem.showButtons) {
        lastItem.showButtons.plus = true;
      }
    }
  }
  updatePositions(build.value);
}

function moveItemDown(item: ComponentDetails) {
  if (item.position === build.value.length - 1) return;
  const found = build.value.find(o => o.position === item.position);
  if (found) {
    if (props.shape.path["@id"] === SHACL.PROPERTY) {
      const i = build.value.length - 1;
      const lastItem = build.value[i];
      if (lastItem.showButtons) {
        lastItem.showButtons.plus = false;
      }
    }
    build.value.splice(item.position, 1);
    build.value.splice(item.position + 1, 0, found);
    if (props.shape.path["@id"] === SHACL.PROPERTY) {
      const i = build.value.length - 1;
      const lastItem = build.value[i];
      if (lastItem.showButtons) {
        lastItem.showButtons.plus = true;
      }
    }
    updatePositions(build.value);
  }
}

function updateValueVariableMap(data: any[] | undefined) {
  if (!props.shape.valueVariable) return;
  let mapKey = props.shape.valueVariable;
  if (props.shape.builderChild) mapKey = mapKey + props.shape.order;
  if (valueVariableMapUpdate) valueVariableMapUpdate(mapKey, data);
}

function hasData() {
  invalid.value = false;
  validationErrorMessage.value = undefined;
  if (props.shape.property?.[0]?.minCount === 0 && !isArrayHasLength(build.value)) return;
  if (!isArrayHasLength(build.value)) {
    invalid.value = true;
    validationErrorMessage.value = "Item is required";
  }
}
</script>

<style scoped>
.array-builder-container {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  overflow: auto;
}
.loading-container {
  flex: 1 1 auto;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-flow: column;
}
.children-container {
  width: 100%;
  border-radius: var(--p-textarea-border-radius);
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
}

.validate-error {
  color: var(--p-red-500);
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}

.invalid {
  border: 1px solid var(--p-red-500);
  border-radius: 5px;
  padding: 0.25rem;
}

.validate-error-container {
  width: 100%;
}

.title-bar {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.25rem;
  justify-content: center;
}

.required {
  color: var(--p-red-500);
}
</style>
