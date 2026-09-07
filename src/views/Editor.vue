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
            <template v-for="(group, index) of groups" v-bind:key="index">
              <<component :is="processComponentType(group.componentType)" :mode="EditorMode.EDIT" :shape="group" :value="processEntityValue(group)" />
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
import { defineComponent } from "vue";

import ArrayBuilder from "@/components/editor/shapeComponents/ArrayBuilder.vue";
import ComponentGroup from "@/components/editor/shapeComponents/ComponentGroup.vue";
import DropdownTextInputConcatenator from "@/components/editor/shapeComponents/DropdownTextInputConcatenator.vue";
import EntityAutoComplete from "@/components/editor/shapeComponents/EntityAutoComplete.vue";
import EntityComboBox from "@/components/editor/shapeComponents/EntityComboBox.vue";
import EntityDropdown from "@/components/editor/shapeComponents/EntityDropdown.vue";
import EntitySearch from "@/components/editor/shapeComponents/EntitySearch.vue";
import HorizontalLayout from "@/components/editor/shapeComponents/HorizontalLayout.vue";
import HtmlInput from "@/components/editor/shapeComponents/HtmlInput.vue";
import QueryDefinitionBuilder from "@/components/editor/shapeComponents/QueryDefinitionBuilder.vue";
import TabLayout from "@/components/editor/shapeComponents/TabLayout.vue";
import TextDisplay from "@/components/editor/shapeComponents/TextDisplay.vue";
import TextInput from "@/components/editor/shapeComponents/TextInput.vue";
import ToggleableComponent from "@/components/editor/shapeComponents/ToggleableComponent.vue";
import VerticalLayout from "@/components/editor/shapeComponents/VerticalLayout.vue";

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
import { ComputedRef, Ref, computed, onBeforeUnmount, onMounted, onUnmounted, provide, ref, watch } from "vue";

import { AlertDialog } from "@endeavour/vue-library/components";
import { IM, NAMESPACE, RDF } from "@endeavour/vue-library/enums";
import { isArrayOf, isEnumValue, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import { type PropertyShape, type TTEntity, type TTIriRef, isTTIriRef } from "@endeavour/vue-library/models";
import { useUserStore } from "@endeavour/vue-library/stores";
import { useDialogStore } from "@endeavour/vue-library/stores";

import { cloneDeep } from "lodash-es";
import { useDialog } from "primevue/usedialog";
import "vue-json-pretty/lib/styles.css";
import { useRoute, useRouter } from "vue-router";

import SideBar from "@/components/editor/SideBar.vue";
import TopBar from "@/components/shared/TopBar.vue";
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import { useAutocompleteRegistry } from "@/composables/useAutocompleteRegistry";
import { useDirectService } from "@/composables/useDirectService";
import { useEditorEntity } from "@/composables/useEditorEntity";
import { useEditorShape } from "@/composables/useEditorShape";
import { useValidity } from "@/composables/useValidity";
import { useValueVariableMap } from "@/composables/useValueVariableMap";
import { EditorMode } from "@/enums";
import { processComponentType } from "@/helpers/EditorMethods";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { EntityService, SetService } from "@/services";
import { useEditorStore } from "@/stores/editorStore";
import { useFilterStore } from "@/stores/filterStore";

const router = useRouter();
const route = useRoute();
const dialogStore = useDialogStore();
const editorStore = useEditorStore();
const filterStore = useFilterStore();
const userStore = useUserStore();
const dynamicDialog = useDialog();
const autocompletes = new Map<HTMLElement, () => void>();
const directService = useDirectService();
const { fetchEntity, editorEntity, editorEntityOriginal, editorIri, entityName, findPrimaryType, updateEntity, deleteEntityKey, checkForChanges } =
  useEditorEntity(EditorMode.EDIT, updateType);
const { shape, getShapesCombined, groups, processShape } = useEditorShape();
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
} = useValidity(shape.value);
const { valueVariableMap, updateValueVariableMap, valueVariableHasChanged } = useValueVariableMap();
const { handleFocusChange } = useAutocompleteRegistry();
const treeIri: ComputedRef<string> = computed(() => editorStore.findInEditorTreeIri);
const currentUser = computed(() => userStore.currentUser);

const loading = ref(true);
const showSidebar = ref(false);
const forceValidation = ref(false);
const linkedEntities: Ref<TTEntity[]> = ref([]);
provide("linkedEntities", linkedEntities);
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

document.addEventListener("focusin", e => {
  for (const [element, resetFn] of autocompletes.entries()) {
    if (!element.contains(e.target as Node)) {
      resetFn(); // Only reset if focus moved outside
    }
  }
});

watch(treeIri, (newValue, oldValue) => {
  if ("" === oldValue && "" !== newValue) showSidebar.value = true;
});

function onShowSidebar() {
  showSidebar.value = !showSidebar.value;
  editorStore.updateFindInEditorTreeIri("");
}

onBeforeUnmount(() => {
  document.removeEventListener("focusin", onGlobalFocusIn);
});
onUnmounted(() => {
  window.removeEventListener("beforeunload", beforeWindowUnload);
});

onMounted(async () => {
  loading.value = false;
  if (currentUser.value && currentUser.value.namespaces.length < 1) {
    await router.push({ name: "AccessDenied" });
  }
  document.addEventListener("focusin", onGlobalFocusIn);
  await filterStore.fetchFilterSettings();
  await fetchEntity();

  if (isObjectHasKeys(editorEntityOriginal.value, [RDF.TYPE]) && isArrayOf(editorEntityOriginal.value[RDF.TYPE], isTTIriRef)) {
    getShapesCombined(editorEntityOriginal.value[RDF.TYPE], findPrimaryType());
    if (shape.value) processShape(shape.value, EditorMode.EDIT, editorEntity.value);
  } else await router.push({ path: "/" });

  //loading.value = false;
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

function onGlobalFocusIn(e: FocusEvent) {
  const newFocusedElement = e.target as HTMLElement;
  handleFocusChange(newFocusedElement);
}
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
  groups.value.forEach((group: PropertyShape) => {
    group.property?.forEach((property: PropertyShape) => {
      if (isObjectHasKeys(property, ["path"])) shapeKeys.push(property.path!.iri);
    });
  });
  for (const key of Object.keys(editorEntity.value)) {
    if (!shapeKeys.includes(key)) {
      delete editorEntity.value[key];
    }
  }
}

function beforeWindowUnload(e: BeforeUnloadEvent) {
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
          await dialogStore
            .open(AlertDialog, {
              props: { modal: true, style: { width: "30vw" }, closable: false },
              data: {
                icon: "fa-regular fa-circle-info",
                title: "Confirm save",
                text: "Are you sure you want to save your changes?",
                showCancelButton: true,
                confirmButtonText: "Save",
                reverseButtons: true,
                preConfirm: async () => {
                  if (isObjectHasKeys(editorEntity.value, [IM.HAS_SUBSET]) || isObjectHasKeys(editorEntityOriginal.value, [IM.HAS_SUBSET])) {
                    await SetService.updateSubsetsFromSuper(editorEntity.value);
                    delete editorEntity.value[IM.HAS_SUBSET];
                  }
                  if (typeof editorEntity.value[IM.ID] === "string") {
                    const namespace = editorEntity.value[IM.ID].substring(0, editorEntity.value[IM.ID].lastIndexOf("#") + 1);
                    if (isEnumValue(NAMESPACE, namespace)) {
                      if (linkedEntities.value.length > 0) {
                        for (const linkedEntity of linkedEntities.value) {
                          linkedEntity[IM.ID] = linkedEntity.iri;
                          const res = await EntityService.updateEntity({ namespace: namespace, entity: linkedEntity, hostUrl: window.location.origin });
                        }
                      }
                      const res = await EntityService.updateEntity({ namespace: namespace, entity: editorEntity.value, hostUrl: window.location.origin });
                      if (res) {
                        editorStore.updateEditorSavedEntity(undefined);
                        return res;
                      } else dialogStore.setError("Error saving entity to server.");
                    }
                  }
                }
              }
            })
            .then(async (result: any) => {
              if (result?.confirm) {
                await dialogStore
                  .open(AlertDialog, {
                    props: { modal: true, style: { width: "30vw" }, closable: false },
                    data: {
                      title: "Success",
                      text: "Entity: " + editorEntity.value[IM.ID] + " has been updated.",
                      icon: "fa-regular fa-circle-check",
                      showCancelButton: true,
                      reverseButtons: true,
                      confirmButtonText: "Open in Viewer"
                    }
                  })
                  .then(async result => {
                    if (result.confirm && typeof editorEntity.value[IM.ID] === "string") {
                      await directService.view(editorEntity.value[IM.ID]);
                    } else {
                      await fetchEntity();
                    }
                  });
              }
            });
        } else {
          await dialogStore.open(AlertDialog, {
            props: { modal: true, style: { width: "30vw" }, closable: false },
            data: {
              icon: "fa-regular fa-circle-exclamation",
              title: "Warning",
              text: "Invalid values found. Please review your entries.",
              confirmButtonText: "Close"
            }
          });
        }
      } else {
        forceValidation.value = false;
        verificationDialog.close();
        await dialogStore.open(AlertDialog, {
          props: { modal: true, style: { width: "30vw" }, closable: false },
          data: {
            icon: "fa-regular fa-circle-exclamation",
            title: "Warning",
            text: "Invalid values found. Please review your entries.",
            confirmButtonText: "Close"
          }
        });
      }
    })
    .catch(async () => {
      forceValidation.value = false;
      verificationDialog.close();
      await dialogStore.open(AlertDialog, {
        props: { modal: true, style: { width: "30vw" }, closable: false },
        data: {
          icon: "fa-regular fa-circle-xmark",
          title: "Timeout",
          text: "Validation timed out. Please contact an admin for support",
          confirmButtonText: "Close"
        }
      });
    });
}

function processEntityValue(property: PropertyShape) {
  if (isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity.value, [property.path!.iri])) {
    return editorEntity.value[property.path!.iri];
  }
  return undefined;
}

async function closeEditor() {
  editorStore.updateEditorHasChanges(false);
  await dialogStore
    .open(AlertDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-exclamation",
        title: "Warning",
        text: "This action will close the builder and lose all progress. Are you sure you want to proceed?",
        showCancelButton: true,
        confirmButtonText: "Close",
        reverseButtons: true
      }
    })
    .then(async result => {
      if (result.confirm) {
        if (window.history.state.back === null) await router.push({ name: "Folder", params: { selectedIri: editorIri } });
        else router.go(-1);
      }
    });
}
</script>

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

.sidebar-toggle {
  position: absolute !important;
  top: 5px;
  right: 5px;
}
</style>
