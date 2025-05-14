<template>
  <div id="topbar-editor-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Editor:</strong></span>
          <span v-tooltip="{ value: entityName, class: 'name-tooltip' }" class="entity-name" data-testid="entity-title-name">{{ entityName }}</span>
        </div>
      </template>
    </TopBar>
    <div id="editor-main-container">
      <div class="content-buttons-container">
        <div class="content-sidebar-container">
          <div v-if="loading" class="loading-container">
            <ProgressSpinner />
          </div>
          <div v-else class="editor-layout-container">
            <template v-for="group of groups">
              <component :is="processComponentType(group.componentType)" :mode="EditorMode.EDIT" :shape="group" :value="processEntityValue(group)" />
            </template>
          </div>
          <Divider v-if="showSidebar" layout="vertical" />
          <div v-if="showSidebar" class="sidebar-container">
            <SideBar :editorEntity="editorEntity" />
          </div>
          <Button
            :label="showSidebar ? 'hide sidebar' : 'show sidebar'"
            class="p-button-rounded p-button-outlined sidebar-toggle absolute h-fit min-w-fit"
            data-testid="show-sidebar-button"
            severity="info"
            @click="onShowSidebar"
          />
        </div>
        <div id="editor-footer-bar">
          <div class="required-container">
            <span class="required-info">(*) item is required.</span>
          </div>
          <div id="editor-button-bar" class="button-bar">
            <Button data-testid="cancel-button" icon="fa-solid fa-xmark" label="Cancel" severity="secondary" @click="closeEditor" />
            <Button class="save-button" data-testid="submit-button" icon="fa-solid fa-check" label="Save" @click="submit" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import HorizontalLayout from "@/components/editor/shapeComponents/HorizontalLayout.vue";
import VerticalLayout from "@/components/editor/shapeComponents/VerticalLayout.vue";
import TabLayout from "@/components/editor/shapeComponents/TabLayout.vue";
import ArrayBuilder from "@/components/editor/shapeComponents/ArrayBuilder.vue";
import EntityComboBox from "@/components/editor/shapeComponents/EntityComboBox.vue";
import EntityAutoComplete from "@/components/editor/shapeComponents/EntityAutoComplete.vue";
import TextDisplay from "@/components/editor/shapeComponents/TextDisplay.vue";
import TextInput from "@/components/editor/shapeComponents/TextInput.vue";
import EntityDropdown from "@/components/editor/shapeComponents/EntityDropdown.vue";
import HtmlInput from "@/components/editor/shapeComponents/HtmlInput.vue";
import ToggleableComponent from "@/components/editor/shapeComponents/ToggleableComponent.vue";
import QueryDefinitionBuilder from "@/components/editor/shapeComponents/QueryDefinitionBuilder.vue";
import ComponentGroup from "@/components/editor/shapeComponents/ComponentGroup.vue";
import DropdownTextInputConcatenator from "@/components/editor/shapeComponents/DropdownTextInputConcatenator.vue";
import EntitySearch from "@/components/editor/shapeComponents/EntitySearch.vue";
import { defineComponent } from "vue";
import { setupValidity } from "@/composables/setupValidity";
import { setupValueVariableMap } from "@/composables/setupValueVariableMap";
import { useDialog } from "primevue/usedialog";

export default defineComponent({
  components: {
    HorizontalLayout,
    VerticalLayout,
    TabLayout,
    ArrayBuilder,
    EntityAutoComplete,
    EntityComboBox,
    TextDisplay,
    TextInput,
    EntityDropdown,
    EntitySearch,
    HtmlInput,
    ToggleableComponent,
    QueryDefinitionBuilder,
    ComponentGroup,
    DropdownTextInputConcatenator
  }
});
</script>

<script lang="ts" setup>
import { computed, ComputedRef, onMounted, onUnmounted, provide, ref, Ref, watch, nextTick } from "vue";
import SideBar from "@/components/editor/SideBar.vue";
import TopBar from "@/components/shared/TopBar.vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { useRouter, useRoute } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { PropertyShape, TTIriRef } from "@/interfaces/AutoGen";
import { cloneDeep } from "lodash-es";
import Swal from "sweetalert2";
import { setupEditorEntity } from "@/composables/setupEditorEntity";
import { setupEditorShape } from "@/composables/setupEditorShape";
import "vue-json-pretty/lib/styles.css";
import { EditorMode } from "@/enums";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { IM, RDF, SHACL } from "@/vocabulary";
import { DirectService, EntityService, Env, SetService } from "@/services";
import { useEditorStore } from "@/stores/editorStore";
import { useFilterStore } from "@/stores/filterStore";
import { processComponentType } from "@/helpers/EditorMethods";
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";

const router = useRouter();
const route = useRoute();
const confirm = useConfirm();
const editorStore = useEditorStore();
const filterStore = useFilterStore();
const dynamicDialog = useDialog();

onUnmounted(() => {
  window.removeEventListener("beforeunload", beforeWindowUnload);
});

const {
  editorEntity,
  editorEntityOriginal,
  fetchEntity,
  processEntity,
  editorIri,
  editorSavedEntity,
  entityName,
  findPrimaryType,
  updateEntity,
  deleteEntityKey,
  checkForChanges
} = setupEditorEntity(EditorMode.EDIT, updateType);
const { shape, getShape, getShapesCombined, groups, processShape, addToShape } = setupEditorShape();
const {
  editorValidity,
  updateValidity,
  removeValidity,
  isValidEntity,
  constructValidationCheckStatus,
  validationCheckStatus,
  updateValidationCheckStatus,
  addPropertyToValidationCheckStatus,
  removeValidationCheckStatus,
  validationChecksCompleted,
  checkValidity
} = setupValidity(shape.value);
const { valueVariableMap, updateValueVariableMap, valueVariableHasChanged } = setupValueVariableMap();

const treeIri: ComputedRef<string> = computed(() => editorStore.findInEditorTreeIri);

watch(treeIri, (newValue, oldValue) => {
  if ("" === oldValue && "" !== newValue) showSidebar.value = true;
});

function onShowSidebar() {
  showSidebar.value = !showSidebar.value;
  editorStore.updateFindInEditorTreeIri("");
}

const loading = ref(true);
const showSidebar = ref(false);
const forceValidation = ref(false);

provide(injectionKeys.editorEntity, { editorEntity, updateEntity, deleteEntityKey });
provide(injectionKeys.valueVariableMap, { valueVariableMap, updateValueVariableMap, valueVariableHasChanged });
provide(injectionKeys.editorValidity, { validity: editorValidity, updateValidity, removeValidity, checkValidity });
provide(injectionKeys.forceValidation, {
  forceValidation,
  validationCheckStatus,
  updateValidationCheckStatus,
  addPropertyToValidationCheckStatus,
  removeValidationCheckStatus
});
provide(injectionKeys.fullShape, shape);

onMounted(async () => {
  loading.value = true;
  await filterStore.fetchFilterSettings();
  await fetchEntity();
  if (isObjectHasKeys(editorEntityOriginal.value, [RDF.TYPE])) {
    getShapesCombined(editorEntityOriginal.value[RDF.TYPE], findPrimaryType());
    if (shape.value) processShape(shape.value, EditorMode.EDIT, editorEntity.value);
  } else router.push({ path: "/" });
  loading.value = false;
});

watch(
  () => cloneDeep(editorEntity.value),
  () => {
    if (checkForChanges()) {
      window.addEventListener("beforeunload", beforeWindowUnload);
    } else {
      window.removeEventListener("beforeunload", beforeWindowUnload);
    }
  }
);

const directService = new DirectService();

function updateType(types: TTIriRef[]) {
  loading.value = true;
  getShapesCombined(types, findPrimaryType());
  if (shape.value) processShape(shape.value, EditorMode.EDIT, editorEntity.value);
  editorEntity.value[RDF.TYPE] = types;
  removeEroneousKeys();
  loading.value = false;
}

function removeEroneousKeys() {
  const shapeKeys = [] as string[];
  groups.value.forEach((group: any) => {
    group.property.forEach((property: PropertyShape) => {
      if (isObjectHasKeys(property, ["path"])) shapeKeys.push(property.path!["@id"]);
    });
  });
  for (const [key, value] of Object.entries(editorEntity.value)) {
    if (!shapeKeys.includes(key)) {
      delete editorEntity.value[key];
    }
  }
}

function beforeWindowUnload(e: any) {
  if (checkForChanges()) {
    e.preventDefault();
    e.returnValue = "";
  }
}

function submit(): void {
  const verificationDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Validating", text: "Running validation checks..." }
  });
  constructValidationCheckStatus(shape.value);
  forceValidation.value = true;
  validationChecksCompleted()
    .then(async res => {
      if (res) {
        forceValidation.value = false;
        verificationDialog.close();
        if (isValidEntity(editorEntity.value)) {
          Swal.fire({
            icon: "info",
            title: "Confirm save",
            text: "Are you sure you want to save your changes?",
            showCancelButton: true,
            confirmButtonText: "Save",
            reverseButtons: true,
            confirmButtonColor: "#2196F3",
            cancelButtonColor: "#607D8B",
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            backdrop: true,
            preConfirm: async () => {
              if (isObjectHasKeys(editorEntity.value, [IM.HAS_SUBSET]) || isObjectHasKeys(editorEntityOriginal.value, [IM.HAS_SUBSET])) {
                await SetService.updateSubsetsFromSuper(editorEntity.value);
                delete editorEntity.value[IM.HAS_SUBSET];
              }
              const res = await EntityService.updateEntity(editorEntity.value);
              if (res) {
                editorStore.updateEditorSavedEntity(undefined);
                return res;
              } else Swal.showValidationMessage("Error saving entity to server.");
            }
          }).then(async (result: any) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "Success",
                text: "Entity: " + editorEntity.value[IM.ID] + " has been updated.",
                icon: "success",
                showCancelButton: true,
                reverseButtons: true,
                confirmButtonText: "Open in Viewer",
                confirmButtonColor: "#2196F3",
                cancelButtonColor: "#607D8B"
              }).then(async (result: any) => {
                if (result.isConfirmed) {
                  directService.view(editorEntity.value[IM.ID]);
                } else {
                  await fetchEntity();
                }
              });
            }
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "Warning",
            text: "Invalid values found. Please review your entries.",
            confirmButtonText: "Close",
            confirmButtonColor: "#689F38"
          });
        }
      } else {
        forceValidation.value = false;
        verificationDialog.close();
        Swal.fire({
          icon: "error",
          title: "Timeout",
          text: "Validation timed out. Please contact an admin for support.",
          confirmButtonText: "Close",
          confirmButtonColor: "#689F38"
        });
      }
    })
    .catch(err => {
      forceValidation.value = false;
      verificationDialog.close();
      Swal.fire({
        icon: "error",
        title: "Timeout",
        text: "Validation timed out. Please contact an admin for support.",
        confirmButtonText: "Close",
        confirmButtonColor: "#689F38"
      });
    });
}

function refreshEditor() {
  Swal.fire({
    icon: "warning",
    title: "Warning",
    text: "This action will reset all progress. Are you sure you want to proceed?",
    showCancelButton: true,
    confirmButtonText: "Reset",
    reverseButtons: true,
    confirmButtonColor: "#FBC02D",
    cancelButtonColor: "#607D8B",
    customClass: { confirmButton: "swal-reset-button" }
  }).then((result: any) => {
    if (result.isConfirmed) {
      editorEntity.value = { ...editorEntityOriginal.value };
    }
  });
}

function processEntityValue(property: PropertyShape) {
  if (isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity.value, [property.path!["@id"]])) {
    return editorEntity.value[property.path!["@id"]];
  }
  return undefined;
}

function closeEditor() {
  Swal.fire({
    icon: "warning",
    title: "Warning",
    text: "This action will close the builder and lose all progress. Are you sure you want to proceed?",
    showCancelButton: true,
    confirmButtonText: "Close",
    reverseButtons: true,
    confirmButtonColor: "#D32F2F",
    cancelButtonColor: "#607D8B",
    customClass: { confirmButton: "swal-reset-button" }
  }).then((result: any) => {
    if (result.isConfirmed) {
      if (window.history.state.back === null) router.push({ name: "Folder", params: { selectedIri: editorIri } });
      else router.go(-1);
    }
  });
}
</script>

<style>
.p-dropdown-label {
  font-size: 1rem;
}

.p-dropdown {
  height: 2.7rem;
}

.p-inputtext {
  font-size: 1rem;
}
</style>

<style scoped>
#topbar-editor-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
}

#editor-main-container {
  width: 100%;
  height: calc(100% - 3.5rem);
  overflow: auto;
}

.content-buttons-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

.content-sidebar-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  overflow: auto;
  position: relative;
}

.sidebar-container {
  width: 50vw;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding-top: 3rem;
}

.editor-layout-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}

.placeholder {
  height: 100%;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

#editor-button-bar {
  flex: 0 1 auto;
  padding: 1rem 1rem 1rem 0;
  gap: 0.5rem;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}

#editor-footer-bar {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}

.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.required-container {
  flex: 0 1 auto;
  padding: 1rem;
  display: flex;
  flex-flow: row;
  align-items: center;
}

.required-info {
  color: var(--p-red-500);
}

.entity-name {
  margin-left: 0.5rem;
  font-size: 1.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 0 1 auto;
}

.p-divider {
  height: calc(100% - 2rem) !important;
  min-height: unset !important;
  align-self: center;
}

.sidebar-toggle {
  position: absolute !important;
  top: 5px;
  right: 5px;
}

#summary-editor-container {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
}
</style>
