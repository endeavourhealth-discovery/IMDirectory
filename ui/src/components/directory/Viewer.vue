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
        <Tabs v-model:value="activeTab" id="viewer-tabs" :lazy="true" scrollable>
          <TabList id="tab-list">
            <Tab value="0">Details</Tab>
            <Tab v-if="showTerms" value="1">Terms</Tab>
            <Tab v-if="showMappings" value="2">Maps</Tab>
            <Tab v-if="isValueSet(types)" value="3">Set</Tab>
            <Tab v-if="isValueSet(types) && isObjectHasKeys(concept, ['http://endhealth.info/im#definition'])" value="4">ECL</Tab>
            <Tab v-if="isRecordModel(types)" value="5">Data Model</Tab>
            <Tab v-if="isRecordModel(types)" value="6">Properties</Tab>
            <Tab v-if="isQuery(types) || isFeature(types)" value="7">Query</Tab>
            <Tab value="8">Contents</Tab>
            <Tab v-if="isProperty(types)" value="9">Data Models</Tab>
            <Tab value="10">Used In</Tab>
            <Tab value="11">Hierarchy Position</Tab>
            <Tab v-if="showGraph" value="12">Entity Chart</Tab>
            <Tab value="13">Graph</Tab>
            <Tab value="14">JSON</Tab>
            <Tab value="15">Provenance</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="concept-panel-content" id="details-container">
                <Details :entityIri="entityIri" @on-open-tab="onOpenTab" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="showTerms" value="1">
              <div class="concept-panel-content" id="term-table-container">
                <TermCodeTable :terms="terms" />
              </div>
            </TabPanel>
            <TabPanel v-if="showMappings" value="2">
              <div class="concept-panel-content" id="mappings-container">
                <Mappings :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel v-if="isValueSet(types)" value="3">
              <div class="concept-panel-content" id="set-container">
                <SetDefinition :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="isValueSet(types) && isObjectHasKeys(concept, ['http://endhealth.info/im#definition'])" value="4">
              <div class="concept-panel-content" id="ecl-container">
                <EclDefinition :definition="concept['http://endhealth.info/im#definition']" />
              </div>
            </TabPanel>
            <TabPanel v-if="isRecordModel(types)" value="5">
              <div class="concept-panel-content" id="data-model-container">
                <DataModel :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="isRecordModel(types)" value="6">
              <div class="concept-panel-content" id="properties-container">
                <Properties :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="isQuery(types) || isFeature(types)" value="7">
              <div class="concept-panel-content" id="query-container">
                <QueryDisplay :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel value="8">
              <div v-if="isObjectHasKeys(concept)" class="concept-panel-content" id="definition-container">
                <Content :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="isProperty(types)" value="9">
              <div v-if="isObjectHasKeys(concept)" class="concept-panel-content" id="definition-container">
                <DataModels :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel value="10">
              <div class="concept-panel-content" id="usedin-container">
                <UsedIn :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel value="11">
              <div class="concept-panel-content" id="secondary-tree-container">
                <SecondaryTree :entityIri="entityIri" @row-clicked="(iri: string) => emit('navigateTo', iri)" @row-control-clicked="handleControlClick" />
              </div>
            </TabPanel>
            <TabPanel v-if="showGraph" value="12">
              <div class="concept-panel-content" id="entity-chart-container">
                <EntityChart :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel value="13">
              <div class="concept-panel-content" id="graph-container">
                <Graph :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel value="14">
              <div class="concept-panel-content" id="json-container">
                <JSONViewer :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel value="15">
              <div class="concept-panel-content" id="provenance-container">
                <Provenance :entityIri="entityIri" />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, reactive, watch, nextTick } from "vue";
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
import { DirectService } from "@/services";

import { DefinitionConfig } from "@im-library/interfaces";
import { SearchTermCode, TTIriRef } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isOfTypes, isValueSet, isConcept, isQuery, isFolder, isRecordModel, isFeature, isProperty } from "@im-library/helpers/ConceptTypeMethods";
import { EntityService } from "@/services";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import Details from "./viewer/Details.vue";
import DataModels from "./viewer/DataModels.vue";

import { useRouter } from "vue-router";
import setupConcept from "@/composables/setupConcept";
import setupConfig from "@/composables/setupConfig";
import setupTerms from "@/composables/setupTerms";
import QueryDisplay from "./viewer/QueryDisplay.vue";

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

const activeTab = ref("0");
const showGraph = computed(() => isOfTypes(types.value, IM.CONCEPT, SHACL.NODESHAPE));
const showMappings = computed(() => (isConcept(types.value) || isOfTypes(types.value, RDFS.CLASS)) && !isRecordModel(types.value));
const showTerms = computed(() => !isOfTypes(types.value, IM.QUERY, IM.SET, IM.CONCEPT_SET, SHACL.NODESHAPE, IM.VALUE_SET));

const { concept, getConcept }: { concept: Ref<any>; getConcept: Function } = setupConcept();
const { configs, getConfig }: { configs: Ref<DefinitionConfig[]>; getConfig: Function } = setupConfig();
const { terms, getTerms }: { terms: Ref<SearchTermCode[]>; getTerms: Function } = setupTerms();
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
  } else if (isQuery(types.value) || isFeature(types.value)) {
    activeTab.value = tabMap.get("Query") ?? "0";
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
  await getConfig();
  await getConcept(props.entityIri, configs);
  await getInferred(props.entityIri, concept);
  await getTerms(props.entityIri);
  types.value = isObjectHasKeys(concept.value, [RDF.TYPE]) ? concept.value[RDF.TYPE] : ([] as TTIriRef[]);
  header.value = concept.value[RDFS.LABEL];
  loading.value = false;
  await nextTick();
  setTabMap();
  setDefaultTab();
}

async function getInferred(iri: string, concept: Ref<any>): Promise<void> {
  const result = await EntityService.getDefinitionBundle(iri);
  if (isObjectHasKeys(result, ["entity"]) && isObjectHasKeys(result.entity, [RDFS.SUBCLASS_OF, IM.ROLE_GROUP])) {
    const roleGroup = result.entity[IM.ROLE_GROUP];
    delete result.entity[IM.ROLE_GROUP];
    const newRoleGroup: any = {};
    newRoleGroup[IM.ROLE_GROUP] = roleGroup;
    result.entity[RDFS.SUBCLASS_OF].push(newRoleGroup);
  }
  concept.value["inferred"] = result;
}

function onOpenTab(predicate: string) {
  switch (predicate) {
    case SHACL.PROPERTY:
      activeTab.value = tabMap.get("Properties") ?? "0";
      break;
    case IM.DEFINITION:
      if (isQuery(types.value) ?? isFeature(types.value)) {
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
