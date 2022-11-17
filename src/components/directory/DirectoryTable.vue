<template>
  <div id="concept-main-container">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else id="concept-content-dialogs-container">
      <div id="concept-panel-container">
        <TabView :lazy="true" :active-index="activeTab" id="info-side-bar-tabs">
          <TabPanel header="Contents">
            <div v-if="isObjectHasKeys(concept)" class="concept-panel-content" id="definition-container">
              <Content />
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
          <TabPanel v-if="isQuery(types)" header="Query">
            <div class="concept-panel-content" id="query-container">
              <QueryDefinition :conceptIri="conceptIri" />
            </div>
          </TabPanel>
          <TabPanel v-if="isValueSet(types)" header="Set">
            <div class="concept-panel-content" id="set-container">
              <SetDefinition :conceptIri="conceptIri" />
            </div>
          </TabPanel>
          <TabPanel header="Maps" v-if="showMappings">
            <div class="concept-panel-content" id="mappings-container">
              <Mappings :conceptIri="conceptIri" />
            </div>
          </TabPanel>
          <TabPanel header="Used in">
            <div class="concept-panel-content" id="usedin-container">
              <UsedIn :conceptIri="conceptIri" />
            </div>
          </TabPanel>
          <TabPanel header="Entity chart" v-if="showGraph">
            <div class="concept-panel-content" id="entity-chart-container">
              <EntityChart :conceptIri="conceptIri" />
            </div>
          </TabPanel>
          <TabPanel header="Properties" v-if="isRecordModel(types)">
            <div class="concept-panel-content" id="properties-container">
              <Properties :conceptIri="conceptIri" />
            </div>
          </TabPanel>
          <TabPanel header="Terms" v-if="terms">
            <div class="concept-panel-content" id="term-table-container">
              <TermCodeTable :terms="terms" />
            </div>
          </TabPanel>
          <TabPanel header="ECL" v-if="isValueSet(types) && isObjectHasKeys(concept['http://endhealth.info/im#definition'])">
            <div class="concept-panel-content" id="ecl-container">
              <EclDefinition :definition="concept['http://endhealth.info/im#definition']" />
            </div>
          </TabPanel>
          <TabPanel header="Graph">
            <div class="concept-panel-content" id="graph-container">
              <Graph :conceptIri="conceptIri" />
            </div>
          </TabPanel>
          <TabPanel header="Query" v-if="isQuery(types)">
            <div class="concept-panel-content" id="query-container">
              <QueryDefinition :conceptIri="conceptIri" />
            </div>
          </TabPanel>
          <TabPanel header="JSON">
            <div class="concept-panel-content" id="json-container">
              <JSONViewer :conceptIri="conceptIri" />
            </div>
          </TabPanel>
          <TabPanel header="Provenance">
            <div class="concept-panel-content" id="provenance-container">
              <Provenance :conceptIri="conceptIri" />
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch, reactive } from "vue";
import Definition from "../home/infoSideBar/Definition.vue";
import DataModel from "../home/infoSideBar/dataModel/DataModel.vue";
import PanelHeader from "../home/infoSideBar/PanelHeader.vue";
import SetDefinition from "../home/infoSideBar/setDefinition/SetDefinition.vue";
import QueryDefinition from "../home/infoSideBar/QueryDefinition.vue";
import Content from "../home/infoSideBar/Content.vue";

import EntityChart from "../home/infoSideBar/EntityChart.vue";
import Graph from "../home/infoSideBar/graph/Graph.vue";
import UsedIn from "../home/infoSideBar/UsedIn.vue";
import Mappings from "../home/infoSideBar/mapping/Mappings.vue";
import EclDefinition from "../home/infoSideBar/EclDefinition.vue";
import Properties from "../home/infoSideBar/Properties.vue";
import JSONViewer from "../home/infoSideBar/JSONViewer.vue";
import Provenance from "../home/infoSideBar/Provenance.vue";

import { DefinitionConfig, TTIriRef, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers, Models, Services } from "im-library";
import { mapState, useStore } from "vuex";
import { useRouter } from "vue-router";
import { setupConcept, loadMore, setupConfig, getInferred, setupTerms } from "../home/InfoSideBarMethods";
import axios from "axios";
const { IM, RDF, RDFS, SHACL } = Vocabulary;
const {
  ConceptTypeMethods: { isOfTypes, isProperty, isValueSet, isConcept, isQuery, isFolder, isRecordModel },
  DataTypeCheckers: { isObjectHasKeys },
  ContainerDimensionGetters: { getContainerElementOptimalHeight },
  Sorters: { byOrder }
} = Helpers;
const { ConfigService, EntityService, LoggerService } = Services;

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
  () => selectedConceptIri.value,
  async newValue => {
    if (newValue && newValue !== concept.value["@id"]) await init();

    tabMap.clear();
    setTabMap();
    setDefaultTab();
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

const showGraph = computed(() => isOfTypes(types.value, IM.CONCEPT, SHACL.NODESHAPE));
const showMappings = computed(() => (isConcept(types.value) || isOfTypes(types.value, RDFS.CLASS)) && !isRecordModel(types.value));

const { concept, getConcept }: { concept: Ref<any>; getConcept: Function } = setupConcept();
const { configs, getConfig }: { configs: Ref<DefinitionConfig[]>; getConfig: Function } = setupConfig();
const { terms, getTerms }: { terms: Ref<any[] | undefined>; getTerms: Function } = setupTerms();
let tabMap = reactive(new Map<string, number>());

onMounted(async () => {
  if (!selectedConceptIri.value && conceptIri.value) store.commit("updateSelectedConceptIri", conceptIri.value);
  await init();
  setTabMap();
  setDefaultTab();
});

function setDefaultTab() {
  if (isRecordModel(types.value)) {
    activeTab.value = tabMap.get("Data Model") || 0;
  } else if (isQuery(types.value)) {
    activeTab.value = tabMap.get("Query") || 0;
  } else if (isValueSet(types.value)) {
    activeTab.value = tabMap.get("Set") || 0;
  } else {
    activeTab.value = 0;
  }
}

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
}

#concept-empty-container {
  height: 100%;
  width: 100%;
}

.loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
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
