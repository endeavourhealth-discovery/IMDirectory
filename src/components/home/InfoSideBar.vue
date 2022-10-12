<template>
  <div id="info-side-bar-wrapper" v-if="visible">
    <div id="concept-empty-container" v-if="selectedConceptIri === 'http://endhealth.info/im#Favourites'">
      <div class="header">
        <div class="title">
          <span data-testid="favourites-message">Please select an item to display</span>
        </div>
        <Button class="p-button-rounded p-button-text p-button-plain header-close-button" icon="pi pi-times" @click="closeBar" />
      </div>
    </div>
    <div id="concept-main-container" v-else>
      <div class="header">
        <PanelHeader :types="types" :header="header" data-testid="panel-header" />
        <Button
          class="p-button-rounded p-button-text p-button-plain header-close-button"
          icon="pi pi-times"
          @click="closeBar"
          data-testid="header-close-button"
        />
      </div>
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else id="concept-content-dialogs-container">
        <div id="concept-panel-container">
          <TabView :lazy="true" :active-index="activeTab" id="info-side-bar-tabs">
            <TabPanel header="Details">
              <div v-if="isObjectHasKeys(concept)" class="concept-panel-content" id="definition-container">
                <Definition :concept="concept" :configs="configs" />
              </div>
            </TabPanel>
            <TabPanel header="Hierarchy position">
              <div class="concept-panel-content" id="secondary-tree-container">
                <SecondaryTree :conceptIri="selectedConceptIri" />
              </div>
            </TabPanel>
            <TabPanel v-if="terms" header="Terms">
              <div class="concept-panel-content" id="term-table-container">
                <TermCodeTable :terms="terms" />
              </div>
            </TabPanel>
            <TabPanel v-if="isRecordModel(types)" header="Data Model">
              <div class="concept-panel-content" id="data-model-container">
                <DataModel :conceptIri="conceptIri" />
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch, reactive } from "vue";
import Definition from "./infoSideBar/Definition.vue";
import DataModel from "./infoSideBar/dataModel/DataModel.vue";
import PanelHeader from "./infoSideBar/PanelHeader.vue";
import { DefinitionConfig, TTIriRef, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers, Models, Services } from "im-library";
import { mapState, useStore } from "vuex";
import { useRouter } from "vue-router";
import { setupConcept, loadMore, setupConfig, getInferred, setupTerms } from "./InfoSideBarMethods";
import axios from "axios";
const { IM, RDF, RDFS } = Vocabulary;
const {
  ConceptTypeMethods: { isQuery, isRecordModel },
  DataTypeCheckers: { isObjectHasKeys },
  ContainerDimensionGetters: { getContainerElementOptimalHeight },
  Sorters: { byOrder }
} = Helpers;
const { ConfigService, EntityService, LoggerService } = Services;

const props = defineProps({
  visible: { type: Boolean, required: true }
});

const emit = defineEmits({
  closeBar: () => true
});

const router = useRouter();
const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);
const selectedConceptIri = computed(() => store.state.selectedConceptIri);
const locateOnNavTreeIri = computed(() => store.state.locateOnNavTreeIri);
const activeProfile = computed({
  get() {
    store.state.activeProfile;
  },
  set(newValue) {
    store.commit("updateActiveProfile", newValue);
  }
});

watch(
  () => conceptIri.value,
  newValue => {
    if (newValue) store.commit("updateSelectedConceptIri", newValue);
    else closeBar();
  }
);

watch(
  () => selectedConceptIri.value,
  async newValue => {
    if (newValue && newValue !== concept.value["@id"]) await init();

    tabMap.clear();
    setTabMap();
    if (isRecordModel(types.value)) {
      activeTab.value = tabMap.get("Data Model") || 0;
    } else {
      activeTab.value = 0;
    }
  }
);

watch(
  () => locateOnNavTreeIri.value,
  () => (activeTab.value = 1)
);

const loading = ref(false);
const definitionText = ref("");
const types: Ref<TTIriRef[]> = ref([]);
const header = ref("");
const conceptAsString = ref("");

const profile = ref({} as Models.Query.Profile);
const activeTab = ref(0);

const { concept, getConcept }: { concept: Ref<any>; getConcept: Function } = setupConcept();
const { configs, getConfig }: { configs: Ref<DefinitionConfig[]>; getConfig: Function } = setupConfig();
const { terms, getTerms }: { terms: Ref<any[] | undefined>; getTerms: Function } = setupTerms();
let tabMap = reactive(new Map<string, number>());

onMounted(async () => {
  if (!selectedConceptIri.value && conceptIri.value) store.commit("updateSelectedConceptIri", conceptIri.value);
  await init();
  setTabMap();
  if (isRecordModel(types.value)) {
    activeTab.value = tabMap.get("Data Model") || 0;
  } else {
    activeTab.value = 0;
  }
});

function setTabMap() {
  const tabList = document.getElementById("info-side-bar-tabs")?.children?.[0]?.children?.[0]?.children?.[0]?.children as HTMLCollectionOf<HTMLElement>;
  if (tabList && tabList.length) {
    for (let i = 0; i < tabList.length; i++) {
      if (tabList[i].textContent) {
        tabMap.set(tabList[i].textContent as string, i);
      }
    }
  }
}

function closeBar() {
  emit("closeBar");
}

function directToEditRoute(): void {
  router.push({
    name: "Edit",
    params: { iri: concept.value["@id"] }
  });
}

function directToCreateRoute(): void {
  router.push({ name: "Create" });
}

async function init(): Promise<void> {
  loading.value = true;
  await getConfig();
  await getConcept(selectedConceptIri.value, configs);
  await getInferred(selectedConceptIri.value, concept);
  await getTerms(selectedConceptIri.value);
  types.value = isObjectHasKeys(concept.value, [RDF.TYPE]) ? concept.value[RDF.TYPE] : ([] as TTIriRef[]);
  header.value = concept.value[RDFS.LABEL];
  loading.value = false;
}
</script>
<style scoped>
#info-side-bar-wrapper {
  transition: 0.5s;
  flex: 0 0 40%;
  height: 100%;
}

#concept-main-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  border-left: 1px solid #dee2e6;
}

#concept-empty-container {
  height: 100%;
  width: 100%;
  border-left: 1px solid #dee2e6;
}

.loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
}

.header {
  width: 100%;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
  background: #f8f9fa;
  color: #495057;
  display: flex;
  justify-content: space-between;
}

.header-close-button {
  flex: 0 1 auto;
}

.header-close-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}

#concept-content-dialogs-container {
  flex: 1 1 auto;
  overflow: auto;
}

#concept-panel-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}

.p-tabview {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

#concept-panel-container:deep(.p-tabview-panels) {
  flex: 1 1 auto;
  overflow: auto;
}

#concept-panel-container:deep(.p-tabview-panel) {
  height: 100%;
  overflow: auto;
}

.p-panel {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  height: 100%;
}

.concept-panel-content {
  height: 100%;
  overflow: auto;
  background-color: #ffffff;
  display: flex;
}

.copy-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.icons-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
</style>
