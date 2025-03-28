<template>
  <div id="topbar-creator-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Entity Creator</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="creator-main-container">
      <div class="content-buttons-container">
        <div class="content-sidebar-container">
          <div v-if="loading" class="loading-container">
            <ProgressSpinner />
          </div>
          <div v-else class="creator-layout-container">
            <template v-for="group of groups">
              <component :is="processComponentType(group.componentType)" :mode="EditorMode.CREATE" :shape="group" :value="processEntityValue(group)" />
            </template>
          </div>
          <Divider v-if="showSidebar" layout="vertical" />
          <div v-if="showSidebar" class="sidebar-container">
            <SideBar :editorEntity="editorEntity" />
          </div>
          <Button
            :label="showSidebar ? 'hide sidebar' : 'show sidebar'"
            class="p-button-rounded p-button-outlined sidebar-toggle"
            severity="info"
            @click="onShowSidebar"
          />
        </div>
        <div id="creator-footer-bar">
          <div class="required-container">
            <span class="required-info">(*) item is required.</span>
          </div>
          <div id="creator-button-bar" class="button-bar">
            <Button data-testid="cancel-button" icon="fa-solid fa-xmark" label="Cancel" severity="secondary" @click="closeCreator" />
            <Button class="save-button" icon="fa-solid fa-check" label="Create" severity="success" @click="submit" />
          </div>
        </div>
      </div>
    </div>
    <TypeSelector :showTypeSelector="showTypeSelector" :updateShowTypeSelector="updateShowTypeSelector" />
  </div>
</template>

<script lang="ts">
import TypeSelector from "@/components/creator/TypeSelector.vue";
import HorizontalLayout from "@/components/editor/shapeComponents/HorizontalLayout.vue";
import VerticalLayout from "@/components/editor/shapeComponents/VerticalLayout.vue";
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
import { QueryService } from "@/services";
import { defineComponent } from "vue";
import { setupValidity } from "@/composables/setupValidity";
import { setupValueVariableMap } from "@/composables/setupValueVariableMap";
import { useDialog } from "primevue/usedialog";

export default defineComponent({
  components: {
    TypeSelector,
    HorizontalLayout,
    VerticalLayout,
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
import { onUnmounted, onMounted, computed, ref, Ref, watch, PropType, provide, nextTick, ComputedRef } from "vue";
import SideBar from "@/components/editor/SideBar.vue";
import TopBar from "@/components/shared/TopBar.vue";
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import { cloneDeep } from "lodash-es";
import Swal from "sweetalert2";
import { setupEditorEntity } from "@/composables/setupEditorEntity";
import { setupEditorShape } from "@/composables/setupEditorShape";
import { useConfirm } from "primevue/useconfirm";
import { useRoute, useRouter } from "vue-router";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape, TTIriRef } from "@/interfaces/AutoGen";
import { isObjectHasKeys, isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { debounce } from "@/helpers/UtilityMethods";
import { EditorMode } from "@/enums";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { DirectService, EntityService, FilerService, SetService } from "@/services";
import { useCreatorStore } from "@/stores/creatorStore";
import { useEditorStore } from "@/stores/editorStore";
import { useFilterStore } from "@/stores/filterStore";
import { useUserStore } from "@/stores/userStore";
import { processComponentType } from "@/helpers/EditorMethods";

interface Props {
  type?: TTIriRef;
}

const props = defineProps<Props>();

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const dynamicDialog = useDialog();
const creatorStore = useCreatorStore();
const editorStore = useEditorStore();
const filterStore = useFilterStore();
const userStore = useUserStore();
const directService = new DirectService();

const currentUser = computed(() => userStore.currentUser).value;
const creatorSavedEntity = computed(() => creatorStore.creatorSavedEntity);
const treeIri: ComputedRef<string> = computed(() => editorStore.findInEditorTreeIri);

watch(treeIri, (newValue, oldValue) => {
  if ("" === oldValue && "" !== newValue) showSidebar.value = true;
});

function onShowSidebar() {
  showSidebar.value = !showSidebar.value;
  editorStore.updateFindInEditorTreeIri("");
}

const {
  editorEntity,
  editorEntityOriginal,
  fetchEntity,
  processEntity,
  editorIri,
  editorSavedEntity,
  entityName,
  hasType,
  findPrimaryType,
  updateEntity,
  deleteEntityKey,
  checkForChanges
} = setupEditorEntity(EditorMode.CREATE, updateType);
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

const loading: Ref<boolean> = ref(true);
const currentStep: Ref<number> = ref(0);
const showSidebar: Ref<boolean> = ref(false);
const targetShape: Ref<TTIriRef | undefined> = ref();
const showTypeSelector = ref(false);
const forceValidation = ref(false);

provide(injectionKeys.editorValidity, { validity: editorValidity, updateValidity, removeValidity, checkValidity });

provide(injectionKeys.editorEntity, { editorEntity, updateEntity, deleteEntityKey });
provide(injectionKeys.valueVariableMap, { valueVariableMap, updateValueVariableMap, valueVariableHasChanged });
provide(injectionKeys.forceValidation, {
  forceValidation,
  validationCheckStatus,
  updateValidationCheckStatus,
  addPropertyToValidationCheckStatus,
  removeValidationCheckStatus
});
provide(injectionKeys.fullShape, shape);

onUnmounted(() => {
  window.removeEventListener("beforeunload", beforeWindowUnload);
});

onMounted(async () => {
  loading.value = true;
  await filterStore.fetchFilterSettings();
  const { typeIri, propertyIri, valueIri } = route.query;
  if (isObjectHasKeys(creatorSavedEntity.value, ["@id"])) {
    await showEntityFoundWarning();
  }
  if (props.type) {
    getShape(props.type["@id"]);
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
  } else if (isObjectHasKeys(editorEntity.value, [RDF.TYPE])) {
    getShapesCombined(editorEntity.value[RDF.TYPE], findPrimaryType());
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
  } else if (typeIri) {
    const typeIriFixed = removeEndSlash(typeIri as string);
    currentStep.value = 1;
    const typeEntity = await EntityService.getPartialEntity(typeIriFixed, [RDFS.LABEL]);
    editorEntity.value[RDF.TYPE] = [{ "@id": typeIriFixed, name: typeEntity[RDFS.LABEL] }];
    shape.value = getShape(typeIriFixed);
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
    if (propertyIri && valueIri) {
      const propertyIriFixed = removeEndSlash(propertyIri as string);
      const valueIriFixed = removeEndSlash(valueIri as string);
      if (propertyIriFixed === IM.DEFINITION) {
        const newValue = await QueryService.getQueryDisplay(valueIriFixed, false);
        editorEntity.value[IM.RETURN_TYPE] = newValue.typeOf;
        editorEntity.value[IM.DEFINITION] = JSON.stringify({
          match: [
            {
              is: [
                {
                  "@id": newValue["@id"],
                  name: newValue.name
                }
              ],
              description: newValue.description
            }
          ],
          typeOf: {
            "@id": newValue.typeOf!["@id"]
          }
        });
      } else {
        const containingEntity = await EntityService.getPartialEntity(valueIriFixed, [RDFS.LABEL]);
        editorEntity.value[propertyIriFixed] = [
          {
            "@id": containingEntity["@id"],
            name: containingEntity[RDFS.LABEL]
          }
        ];
      }
    }
  } else {
    showTypeSelector.value = true;
  }
  loading.value = false;
});

function removeEndSlash(urlProp: string) {
  if (urlProp.endsWith("/")) return urlProp.slice(0, -1);
  else return urlProp;
}

async function showEntityFoundWarning() {
  await Swal.fire({
    title: "Unsaved creator entity found",
    html:
      "<span>Local saved entity found. Would you like to continue creating this entity?</span><br/><br/><span>iri: " +
      creatorSavedEntity.value["@id"] +
      "</span><br/><span>name: " +
      creatorSavedEntity.value[RDFS.LABEL] +
      "</span>",
    showCloseButton: false,
    showCancelButton: true,
    cancelButtonText: "No",
    confirmButtonText: "Yes",
    allowOutsideClick: false,
    allowEscapeKey: false,
    reverseButtons: true
  }).then(async result => {
    if (result.isConfirmed) {
      editorEntityOriginal.value = {};
      editorEntity.value = cloneDeep(processEntity(creatorSavedEntity.value));
      currentStep.value = 1;
    } else {
      await Swal.fire({
        title: "Delete saved entity",
        text: "Continuing will delete locally saved entity with iri: " + creatorSavedEntity.value["@id"] + ". Are you sure you want to continue?",
        showCloseButton: false,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Delete local entity",
        confirmButtonColor: "#EF4444"
      }).then(async result => {
        if (result.isConfirmed) {
          editorEntityOriginal.value = {};
          editorEntity.value = {};
        } else {
          await showEntityFoundWarning();
        }
      });
    }
  });
}

watch(
  () => cloneDeep(editorEntity.value),
  (newValue: any) => {
    if (checkForChanges()) {
      window.addEventListener("beforeunload", beforeWindowUnload);
    } else {
      window.removeEventListener("beforeunload", beforeWindowUnload);
    }
  }
);

const debouncedFiler = debounce((entity: any) => {
  fileChanges(entity);
}, 500);

function updateShowTypeSelector(bool: boolean) {
  showTypeSelector.value = bool;
}

function updateType(types: TTIriRef[]) {
  loading.value = true;
  getShapesCombined(types, findPrimaryType());
  if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
  editorEntity.value[RDF.TYPE] = types;
  loading.value = false;
}

function beforeWindowUnload(e: any) {
  if (checkForChanges()) {
    e.preventDefault();
    e.returnValue = "";
  }
}

function fileChanges(entity: any) {
  FilerService.fileEntity(entity, "http://endhealth.info/user/" + currentUser?.id + "#", IM.UPDATE_ALL);
}

function submit(): void {
  const verificationDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Validating", text: "Running validation checks..." }
  });
  constructValidationCheckStatus(shape.value);
  forceValidation.value = true;
  validationChecksCompleted()
    .then(async () => {
      forceValidation.value = false;
      verificationDialog.close();
      if (isValidEntity(editorEntity.value)) {
        await Swal.fire({
          icon: "info",
          title: "Confirm create",
          text: "Are you sure you want to create this entity?",
          showCancelButton: true,
          confirmButtonText: "Create",
          reverseButtons: true,
          confirmButtonColor: "#689F38",
          cancelButtonColor: "#607D8B",
          showLoaderOnConfirm: true,
          allowOutsideClick: () => !Swal.isLoading(),
          preConfirm: async () => {
            if (isObjectHasKeys(editorEntity.value, [IM.HAS_SUBSET])) {
              await SetService.updateSubsetsFromSuper(editorEntity.value);
              delete editorEntity.value[IM.HAS_SUBSET];
            }
            const res = await EntityService.createEntity(editorEntity.value);
            if (res) {
              creatorStore.updateCreatorSavedEntity(undefined);
              return res;
            } else Swal.showValidationMessage("Error creating entity from server.");
          }
        }).then((result: any) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Success",
              text: "Entity: " + editorEntity.value[IM.ID] + " has been created.",
              icon: "success",
              showCancelButton: true,
              reverseButtons: true,
              confirmButtonText: "Open in Viewer",
              confirmButtonColor: "#2196F3",
              cancelButtonColor: "#607D8B"
            }).then((result: any) => {
              if (result.isConfirmed) {
                directService.view(editorEntity.value[IM.ID]);
              } else {
                directService.edit(editorEntity.value[IM.ID], true);
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
    })
    .catch(err => {
      Swal.fire({
        icon: "error",
        title: "Timeout",
        text: "Validation timed out. Please contact an admin for support",
        confirmButtonText: "Close",
        confirmButtonColor: "#689F38"
      });
    });
}

function closeCreator() {
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
      router.push({ name: "LandingPage" });
    }
  });
}

function refreshCreator() {
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
#topbar-creator-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}

#creator-main-container {
  height: calc(100% - 3.5rem);
  width: 100%;
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

.creator-layout-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

.p-steps {
  width: 90%;
}

.sidebar-container {
  width: 50vw;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding-top: 3rem;
}

.sidebar-header-container {
  padding: 0.5rem;
  height: 3rem;
  flex: 0 0 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.sidebar-header {
  font-size: 1.5rem;
}

.sidebar-toggle {
  position: absolute !important;
  top: 0.5rem;
  right: 0.5rem;
}

.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}

.p-steps {
  padding-top: 1rem;
}

#creator-footer-bar {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
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

.button-bar {
  flex: 0 1 auto;
  padding: 1rem 1rem 1rem 0;
  gap: 0.5rem;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}
</style>
