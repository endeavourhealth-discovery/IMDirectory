<template>
  <div id="topbar-editor-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>IM Editor:</strong></span>
          <span class="entity-name" v-tooltip="{ value: entityName, class: 'name-tooltip' }" data-testid="entity-title-name">{{ entityName }}</span>
        </div>
      </template>
    </TopBar>
    <ConfirmDialog></ConfirmDialog>
    <TestQueryResults
      v-if="showTestQueryResults"
      :showDialog="showTestQueryResults"
      :queryRequest="JSON.parse(editorEntity[IM.DEFINITION])"
      @close-dialog="showTestQueryResults = false"
    />
    <div id="editor-main-container">
      <div class="content-buttons-container">
        <div class="content-sidebar-container">
          <div v-if="loading" class="loading-container">
            <ProgressSpinner />
          </div>
          <div v-else class="steps-content">
            <Steps :model="stepsItems" :readonly="false" @click="stepsClicked" />
            <router-view v-slot="{ Component }">
              <component :is="Component" :shape="groups.length ? groups[currentStep] : undefined" :mode="EditorMode.EDIT" />
            </router-view>
          </div>
          <Divider v-if="showSidebar" layout="vertical" />
          <div v-if="showSidebar" class="sidebar-container">
            <SideBar :editorEntity="editorEntity" />
          </div>
          <Button
            class="p-button-rounded p-button-outlined sidebar-toggle"
            :label="showSidebar ? 'hide sidebar' : 'show sidebar'"
            @click="onShowSidebar"
            severity="info"
            data-testid="show-sidebar-button"
          />
        </div>
        <div class="button-bar" id="editor-button-bar">
          <Button :disabled="currentStep === 0" icon="pi pi-angle-left" label="Back" @click="stepsBack" data-testid="back-button" />
          <Button icon="pi pi-times" label="Cancel" severity="secondary" @click="router.go(-1)" data-testid="cancel-button" />
          <Button v-if="hasQueryDefinition" icon="pi pi-bolt" label="Test query" severity="help" @click="testQuery" />
          <Button icon="pi pi-refresh" label="Reset" severity="warning" @click="refreshEditor" data-testid="refresh-button" />
          <Button icon="pi pi-check" label="Save" class="save-button" @click="submit" data-testid="submit-button" />
          <Button :disabled="currentStep >= stepsItems.length - 1" icon="pi pi-angle-right" label="Next" @click="stepsForward" data-testid="forward-button" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TypeSelector from "@/components/creator/TypeSelector.vue";
import StepsGroup from "@/components/editor/StepsGroup.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: { StepsGroup, TypeSelector }
});
</script>

<script setup lang="ts">
import { computed, ComputedRef, onMounted, onUnmounted, provide, ref, Ref, watch } from "vue";
import SideBar from "@/components/editor/SideBar.vue";
import TestQueryResults from "@/components/editor/shapeComponents/setDefinition/TestQueryResults.vue";
import TopBar from "@/components/shared/TopBar.vue";
import injectionKeys from "@/injectionKeys/injectionKeys";
import { useRouter, useRoute } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import _ from "lodash";
import Swal from "sweetalert2";
import ConfirmDialog from "primevue/confirmdialog";
import { setupEditorEntity } from "@/composables/setupEditorEntity";
import { setupEditorShape } from "@/composables/setupEditorShape";
import { useStore } from "vuex";
import "vue-json-pretty/lib/styles.css";
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, SHACL } from "@im-library/vocabulary";
import { DirectService, EntityService, Env } from "@/services";

const router = useRouter();
const route = useRoute();
const confirm = useConfirm();
const store = useStore();

onUnmounted(() => {
  window.removeEventListener("beforeunload", beforeWindowUnload);
});

const { editorEntity, editorEntityOriginal, fetchEntity, processEntity, editorIri, editorSavedEntity, entityName } = setupEditorEntity();
const { setEditorSteps, shape, stepsItems, getShape, getShapesCombined, groups, processComponentType, processShape, addToShape } = setupEditorShape();

const treeIri: ComputedRef<string> = computed(() => store.state.findInEditorTreeIri);

watch(treeIri, (newValue, oldValue) => {
  if ("" === oldValue && "" !== newValue) showSidebar.value = true;
});

function onShowSidebar() {
  showSidebar.value = !showSidebar.value;
  store.commit("updateFindInEditorTreeIri", "");
}

const loading = ref(true);
const currentStep = ref(0);
const showSidebar = ref(false);
const editorValidity: Ref<{ key: string; valid: boolean }[]> = ref([]);
const valueVariableMap: Ref<Map<string, any>> = ref(new Map<string, any>());
const showTestQueryResults: Ref<boolean> = ref(false);

provide(injectionKeys.editorValidity, { validity: editorValidity, updateValidity, removeValidity });

provide(injectionKeys.editorEntity, { editorEntity, updateEntity, deleteEntityKey });
provide(injectionKeys.valueVariableMap, { valueVariableMap, updateValueVariableMap });

onMounted(async () => {
  loading.value = true;
  await store.dispatch("fetchFilterSettings");
  await fetchEntity();
  if (isObjectHasKeys(editorEntityOriginal.value, [RDF.TYPE])) {
    await getShapesCombined(editorEntityOriginal.value[RDF.TYPE], findPrimaryType());
    if (shape.value) processShape(shape.value, EditorMode.EDIT, editorEntity.value);
    router.push(stepsItems.value[0].to);
  } else window.location.href = Env.DIRECTORY_URL;
  loading.value = false;
});

watch(
  () => _.cloneDeep(editorEntity.value),
  () => {
    if (checkForChanges()) {
      window.addEventListener("beforeunload", beforeWindowUnload);
    } else {
      window.removeEventListener("beforeunload", beforeWindowUnload);
    }
  }
);

const directService = new DirectService();
const hasQueryDefinition: ComputedRef<boolean> = computed(() => isObjectHasKeys(editorEntity.value, [IM.DEFINITION]));

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

function updateValueVariableMap(key: string, value: any) {
  valueVariableMap.value.set(key, value);
}

function updateValidity(data: { key: string; valid: boolean }) {
  const index = editorValidity.value.findIndex(item => item.key === data.key);
  if (index) editorValidity.value[index] = data;
  else editorValidity.value.push(data);
}

function removeValidity(data: { key: string; valid: boolean }) {
  const index = editorValidity.value.findIndex(item => (item.key = data.key));
  if (index) editorValidity.value.splice(index, 1);
}

function stepsClicked(event: any) {
  currentStep.value = event.target.innerHTML - 1;
}

async function updateType(types: TTIriRef[]) {
  loading.value = true;
  await getShapesCombined(types, findPrimaryType());
  if (shape.value) processShape(shape.value, EditorMode.EDIT, editorEntity.value);
  editorEntity.value[RDF.TYPE] = types;
  // removeEroneousKeys();
  loading.value = false;
}

function removeEroneousKeys() {
  const shapeKeys = [] as string[];
  groups.value.forEach((group: any) => {
    group.property.forEach((property: PropertyShape) => {
      shapeKeys.push(property.path["@id"]);
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

function updateEntity(data: any) {
  if (isArrayHasLength(data)) {
    data.forEach((item: any) => {
      if (isObjectHasKeys(item)) {
        for (const [key, value] of Object.entries(item)) {
          editorEntity.value[key] = value;
        }
      }
    });
  } else if (isObjectHasKeys(data)) {
    if (isObjectHasKeys(data, [RDF.TYPE])) {
      if (!isObjectHasKeys(editorEntity.value, [RDF.TYPE])) updateType(data[RDF.TYPE]);
      else if (JSON.stringify(editorEntity.value[RDF.TYPE]) !== JSON.stringify(data[RDF.TYPE])) updateType(data[RDF.TYPE]);
    } else {
      for (const [key, value] of Object.entries(data)) {
        editorEntity.value[key] = value;
      }
    }
  }
  store.commit("updateEditorSavedEntity", editorEntity.value);
}

function deleteEntityKey(data: string) {
  if (data) delete editorEntity.value[data];
}

function checkForChanges() {
  if (_.isEqual(editorEntity.value, editorEntityOriginal.value)) {
    store.commit("updateEditorHasChanges", false);
    return false;
  } else {
    store.commit("updateEditorHasChanges", true);
    return true;
  }
}

async function submit(): Promise<void> {
  if (await isValidEntity(editorEntity.value)) {
    console.log("submit");
    await Swal.fire({
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
      preConfirm: async () => {
        const res = await EntityService.updateEntity(editorEntity.value);
        if (res) {
          store.commit("updateEditorSavedEntity", undefined);
          return res;
        } else Swal.showValidationMessage("Error saving entity to server.");
      }
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Success",
          text: "Entity: " + editorEntity.value["http://endhealth.info/im#id"] + " has been updated.",
          icon: "success",
          showCancelButton: true,
          reverseButtons: true,
          confirmButtonText: "Open in Viewer",
          confirmButtonColor: "#2196F3",
          cancelButtonColor: "#607D8B"
        }).then(async (result: any) => {
          if (result.isConfirmed) {
            directService.view(editorEntity.value["http://endhealth.info/im#id"]);
          } else {
            await fetchEntity();
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

async function isValidEntity(entity: any): Promise<boolean> {
  return isObjectHasKeys(entity) && editorValidity.value.every(validity => validity.valid);
}

function testQuery() {
  if (editorEntity?.value?.[IM.DEFINITION]) showTestQueryResults.value = true;
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
</script>

<style scoped>
#topbar-editor-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}

#editor-main-container {
  width: 100%;
  height: calc(100% - 3.5rem);
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

.sidebar-container {
  width: 50vw;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding-top: 3rem;
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

.sidebar-toggle {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #ffffff !important;
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
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
  width: 100%;
  padding-top: 1rem;
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

.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.entity-name {
  margin-left: 0.5rem;
  font-size: 1.5rem;
  overflow: hidden;
  height: 1.75rem;
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
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #ffffff !important;
}

#summary-editor-container {
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
}
</style>
