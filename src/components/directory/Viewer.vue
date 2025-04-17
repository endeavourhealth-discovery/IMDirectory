<template>
  <div id="concept-main-container">
    <div v-if="entityIri === 'http://endhealth.info/im#Favourites'">
      <Content :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
    </div>
    <div v-else-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else id="concept-content-dialogs-container">
      <div id="concept-panel-container">
        <Tabs id="viewer-tabs" v-model:value="activeTab" :lazy="true" scrollable>
          <TabList id="tab-list">
            <Tab value="0">Details</Tab>
            <Tab v-if="showTerms" value="1">Terms</Tab>
            <Tab v-if="showMappings" value="2">Maps</Tab>
            <Tab v-if="isValueSet(types)" value="3">Set</Tab>
            <Tab v-if="isValueSet(types) && isObjectHasKeys(concept, ['http://endhealth.info/im#definition'])" value="4">ECL</Tab>
            <Tab v-if="isConcept(types)" value="5">Expression</Tab>
            <Tab v-if="isRecordModel(types)" value="6">Data Model</Tab>
            <Tab v-if="isRecordModel(types)" value="7">Properties</Tab>
            <Tab v-if="isQuery(types)" value="8">Query</Tab>
            <Tab v-if="isDataSet(types)" value="9">Data set</Tab>
            <Tab v-if="isFeature(types)" value="10">Feature</Tab>
            <Tab value="11">Contents</Tab>
            <Tab v-if="isProperty(types)" value="12">Data Models</Tab>
            <Tab value="13">Used In</Tab>
            <Tab value="14">Hierarchy Position</Tab>
            <Tab v-if="showGraph" value="15">Entity Chart</Tab>
            <Tab value="16">Graph</Tab>
            <Tab value="17">JSON</Tab>
            <Tab value="18">Provenance</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div id="details-container" class="concept-panel-content">
                <Details :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" @on-open-tab="onOpenTab" />
              </div>
            </TabPanel>
            <TabPanel v-if="showTerms" value="1">
              <div id="term-table-container" class="concept-panel-content">
                <TermCodeTable :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel v-if="showMappings" value="2">
              <div id="mappings-container" class="concept-panel-content">
                <Mappings :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="isValueSet(types)" value="3">
              <div id="set-container" class="concept-panel-content">
                <SetDefinition :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="isValueSet(types) && isObjectHasKeys(concept, ['http://endhealth.info/im#definition'])" value="4">
              <div id="ecl-container" class="concept-panel-content">
                <EclDefinition :definition="concept['http://endhealth.info/im#definition']" />
              </div>
            </TabPanel>
            <TabPanel v-if="isConcept(types)" value="5">
              <ExpressionDisplay :concept="concept" />
            </TabPanel>
            <TabPanel v-if="isRecordModel(types)" value="6">
              <div id="data-model-container" class="concept-panel-content">
                <DataModel :entityIri="entityIri" :entityName="concept[RDFS.LABEL]" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="isRecordModel(types)" value="7">
              <div id="properties-container" class="concept-panel-content">
                <Properties :entityIri="entityIri" :entityName="concept[RDFS.LABEL]" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="isQuery(types)" value="8">
              <div id="query-container" class="concept-panel-content">
                <QueryDisplay :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel v-if="isDataSet(types)" value="9">
              <div id="query-container" class="concept-panel-content">
                <QueryDisplay :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel v-if="isFeature(types)" value="10">
              <div id="query-container" class="concept-panel-content">
                <QueryDisplay :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel value="11">
              <div id="definition-container" class="concept-panel-content">
                <Content :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="isProperty(types)" value="12">
              <div id="definition-container" class="concept-panel-content">
                <DataModels :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel value="13">
              <div id="usedin-container" class="concept-panel-content">
                <UsedIn :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel value="14">
              <div id="secondary-tree-container" class="concept-panel-content">
                <SecondaryTree :entityIri="entityIri" @row-clicked="(iri: string) => emit('navigateTo', iri)" @row-control-clicked="handleControlClick" />
              </div>
            </TabPanel>
            <TabPanel v-if="showGraph" value="15">
              <div id="entity-chart-container" class="concept-panel-content">
                <EntityChart :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel value="16">
              <div id="graph-container" class="concept-panel-content">
                <Graph :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel value="17">
              <div id="json-container" class="concept-panel-content">
                <JSONViewer :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel value="18">
              <div id="provenance-container" class="concept-panel-content">
                <Provenance :entityIri="entityIri" />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, Ref, ref, watch } from "vue";
import DataModel from "./viewer/dataModel/DataModel.vue";
import SetDefinition from "./viewer/set/SetDefinition.vue";
import Content from "./viewer/Content.vue";
import EntityChart from "./viewer/EntityChart.vue";
import Graph from "./viewer/graph/Graph.vue";
import UsedIn from "./viewer/UsedIn.vue";
import Mappings from "./viewer/mapping/Mappings.vue";
import EclDefinition from "./viewer/set/EclDefinition.vue";
import Properties from "./viewer/dataModel/Properties.vue";
import JSONViewer from "./viewer/JSONViewer.vue";
import Provenance from "./viewer/Provenance.vue";
import SecondaryTree from "@/components/shared/SecondaryTree.vue";
import TermCodeTable from "@/components/shared/TermCodeTable.vue";
import { DirectService, EntityService } from "@/services";

import { TTIriRef } from "@/interfaces/AutoGen";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { isConcept, isDataSet, isFeature, isFolder, isOfTypes, isProperty, isQuery, isRecordModel, isValueSet } from "@/helpers/ConceptTypeMethods";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import Details from "./viewer/Details.vue";
import DataModels from "./viewer/DataModels.vue";

import { useRouter } from "vue-router";
import QueryDisplay from "./viewer/QueryDisplay.vue";
import ExpressionDisplay from "@/components/directory/viewer/ExpressionDisplay.vue";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

const router = useRouter();
const directService = new DirectService();

const loading = ref(true);
const types: Ref<TTIriRef[]> = ref([]);
const header = ref("");
const concept: Ref<any> = ref({});

const activeTab = ref("0");
const showGraph = computed(() => isOfTypes(types.value, IM.CONCEPT, SHACL.NODESHAPE));
const showMappings = computed(() => (isConcept(types.value) || isOfTypes(types.value, RDFS.CLASS)) && !isRecordModel(types.value));
const showTerms = computed(() => !isOfTypes(types.value, IM.QUERY, IM.DATASET_QUERY, SHACL.FUNCTION, IM.SET, IM.CONCEPT_SET, SHACL.NODESHAPE, IM.VALUE_SET));

const tabMap = reactive(new Map<string, string>());

onMounted(async () => {
  await init();
});

watch(
  () => props.entityIri,
  async () => await init()
);

function setDefaultTab() {
  if (isFolder(types.value)) {
    activeTab.value = tabMap.get("Contents") ?? "0";
  } else if (isRecordModel(types.value)) {
    activeTab.value = tabMap.get("Data Model") ?? "0";
  } else if (isQuery(types.value)) {
    activeTab.value = tabMap.get("Query") ?? "0";
  } else if (isDataSet(types.value)) {
    activeTab.value = tabMap.get("Data set") ?? "0";
  } else if (isFeature(types.value)) {
    activeTab.value = tabMap.get("Feature") ?? "0";
  } else if (isValueSet(types.value)) {
    activeTab.value = tabMap.get("Set") ?? "0";
  } else if (isProperty(types.value)) {
    activeTab.value = tabMap.get("Data models") ?? "0";
  } else {
    activeTab.value = "0";
  }
}

function setTabMap() {
  const tabList = document.getElementById("viewer-tabs")?.children?.[0]?.children?.[0]?.children?.[0]?.children as HTMLCollectionOf<HTMLElement>;
  if (tabList?.length) {
    for (let i = 0; i < tabList.length; i++) {
      const index = tabList[i].id.replace("viewer-tabs_tab_", "");
      if (tabList[i].textContent) {
        tabMap.set(tabList[i].textContent as string, index.toString());
      }
    }
  }
}

async function init(): Promise<void> {
  loading.value = true;
  await getConcept(props.entityIri);
  types.value = isObjectHasKeys(concept.value, [RDF.TYPE]) ? concept.value[RDF.TYPE] : ([] as TTIriRef[]);
  header.value = concept.value[RDFS.LABEL];
  loading.value = false;
  await nextTick();
  setTabMap();
  setDefaultTab();
}

async function getConcept(iri: string) {
  const predicates = [RDFS.LABEL, IM.DEFINITION, RDF.TYPE, IM.CODE, RDFS.SUBCLASS_OF, IM.ROLE_GROUP, IM.DEFINITIONAL_STATUS];
  concept.value = await EntityService.getPartialEntity(iri, predicates);
}

function onOpenTab(predicate: string) {
  switch (predicate) {
    case SHACL.PROPERTY:
      activeTab.value = tabMap.get("Properties") ?? "0";
      break;
    case IM.DEFINITION:
      if (isQuery(types.value) || isFeature(types.value) || isDataSet(types.value)) {
        activeTab.value = tabMap.get("Query") ?? "0";
      } else if (isValueSet(types.value)) {
        activeTab.value = tabMap.get("Set") ?? "0";
      }
      break;
    default:
      break;
  }
}

function handleControlClick(iri: string) {
  directService.view(iri);
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

#concept-panel-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

#concept-content-dialogs-container {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.p-tabs {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

.p-tabpanels {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.p-tabpanels:deep(.p-tabpanel) {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.concept-panel-content {
  height: 100%;
  overflow: auto;
  background-color: var(--p-content-background);
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

#concept-panel-container:deep(.p-tabview-panels) {
  flex: 1 1 auto;
  overflow: auto;
}

#tab-list {
  flex: 0 0 auto;
  display: flex;
}
</style>
