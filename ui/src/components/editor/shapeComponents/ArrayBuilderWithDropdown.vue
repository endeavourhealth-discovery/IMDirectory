<template>
  <div class="array-dropdown-builder-container">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else class="dropdown-children-container">
      <Dropdown v-model="selectedOption" :options="dropdownOptions" optionLabel="name" placeholder="Select..." />
      <div class="children-container" :class="invalid && 'invalid'">
        <small v-if="invalid" class="validate-error">{{ validationErrorMessage }}</small>
        <template v-for="item of build" :key="item.id">
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
    </div>
  </div>
</template>

<script lang="ts">
import BuilderDropdownChildWrapper from "./BuilderDropdownChildWrapper.vue";

export default defineComponent({
  components: { BuilderDropdownChildWrapper }
});
</script>

<script setup lang="ts">
import { ref, Ref, watch, onMounted, inject, PropType, defineComponent } from "vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import _ from "lodash";
import { ComponentDetails } from "@im-library/interfaces";
import { PropertyGroup, PropertyShape, TTIriRef } from "@im-library/models/AutoGen";
import { ComponentType, EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { processComponentType } from "@im-library/helpers/EditorMethods";
import { generateNewComponent, updatePositions, addItem, updateItem } from "@im-library/helpers/EditorBuilderJsonMethods";
import { isPropertyGroup, isPropertyShape, isTTIriRef } from "@im-library/helpers/TypeGuards";
import { QueryService, EntityService } from "@/services";
import { RDFS } from "@im-library/vocabulary";

const props = defineProps({
  shape: { type: Object as PropType<PropertyGroup>, required: true },
  mode: { type: String as PropType<EditorMode>, required: true },
  value: { type: Object as PropType<any>, required: false }
});

const emit = defineEmits({
  updateClicked: (_payload: any) => true
});

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;
const editorEntity = inject(injectionKeys.editorEntity)?.editorEntity;
const deleteEntityKey = inject(injectionKeys.editorEntity)?.deleteEntityKey;
const validityUpdate = inject(injectionKeys.editorValidity)?.updateValidity;

let key = props.shape.path["@id"];

let loading = ref(true);
let invalid = ref(false);
let selectedOption: Ref<TTIriRef | undefined> = ref();
let dropdownOptions: Ref<TTIriRef[]> = ref([]);
let validationErrorMessage = "Failed validation";
let build: Ref<ComponentDetails[]> = ref([]);
onMounted(async () => {
  loading.value = true;
  key = props.shape.path["@id"];
  if (isObjectHasKeys(props.shape, ["validationErrorMessage"])) validationErrorMessage = props.shape.validationErrorMessage;
  dropdownOptions.value = await getDropdownOptions();
  await createBuild();
  if (entityUpdate) updateEntity();
  if (validityUpdate) await updateValidity();
  loading.value = false;
});
watch(
  () => _.cloneDeep(props.shape),
  async () => {
    loading.value = true;
    key = props.shape.path["@id"];
    if (isObjectHasKeys(props.shape, ["validationErrorMessage"])) validationErrorMessage = props.shape.validationErrorMessage;
    dropdownOptions.value = await getDropdownOptions();
    setDropdownFromValue();
    await createBuild();
    if (entityUpdate) updateEntity();
    if (validityUpdate) await updateValidity();
    loading.value = false;
  }
);
watch(
  () => _.cloneDeep(build.value),
  async () => {
    if (!loading.value && finishedChildLoading()) {
      if (entityUpdate) updateEntity();
      if (validityUpdate) await updateValidity();
    }
  }
);

function finishedChildLoading() {
  return !build.value.some(c => (isObjectHasKeys(c.value) && !isObjectHasKeys(c.json)) || (isArrayHasLength(c.value) && !isObjectHasKeys(c.json)));
}

function hasValidOptionKey(value: any) {
  const found = dropdownOptions.value.find(option => option["@id"] === Object.keys(value)[0]);
  if (found) {
    return true;
  } else return false;
}

async function createBuild() {
  build.value = [];
  if (!props.value || !isObjectHasKeys(props.value) || !hasValidOptionKey(props.value)) {
    createDefaultBuild();
    loading.value = false;
    return;
  }
  setDropdownFromValue();
  let position = 0;
  if (selectedOption.value) {
    for (const item of props.value[selectedOption.value["@id"]]) {
      build.value.push(await processChild(item, position));
      position++;
    }
  }
  if (!isArrayHasLength(build.value)) {
    createDefaultBuild();
  }
}

function createDefaultBuild() {
  build.value = [];
  if (isPropertyGroup(props.shape)) {
    if (isObjectHasKeys(props.shape, ["property"])) {
      props.shape.property.forEach(property => {
        build.value.push(
          generateNewComponent(
            ComponentType.BUILDER_DROPDOWN_CHILD_WRAPPER,
            property.order - 1,
            undefined,
            property,
            { minus: true, plus: true, up: true, down: true },
            props.mode
          )
        );
      });
    }
    if (isObjectHasKeys(props.shape, ["subGroup"])) {
      props.shape.subGroup.forEach(subGroup => {
        build.value.push(
          generateNewComponent(
            ComponentType.BUILDER_DROPDOWN_CHILD_WRAPPER,
            subGroup.order - 1,
            undefined,
            subGroup,
            { minus: true, plus: true, up: true, down: true },
            props.mode
          )
        );
      });
    }
  }
}

async function processChild(child: any, position: number) {
  if (isTTIriRef(child)) {
    return generateNewComponent(
      ComponentType.BUILDER_DROPDOWN_CHILD_WRAPPER,
      position,
      child,
      isObjectHasKeys(props.shape, ["property"]) ? props.shape.property[0] : props.shape.subGroup[0],
      {
        minus: true,
        plus: true,
        up: true,
        down: true
      },
      props.mode
    );
  } else {
    return generateNewComponent(
      ComponentType.BUILDER_DROPDOWN_CHILD_WRAPPER,
      position,
      await processComponentGroupData(child),
      isObjectHasKeys(props.shape, ["subGroup"]) ? props.shape.subGroup[0] : props.shape.property[0],
      {
        minus: true,
        plus: true,
        up: true,
        down: true
      },
      props.mode
    );
  }
}

async function processComponentGroupData(data: any) {
  if (isObjectHasKeys(data)) {
    const iris = [];
    const key = Object.keys(data)[0];
    let withName = await EntityService.getPartialEntity(key, [RDFS.LABEL]);
    withName = { "@id": withName["@id"], name: withName[RDFS.LABEL] };
    iris.push(withName);
    iris.push(data[key][0]);
    return iris;
  }
}

function generateBuildAsJson() {
  const jsonBuild = [] as any[];
  build.value.forEach(item => {
    if (isObjectHasKeys(item.json)) {
      jsonBuild.push(item.json);
    }
  });
  const jsonObject = {} as any;
  if (selectedOption.value) jsonObject[selectedOption.value?.["@id"]] = jsonBuild;
  // return build.value.map(item => item.json);
  return jsonObject;
}

async function getDropdownOptions() {
  if (isObjectHasKeys(props.shape, ["function"])) {
    return await QueryService.runFunction(props.shape.function["@id"]);
  } else throw new Error("propertygroup is missing 'function' parameter to fetch dropdown options");
}

function setDropdownFromValue() {
  if (props.value) {
    const found = dropdownOptions.value.find(option => option["@id"] === Object.keys(props.value)[0]);
    if (found) selectedOption.value = found;
  }
}

function updateEntity() {
  const value = generateBuildAsJson();
  const result = {} as any;
  result[key] = value;
  if (entityUpdate && isObjectHasKeys(value) && !props.shape.builderChild) entityUpdate(result);
  else if (entityUpdate && isObjectHasKeys(value)) emit("updateClicked", value);
}

async function updateValidity() {
  if (isPropertyShape(props.shape) && isObjectHasKeys(props.shape, ["validation"]) && editorEntity) {
    invalid.value = !(await QueryService.checkValidation(props.shape.validation["@id"], editorEntity.value));
  } else {
    invalid.value = !defaultValidation();
  }
  if (validityUpdate) validityUpdate({ key: key, valid: !invalid.value });
}

function defaultValidation() {
  return generateBuildAsJson().every((item: any) => isObjectHasKeys(item, ["@id", "name"]));
}

function addItemWrapper(data: { selectedType: ComponentType; position: number; value: any; shape: PropertyShape | PropertyGroup }): void {
  let shape;
  if (isPropertyGroup(props.shape) && isObjectHasKeys(props.shape, ["property"])) {
    shape = props.shape.property.find(p => processComponentType(p.componentType) === data.selectedType);
  } else if (isPropertyGroup(props.shape) && isObjectHasKeys(props.shape, ["subGroup"])) {
    shape = props.shape.subGroup.find(s => processComponentType(s.componentType) === data.selectedType);
  }
  if (data.selectedType !== ComponentType.BUILDER_DROPDOWN_CHILD_WRAPPER) {
    data.selectedType = ComponentType.BUILDER_DROPDOWN_CHILD_WRAPPER;
  }
  if (shape) addItem(data, build.value, { minus: true, plus: true, up: true, down: true }, shape, props.mode);
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
}

function updateItemWrapper(data: ComponentDetails) {
  updateItem(data, build.value);
}

function getNextComponentOptions() {
  const options = [];
  if (isPropertyGroup(props.shape) && isObjectHasKeys(props.shape, ["subGroup"]))
    options.push(
      props.shape.subGroup.map(subGroup => {
        return { type: processComponentType(subGroup.componentType), name: subGroup.name };
      })
    );
  if (isPropertyGroup(props.shape) && isObjectHasKeys(props.shape, ["property"]))
    options.push(
      props.shape.property.map(property => {
        return { type: processComponentType(property.componentType), name: property.name };
      })
    );
  if (options.length) return options;
  else return;
}

function moveItemUp(item: ComponentDetails) {
  if (item.position === 0) return;
  const found = build.value.find(o => o.position === item.position);
  if (found) {
    build.value.splice(item.position, 1);
    build.value.splice(item.position - 1, 0, found);
  }
  updatePositions(build.value);
}

function moveItemDown(item: ComponentDetails) {
  if (item.position === build.value.length - 1) return;
  const found = build.value.find(o => o.position === item.position);
  if (found) {
    build.value.splice(item.position, 1);
    build.value.splice(item.position + 1, 0, found);
    updatePositions(build.value);
  }
}
</script>

<style scoped>
.array-dropdown-builder-container {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
}
.loading-container {
  flex: 1 1 auto;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-flow: column;
}

.dropdown-children-container {
  border-radius: 3px;
  padding: 1rem;
  overflow: auto;
}

.children-container {
  margin-left: 2rem;
  padding: 1rem;
  border-radius: 3px;
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  gap: 1rem;
  overflow: auto;
}
.invalid {
  border-color: #e24c4c;
}

.validate-error {
  color: #e24c4c;
  font-size: 0.8rem;
  padding: 0 0 0.25rem 0;
}
</style>
