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
    <TestQueryResults
      v-if="showTestQueryResults"
      :showDialog="showTestQueryResults"
      :imquery="JSON.parse(editorEntity[IM.DEFINITION])"
      @close-dialog="showTestQueryResults = false"
    />
    <div id="creator-main-container">
      <div class="content-buttons-container">
        <div class="content-sidebar-container">
          <div v-if="loading" class="loading-container">
            <ProgressSpinner />
          </div>
          <div v-else class="steps-content">
            <Steps :model="stepsItems" :readonly="false" @click="stepsClicked" />
            <router-view v-slot="{ Component }">
              <keep-alive>
                <component :is="Component" :shape="groups.length ? groups[currentStep - 1] : undefined" :mode="EditorMode.CREATE" />
              </keep-alive>
            </router-view>
          </div>
          <Divider v-if="showSidebar" layout="vertical" />
          <div v-if="showSidebar" class="sidebar-container">
            <SideBar :editorEntity="editorEntity" />
          </div>
          <Button
            class="p-button-rounded p-button-info p-button-outlined sidebar-toggle"
            :label="showSidebar ? 'hide sidebar' : 'show sidebar'"
            @click="onShowSidebar"
          />
        </div>
        <div class="button-bar" id="creator-button-bar">
          <Button :disabled="currentStep === 0" icon="pi pi-angle-left" label="Back" @click="stepsBack" />
          <Button icon="pi pi-refresh" label="Reset" class="p-button-warning" @click="refreshCreator" />
          <Button v-if="groups[currentStep - 1]?.name === 'Members'" icon="pi pi-bolt" label="Test query" class="p-button-help" @click="testQuery" />
          <Button icon="pi pi-check" label="Create" class="p-button-success save-button" @click="submit" />
          <Button :disabled="currentStep >= stepsItems.length - 1" icon="pi pi-angle-right" label="Next" @click="stepsForward" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TypeSelector from "@/components/creator/TypeSelector.vue";
import StepsGroup from "@/components/editor/StepsGroup.vue";
import { isFolder } from "@/im_library/helpers/modules/ConceptTypeMethods";

export default defineComponent({
  components: { StepsGroup, TypeSelector }
});
</script>

<script setup lang="ts">
import { onUnmounted, onBeforeUnmount, onMounted, computed, ref, Ref, watch, inject, defineComponent, PropType, provide, nextTick, ComputedRef } from "vue";
import SideBar from "@/components/editor/SideBar.vue";
import TestQueryResults from "@/components/editor/shapeComponents/setDefinition/TestQueryResults.vue";
import TopBar from "@/im_library/components/modules/TopBar.vue";
import _ from "lodash";
import axios from "axios";
import { useStore } from "vuex";
import Swal from "sweetalert2";
import { setupShape, setupEntity } from "./EditorMethods";
import { useConfirm } from "primevue/useconfirm";
import { useRoute, useRouter } from "vue-router";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { FormGenerator, PropertyGroup, PropertyShape, TTIriRef } from "@/im_library/interfaces";
import { EditorMode } from "@/im_library/enums";
import { DataTypeCheckers, ConceptTypeMethods, EntityValidator, Converters, UtililityMethods } from "@/im_library/helpers";
import { IM, RDF, RDFS, SHACL } from "@/im_library/vocabulary";
import { EntityService, Env, FilerService } from "@/im_library/services";

const { isObjectHasKeys, isArrayHasLength } = DataTypeCheckers;
const { isValueSet } = ConceptTypeMethods;
const { hasValidIri, hasValidName, hasValidParents, hasValidTypes, hasValidStatus } = EntityValidator;
const { iriToUrl } = Converters;
const { debounce } = UtililityMethods;

const props = defineProps({ type: { type: Object as PropType<TTIriRef>, required: false } });

const router = useRouter();
const store = useStore();
const confirm = useConfirm();

const creatorSavedEntity = computed(() => store.state.creatorSavedEntity);

onBeforeUnmount(() => {
  confirmLeavePage();
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", beforeWindowUnload);
});

const hasType = computed<boolean>(() => {
  return isObjectHasKeys(editorEntity.value, [RDF.TYPE]);
});

const treeIri: ComputedRef<string> = computed(() => store.state.findInEditorTreeIri);

watch(treeIri, (newValue, oldValue) => {
  if ("" === oldValue && "" !== newValue) showSidebar.value = true;
});

function onShowSidebar() {
  showSidebar.value = !showSidebar.value;
  store.commit("updateFindInEditorTreeIri", "");
}

const { editorEntity, editorEntityOriginal, fetchEntity, processEntity, editorIri, editorSavedEntity, entityName } = setupEntity();
const { setCreatorSteps, shape, stepsItems, getShape, getShapesCombined, groups, processComponentType, processShape, addToShape } = setupShape();

const loading: Ref<boolean> = ref(true);
const currentStep: Ref<number> = ref(0);
const showSidebar: Ref<boolean> = ref(false);
const creatorValidity: Ref<{ key: string; valid: boolean }[]> = ref([]);
const targetShape: Ref<TTIriRef | undefined> = ref();
const valueVariableMap: Ref<Map<string, any>> = ref(new Map<string, any>());
const showTestQueryResults: Ref<boolean> = ref(false);
const route = useRoute();

provide(injectionKeys.editorValidity, { validity: creatorValidity, updateValidity, removeValidity });

provide(injectionKeys.editorEntity, { editorEntity, updateEntity, deleteEntityKey });
provide(injectionKeys.valueVariableMap, { valueVariableMap, updateValueVariableMap });

onMounted(async () => {
  loading.value = true;

  if (isObjectHasKeys(creatorSavedEntity.value, ["@id"])) {
    await showEntityFoundWarning();
  }
  if (props.type) {
    await getShape(props.type["@id"]);
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
  } else if (isObjectHasKeys(editorEntity.value, [RDF.TYPE])) {
    await getShapesCombined(editorEntity.value[RDF.TYPE], findPrimaryType());
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
    await nextTick();
    router.push(stepsItems.value[1].to);
  } else if (route.query.typeIri) {
    const typeEntity = await EntityService.getPartialEntity(route.query.typeIri as string, [RDFS.LABEL]);
    editorEntity.value[RDF.TYPE] = [{ "@id": route.query.typeIri, name: typeEntity[RDFS.LABEL] }];
    shape.value = await getShape(route.query.typeIri as string);
    if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
    router.push(stepsItems.value[1].to);
    if (route.query.subClassOfIri) {
      const containingEntity = await EntityService.getPartialEntity(route.query.subClassOfIri as string, [RDF.TYPE, RDFS.LABEL]);
      if (isFolder(containingEntity[RDF.TYPE])) {
        editorEntity.value[RDFS.SUBCLASS_OF] = [{ "@id": route.query.subClassOfIri, name: containingEntity[RDFS.LABEL] }];
      } else {
        editorEntity.value[IM.IS_CONTAINED_IN] = [{ "@id": route.query.subClassOfIri, name: containingEntity[RDFS.LABEL] }];
      }
    }
  } else {
    router.push({ name: "TypeSelector", params: route.params });
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

const currentUser = computed(() => store.state.currentUser).value;

const debouncedFiler = debounce((entity: any) => {
  fileChanges(entity);
}, 500);

function updateValueVariableMap(key: string, value: any) {
  valueVariableMap.value.set(key, value);
}

function updateValidity(data: { key: string; valid: boolean }) {
  const index = creatorValidity.value.findIndex(item => item.key === data.key);
  if (index != -1) creatorValidity.value[index] = data;
  else creatorValidity.value.push(data);
}

function removeValidity(data: { key: string; valid: boolean }) {
  const index = creatorValidity.value.findIndex(item => (item.key = data.key));
  if (index) creatorValidity.value.splice(index, 1);
}

function stepsClicked(event: any) {
  console.log(event.target.innerHTML);
  currentStep.value = event.target.innerHTML - 1;
}

function findPrimaryType(): TTIriRef | undefined {
  if (!(isObjectHasKeys(editorEntity.value, [RDF.TYPE]) && isArrayHasLength(editorEntity.value[RDF.TYPE]))) return undefined;
  if (
    isObjectHasKeys(editorEntityOriginal, [RDF.TYPE]) &&
    isArrayHasLength(editorEntityOriginal.value[RDF.TYPE]) &&
    editorEntityOriginal.value[RDF.TYPE].length === 1 &&
    isObjectHasKeys(editorEntity.value, [RDF.TYPE]) &&
    isArrayHasLength(editorEntity.value[RDF.TYPE])
  ) {
    const found = editorEntity.value[RDF.TYPE].find((type: TTIriRef) => type === editorEntityOriginal.value[RDF.TYPE][0]);
    if (found) return found;
  }
  if (editorEntity.value[RDF.TYPE].length === 1) return editorEntity.value[RDF.TYPE][0];
  if (editorEntity.value[RDF.TYPE].findIndex((type: TTIriRef) => type["@id"] === SHACL.NODESHAPE)) {
    const found = editorEntity.value[RDF.TYPE].find((type: TTIriRef) => type["@id"] === SHACL.NODESHAPE);
    if (found) return found;
  }
  return editorEntity.value[0];
}

async function updateType(types: TTIriRef[]) {
  loading.value = true;
  await getShapesCombined(types, findPrimaryType());
  if (shape.value) processShape(shape.value, EditorMode.CREATE, editorEntity.value);
  editorEntity.value[RDF.TYPE] = types;
  loading.value = false;
  if (currentStep.value === 0) stepsForward();
}

function confirmLeavePage() {
  if (checkForChanges()) {
    confirm.require({
      message: "All unsaved changes will be lost. Are you sure you want to proceed?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        return true;
      },
      reject: () => {
        return false;
      }
    });
  } else {
    return true;
  }
}

function beforeWindowUnload(e: any) {
  if (checkForChanges()) {
    e.preventDefault();
    e.returnValue = "";
  }
}

function updateEntity(data: any) {
  let wasUpdated = false;
  if (isArrayHasLength(data)) {
    data.forEach((item: any) => {
      if (isObjectHasKeys(item)) {
        for (const [key, value] of Object.entries(item)) {
          editorEntity.value[key] = value;
          wasUpdated = true;
        }
      }
    });
  } else if (isObjectHasKeys(data)) {
    if (isObjectHasKeys(data, [RDF.TYPE])) {
      if (!isObjectHasKeys(editorEntity.value, [RDF.TYPE])) {
        updateType(data[RDF.TYPE]);
        wasUpdated = true;
      } else if (JSON.stringify(editorEntity.value[RDF.TYPE]) !== JSON.stringify(data[RDF.TYPE])) {
        updateType(data[RDF.TYPE]);
        wasUpdated = true;
      }
    } else {
      for (const [key, value] of Object.entries(data)) {
        editorEntity.value[key] = value;
        wasUpdated = true;
      }
    }
  }
  if (wasUpdated && isValidEntity(editorEntity.value)) {
    store.commit("updateCreatorSavedEntity", editorEntity.value);
  }
}

function deleteEntityKey(data: string) {
  if (data) delete editorEntity.value[data];
}

function fileChanges(entity: any) {
  FilerService.fileEntity(entity, "http://endhealth.info/user/" + currentUser.id + "#", IM.UPDATE_ALL);
}

function checkForChanges() {
  if (JSON.stringify(editorEntity.value) === JSON.stringify(editorEntityOriginal.value)) {
    return false;
  } else {
    return true;
  }
}

async function submit(): Promise<void> {
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
          store.commit("updateCreatorSavedEntity", undefined);
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
            window.location.href = Env.DIRECTORY_URL + "concept?selectedIri=" + iriToUrl(editorEntity.value["http://endhealth.info/im#id"]);
          } else {
            router.push({ name: "Editor", params: { selectedIri: editorEntity.value["http://endhealth.info/im#id"] } });
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
}

function testQuery() {
  if (editorEntity?.value?.[IM.DEFINITION]) showTestQueryResults.value = true;
}

function isValidEntity(entity: any): boolean {
  return isObjectHasKeys(entity) && entity["http://endhealth.info/im#id"] && creatorValidity.value.every(validity => validity.valid);
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

function stepsBack() {
  currentStep.value--;
  if (currentStep.value >= 0) router.push(stepsItems.value[currentStep.value].to);
}

function stepsForward() {
  currentStep.value++;
  if (currentStep.value < stepsItems.value.length) router.push(stepsItems.value[currentStep.value].to);
}

defineExpose({ confirmLeavePage });
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
  background-color: #ffffff;
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

.steps-content {
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
  top: 5px;
  right: 5px;
  background-color: #ffffff !important;
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
  border-bottom: 1px solid #dee2e6;
  border-left: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
  border-radius: 3px;
  background-color: #ffffff;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}
</style>

<style>
.p-steps-number {
  z-index: 0 !important;
}
</style>
