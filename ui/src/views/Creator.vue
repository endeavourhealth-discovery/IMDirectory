<template>
  <div id="topbar-creator-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Creator</strong></span>
        </div>
      </template>
    </TopBar>
    <ConfirmDialog />
    <div id="creator-main-container">
      <div class="content-buttons-container">
        <div class="content-sidebar-container">
          <div v-if="loading" class="loading-container">
            <ProgressSpinner />
          </div>
          <div v-else class="creator-layout-container">
            <template v-for="group of groups">
              <component :is="processComponentType(group.componentType)" :shape="group" :mode="EditorMode.CREATE" :value="processEntityValue(group)" />
            </template>
          </div>
          <Divider v-if="showSidebar" layout="vertical" />
          <div v-if="showSidebar" class="sidebar-container">
            <SideBar :editorEntity="editorEntity" />
          </div>
          <Button
            class="p-button-rounded p-button-outlined sidebar-toggle"
            severity="info"
            :label="showSidebar ? 'hide sidebar' : 'show sidebar'"
            @click="onShowSidebar"
          />
        </div>
        <div class="button-bar" id="creator-button-bar">
          <Button icon="pi pi-check" label="Create" severity="success" class="save-button" @click="submit" />
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
import ArrayBuilderWithDropdown from "@/components/editor/shapeComponents/ArrayBuilderWithDropdown.vue";
import DropdownTextInputConcatenator from "@/components/editor/shapeComponents/DropdownTextInputConcatenator.vue";
import EntitySearch from "@/components/editor/shapeComponents/EntitySearch.vue";
import { defineComponent } from "vue";
import { setupValidity } from "@/composables/setupValidity";
import { setupValueVariableMap } from "@/composables/setupValueVariableMap";
import { useDialog } from "primevue/usedialog";
import QuickQuery from "@/components/query/QuickQuery.vue";

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
    ArrayBuilderWithDropdown,
    DropdownTextInputConcatenator
  }
});
</script>

<script setup lang="ts">
import { onUnmounted, onMounted, computed, ref, Ref, watch, PropType, provide, nextTick, ComputedRef } from "vue";
import SideBar from "@/components/editor/SideBar.vue";
import TopBar from "@/components/shared/TopBar.vue";
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import _ from "lodash";
import Swal from "sweetalert2";
import { setupEditorEntity } from "@/composables/setupEditorEntity";
import { setupEditorShape } from "@/composables/setupEditorShape";
import { useConfirm } from "primevue/useconfirm";
import { useRoute, useRouter } from "vue-router";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys, isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { debounce } from "@im-library/helpers/UtilityMethods";
import { EditorMode } from "@im-library/enums";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import { DirectService, EntityService, FilerService } from "@/services";
import { useCreatorStore } from "@/stores/creatorStore";
import { useEditorStore } from "@/stores/editorStore";
import { useFilterStore } from "@/stores/filterStore";
import { useUserStore } from "@/stores/userStore";
import { processComponentType } from "@im-library/helpers/EditorMethods";
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
const { setCreatorSteps, shape, stepsItems, getShape, getShapesCombined, groups, processShape, addToShape } = setupEditorShape();
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
const { valueVariableMap, updateValueVariableMap } = setupValueVariableMap();

const loading: Ref<boolean> = ref(true);
const currentStep: Ref<number> = ref(0);
const showSidebar: Ref<boolean> = ref(false);
const targetShape: Ref<TTIriRef | undefined> = ref();
const showTypeSelector = ref(false);
const forceValidation = ref(false);

provide(injectionKeys.editorValidity, { validity: editorValidity, updateValidity, removeValidity, checkValidity });

provide(injectionKeys.editorEntity, { editorEntity, updateEntity, deleteEntityKey });
provide(injectionKeys.valueVariableMap, { valueVariableMap, updateValueVariableMap });
provide(injectionKeys.forceValidation, {
  forceValidation,
  validationCheckStatus,
  updateValidationCheckStatus,
  addPropertyToValidationCheckStatus,
  removeValidationCheckStatus
});

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
    currentStep.value = 1;
    const typeEntity = await EntityService.getPartialEntity(typeIri as string, [RDFS.LABEL]);
    editorEntity.value[RDF.TYPE] = [{ "@id": typeIri, name: typeEntity[RDFS.LABEL] }];
    shape.value = getShape(typeIri as string);
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
    if (propertyIri && valueIri) {
      const containingEntity = await EntityService.getPartialEntity(valueIri as string, [RDF.TYPE, RDFS.LABEL]);
      editorEntity.value[propertyIri as string] = [{ "@id": containingEntity["@id"], name: containingEntity[RDFS.LABEL] }];
    }
  } else {
    showTypeSelector.value = true;
  }
  loading.value = false;
});

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
      editorEntity.value = _.cloneDeep(processEntity(creatorSavedEntity.value));
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
  () => _.cloneDeep(editorEntity.value),
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
  FilerService.fileEntity(entity, "http://endhealth.info/user/" + currentUser.id + "#", IM.UPDATE_ALL);
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
        console.log("submit");
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
              text: "Entity: " + editorEntity.value["http://endhealth.info/im#id"] + " has been created.",
              icon: "success",
              showCancelButton: true,
              reverseButtons: true,
              confirmButtonText: "Open in Viewer",
              confirmButtonColor: "#2196F3",
              cancelButtonColor: "#607D8B"
            }).then((result: any) => {
              if (result.isConfirmed) {
                directService.view(editorEntity.value["http://endhealth.info/im#id"]);
              } else {
                directService.edit(editorEntity.value["http://endhealth.info/im#id"]);
              }
            });
          }
        });
      } else {
        console.log("invalid entity");
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
      currentStep.value = 0;
      router.push(stepsItems.value[currentStep.value].to);
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
  position: absolute;
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

.button-bar {
  flex: 0 1 auto;
  padding: 1rem 1rem 1rem 0;
  gap: 0.5rem;
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}
</style>
