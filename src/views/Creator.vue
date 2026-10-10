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
            <template v-for="(group, index) of groups" v-bind:key="index">
              <component
                :is="processComponentType(group.componentType)"
                :mode="EditorMode.CREATE"
                :shape="group"
                :value="processEntityValue(group)"
                @onCancel="closeCreator"
              />
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
import { defineComponent } from "vue";

import TypeSelector from "@/components/creator/TypeSelector.vue";
import ArrayBuilder from "@/components/editor/shapeComponents/ArrayBuilder.vue";
import ComponentGroup from "@/components/editor/shapeComponents/ComponentGroup.vue";
import DropdownTextInputConcatenator from "@/components/editor/shapeComponents/DropdownTextInputConcatenator.vue";
import EntityAutoComplete from "@/components/editor/shapeComponents/EntityAutoComplete.vue";
import EntityComboBox from "@/components/editor/shapeComponents/EntityComboBox.vue";
import EntityDropdown from "@/components/editor/shapeComponents/EntityDropdown.vue";
import EntitySearch from "@/components/editor/shapeComponents/EntitySearch.vue";
import HorizontalLayout from "@/components/editor/shapeComponents/HorizontalLayout.vue";
import HtmlInput from "@/components/editor/shapeComponents/HtmlInput.vue";
import IndicatorDefinition from "@/components/editor/shapeComponents/IndicatorDefinition.vue";
import MapEntryBuilder from "@/components/editor/shapeComponents/MapEntryBuilder.vue";
import QueryDefinitionBuilder from "@/components/editor/shapeComponents/QueryDefinitionBuilder.vue";
import TextDisplay from "@/components/editor/shapeComponents/TextDisplay.vue";
import TextInput from "@/components/editor/shapeComponents/TextInput.vue";
import ToggleableComponent from "@/components/editor/shapeComponents/ToggleableComponent.vue";
import VerticalLayout from "@/components/editor/shapeComponents/VerticalLayout.vue";

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
    IndicatorDefinition,
    ComponentGroup,
    MapEntryBuilder,
    DropdownTextInputConcatenator
  }
});
</script>

<script lang="ts" setup>
import { ComputedRef, Ref, computed, onMounted, onUnmounted, provide, ref, watch } from "vue";

import { AlertDialog } from "@endeavour/vue-library/components";
import { DisplayMode } from "@endeavour/vue-library/enums";
import { IM, RDF, RDFS } from "@endeavour/vue-library/enums";
import { isArrayOf, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import { type PropertyShape, type TTEntity, TTEntitySchema, type TTIriRef, isTTIriRef } from "@endeavour/vue-library/models";
import { useUserStore } from "@endeavour/vue-library/stores";
import { useDialogStore } from "@endeavour/vue-library/stores";

import { cloneDeep } from "lodash-es";
import { useDialog } from "primevue/usedialog";
import { useRoute, useRouter } from "vue-router";

import SideBar from "@/components/editor/SideBar.vue";
import TopBar from "@/components/shared/TopBar.vue";
import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import { useDirectService } from "@/composables/useDirectService";
import { useEditorEntity } from "@/composables/useEditorEntity";
import { useEditorShape } from "@/composables/useEditorShape";
import { useValidity } from "@/composables/useValidity";
import { useValueVariableMap } from "@/composables/useValueVariableMap";
import { EditorMode } from "@/enums";
import { processComponentType } from "@/helpers/EditorMethods";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { EditRequest, EditRequestSchema } from "@/models";
import { QueryService } from "@/services";
import { EntityService, SecurityService, SetService } from "@/services";
import { useCreatorStore } from "@/stores/creatorStore";
import { useEditorStore } from "@/stores/editorStore";
import { useFilterStore } from "@/stores/filterStore";

interface Props {
  type?: TTIriRef;
}

const props = defineProps<Props>();

const route = useRoute();
const router = useRouter();
const dynamicDialog = useDialog();
const dialogStore = useDialogStore();
const creatorStore = useCreatorStore();
const editorStore = useEditorStore();
const userStore = useUserStore();
const filterStore = useFilterStore();
const creatorSavedEntity = computed(() => creatorStore.creatorSavedEntity);
const treeIri: ComputedRef<string> = computed(() => editorStore.findInEditorTreeIri);
const currentUser = computed(() => userStore.currentUser);

watch(treeIri, (newValue, oldValue) => {
  if ("" === oldValue && "" !== newValue) showSidebar.value = true;
});

function onShowSidebar() {
  showSidebar.value = !showSidebar.value;
  editorStore.updateFindInEditorTreeIri("");
}

const { editorEntity, editorEntityOriginal, processEntity, findPrimaryType, updateEntity, deleteEntityKey, checkForChanges } = useEditorEntity(
  EditorMode.CREATE,
  updateType
);
const { shape, getShape, getShapesCombined, groups, processShape } = useEditorShape();
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
  checkValidity,
  checkExists
} = useValidity(shape.value);
const { valueVariableMap, updateValueVariableMap, valueVariableHasChanged } = useValueVariableMap();

const loading: Ref<boolean> = ref(true);
const currentStep: Ref<number> = ref(0);
const showSidebar: Ref<boolean> = ref(false);
const showTypeSelector = ref(false);
const forceValidation = ref(false);
const linkedEntities: Ref<TTEntity[]> = ref([]);
provide(injectionKeys.editorValidity, { validity: editorValidity, updateValidity, removeValidity, checkValidity });
provide("linkedEntities", linkedEntities);
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
  if (currentUser.value && currentUser.value.namespaces.length < 1) {
    await router.push({ name: "AccessDenied" });
  }
  await filterStore.fetchFilterSettings();
  const { typeIri, propertyIri, valueIri } = route.query;
  if (isObjectHasKeys(creatorSavedEntity.value, ["iri"])) {
    await showEntityFoundWarning();
  }
  if (props.type) {
    getShape(props.type.iri);
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
  } else if (isObjectHasKeys(editorEntity.value, [RDF.TYPE]) && isArrayOf(editorEntity.value[RDF.TYPE], isTTIriRef)) {
    getShapesCombined(editorEntity.value[RDF.TYPE], findPrimaryType());
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
  } else if (typeIri) {
    const typeIriFixed = removeEndSlash(typeIri as string);
    currentStep.value = 1;
    const typeEntity = await EntityService.getPartialEntity(typeIriFixed, [RDFS.LABEL]);
    if (typeof typeEntity[RDFS.LABEL] === "string") {
      editorEntity.value[RDF.TYPE] = [{ iri: typeIriFixed, name: typeEntity[RDFS.LABEL] }];
    }
    shape.value = getShape(typeIriFixed);
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
    if (propertyIri && valueIri) {
      const propertyIriFixed = removeEndSlash(propertyIri as string);
      const valueIriFixed = removeEndSlash(valueIri as string);
      if (typeIriFixed === IM.QUERY && propertyIriFixed === IM.IS_CHILD_OF) {
        const baseQuery = await QueryService.getDisplayFromQueryIri(valueIriFixed, DisplayMode.LOGICAL);
        if (baseQuery) {
          editorEntity.value[IM.DEFINITION] = JSON.stringify({
            typeOf: baseQuery?.typeOf,
            and: [
              {
                is: [{ iri: valueIriFixed, cohort: true }]
              }
            ]
          });
        }
      }
      if (propertyIriFixed === IM.DEFINITION) {
        const newValue = await QueryService.getDisplayFromQueryIri(valueIriFixed, DisplayMode.ORIGINAL);
        if (newValue) {
          if (newValue.typeOf) {
            editorEntity.value[IM.RETURN_TYPE] = newValue.typeOf;
          }
          editorEntity.value[IM.DEFINITION] = JSON.stringify({
            match: [
              {
                is: [
                  {
                    iri: newValue.iri,
                    name: newValue.name
                  }
                ],
                description: newValue.description
              }
            ],
            typeOf: {
              iri: newValue.typeOf!.iri
            }
          });
        }
      } else {
        const containingEntity = await EntityService.getPartialEntity(valueIriFixed, [RDFS.LABEL]);
        if (typeof containingEntity.iri === "string" && typeof containingEntity[RDFS.LABEL] === "string")
          editorEntity.value[propertyIriFixed] = [
            {
              iri: containingEntity.iri,
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
  await dialogStore
    .open(AlertDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        title: "Unsaved creator entity found",
        html:
          "<span>Local saved entity found. Would you like to continue creating this entity?</span><br/><br/><span>iri: " +
          creatorSavedEntity.value?.iri +
          "</span><br/><span>name: " +
          creatorSavedEntity.value?.[RDFS.LABEL] +
          "</span>",
        showCloseButton: false,
        showCancelButton: true,
        cancelButtonText: "No",
        confirmButtonText: "Yes",
        reverseButtons: true
      }
    })
    .then(async (result: any) => {
      if (result?.confirm) {
        editorEntityOriginal.value = {};
        editorEntity.value = cloneDeep(processEntity(creatorSavedEntity.value));
        currentStep.value = 1;
      } else {
        await dialogStore
          .open(AlertDialog, {
            props: { modal: true, style: { width: "30vw" }, closable: false },
            data: {
              title: "Delete saved entity",
              text: "Continuing will delete locally saved entity with iri: " + creatorSavedEntity.value?.iri + ". Are you sure you want to continue?",
              showCloseButton: false,
              showCancelButton: true,
              cancelButtonText: "Cancel",
              confirmButtonText: "Delete local entity"
            }
          })
          .then(async result => {
            if (result.confirm) {
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
  () => {
    if (checkForChanges()) {
      window.addEventListener("beforeunload", beforeWindowUnload);
    } else {
      window.removeEventListener("beforeunload", beforeWindowUnload);
    }
  }
);

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

function beforeWindowUnload(e: BeforeUnloadEvent) {
  if (checkForChanges()) {
    e.preventDefault();
    e.returnValue = "";
  }
}

async function submit(): Promise<void> {
  if (isObjectHasKeys(editorEntity.value, [IM.ID]) && typeof editorEntity.value[IM.ID] === "string") {
    if (await checkExists(editorEntity.value[IM.ID])) return;
  }
  const verificationDialog = dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Validating", text: "Running validation checks..." }
  });
  if (isObjectHasKeys(editorEntity.value, [IM.ID]) && typeof editorEntity.value[IM.ID] === "string") {
    const namespace = editorEntity.value[IM.ID].substring(0, editorEntity.value[IM.ID].lastIndexOf("#") + 1);
    constructValidationCheckStatus(shape.value);
    forceValidation.value = true;
    validationChecksCompleted()
      .then(async () => {
        forceValidation.value = false;
        verificationDialog.close();
        if (isValidEntity(editorEntity.value)) {
          await dialogStore
            .open(AlertDialog, {
              props: { modal: true, style: { width: "30vw" }, closable: false },
              data: {
                icon: "fa-regular fa-circle-info",
                title: "Confirm create",
                text: "Are you sure you want to create this entity?",
                showCancelButton: true,
                confirmButtonText: "Create",
                reverseButtons: true,
                preConfirm: async () => {
                  if (isObjectHasKeys(editorEntity.value, [IM.HAS_SUBSET])) {
                    await SetService.updateSubsetsFromSuper(editorEntity.value);
                    delete editorEntity.value[IM.HAS_SUBSET];
                  }
                  if (linkedEntities.value.length > 0) {
                    for (const linkedEntity of linkedEntities.value) {
                      linkedEntity[IM.ID] = linkedEntity.iri;
                      await EntityService.createEntity({ entity: linkedEntity, hostUrl: window.location.origin, namespace: namespace } as EditRequest);
                    }
                  }
                  const res = await EntityService.createEntity({
                    entity: editorEntity.value,
                    hostUrl: window.location.origin,
                    namespace: namespace
                  } as EditRequest);
                  if (res) {
                    creatorStore.updateCreatorSavedEntity(undefined);
                    return res;
                  } else {
                    dialogStore.setError("Error creating entity from server.");
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
                      text: "Entity: " + editorEntity.value[IM.ID] + " has been created.",
                      icon: "fa-regular fa-circle-check",
                      reverseButtons: true,
                      confirmButtonText: "Close creator"
                    }
                  })
                  .then(async result => {
                    if (result.confirm) {
                      window.onbeforeunload = null;
                      // If added via addEventListener
                      window.removeEventListener("beforeunload", beforeWindowUnload);
                      router.back();
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
      })
      .catch(async () => {
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
  } else {
    await dialogStore.open(AlertDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-xmark",
        title: "Warning",
        text: "No IRI assigned",
        confirmButtonText: "Close"
      }
    });
    verificationDialog.close();
  }
}

async function closeCreator() {
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
        await router.push("/directory");
      }
    });
}

function processEntityValue(property: PropertyShape) {
  if (isObjectHasKeys(property, ["path"]) && isObjectHasKeys(editorEntity.value, [property.path!.iri])) {
    return editorEntity.value[property.path!.iri];
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

.sidebar-container {
  width: 50vw;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding-top: 3rem;
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
