<template>
  <div id="concept-main-container">
    <div class="info-container">
      <div class="flex flex-row">
        <TextWithLabel v-if="entityIri" :data="entityIri" label="Iri" />
        <TextWithLabel v-if="code" :data="code" label="Code" />
      </div>
      <div class="flex flex-row justify-start">
        <ArrayObjectNamesToStringWithLabel v-if="status" :data="status" :tagSeverityMatches="tagSeverityMatches" label="Status" />
        <ArrayObjectNamesToStringWithLabel v-if="types" :data="types" label="Types" />
      </div>
      <div>
        <TextWithLabel v-if="preferredName" :data="preferredName" label="Preferred name" />
        <ArrayObjectNamesToStringWithLabel v-if="returnType" :data="returnType" label="Return Type" />
      </div>
      <TextHTMLWithLabel v-if="comment" :data="comment" label="Description" />
    </div>
    <div v-if="entity.iri === IM.FAVOURITES">
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
            <Tab v-if="showSemanticMaps" value="30">Map entries</Tab>
            <Tab v-if="entityIsValueSet(types)" value="3">Set</Tab>
            <Tab v-if="entityIsValueSet(types) && isObjectHasKeys(concept, ['http://endhealth.info/im#definition'])" value="4">ECL</Tab>
            <Tab v-if="entityIsConcept(types)" value="5">Expression</Tab>
            <Tab v-if="entityIsRecordModel(types)" value="6">Data Model</Tab>
            <Tab v-if="entityIsRecordModel(types)" value="7">Properties</Tab>
            <Tab v-if="entityIsQuery(types) || entityIsFunctionalProperty(types)" value="8">Query</Tab>
            <Tab v-if="entityIsIndicator(types)" value="20">Indicator</Tab>
            <Tab v-if="entityIsFeature(types)" value="10">Feature</Tab>
            <Tab value="11">Contents</Tab>
            <Tab v-if="entityIsProperty(types)" value="12">Data Models</Tab>
            <Tab value="13">Used In</Tab>
            <Tab value="14">Hierarchy Position</Tab>
            <Tab v-if="showGraph" value="15">Entity Chart</Tab>
            <Tab v-if="entityIsRecordModel(types)" value="16">Entity-Model Diagram</Tab>
            <Tab value="17">Graph</Tab>
            <Tab value="18">JSON</Tab>
            <Tab value="19">Provenance</Tab>
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
            <TabPanel v-if="showSemanticMaps" value="30">
              <div id="mappings-container" class="concept-panel-content">
                <SemanticMapDisplay :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="entityIsValueSet(types)" value="3">
              <div id="set-container" class="concept-panel-content">
                <SetDefinition :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="entityIsValueSet(types) && entityDefinition" value="4">
              <div id="ecl-container" class="concept-panel-content">
                <EclDefinition :definition="entityDefinition" />
              </div>
            </TabPanel>
            <TabPanel v-if="entityIsConcept(types)" value="5">
              <ExpressionDisplay :concept="concept" />
            </TabPanel>
            <TabPanel v-if="entityIsRecordModel(types)" value="6">
              <div id="data-model-container" class="concept-panel-content">
                <DataModel :entityIri="entityIri" :entityName="entityName" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="entityIsRecordModel(types)" value="7">
              <div id="properties-container" class="concept-panel-content">
                <Properties :entityIri="entityIri" :entityName="entityName" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="entityIsQuery(types) || entityIsFunctionalProperty(types)" value="8">
              <div id="query-container" class="concept-panel-content">
                <QueryDisplay :entityIri="entityIri" :show-dataset="true" :viewerDisplayMode="viewerDisplayMode" @updateViewerDisplayMode="updateDisplayMode" />
              </div>
            </TabPanel>
            <TabPanel v-if="entityIsIndicator(types)" value="20">
              <div id="indicator-container" class="concept-panel-content">
                <IndicatorDisplay :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel v-if="entityIsFeature(types)" value="10">
              <div id="query-container" class="concept-panel-content">
                <QueryDisplay :entityIri="entityIri" />
              </div>
            </TabPanel>
            <TabPanel value="11">
              <div id="definition-container" class="concept-panel-content">
                <Content :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel v-if="entityIsProperty(types)" value="12">
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
            <TabPanel v-if="entityIsRecordModel(types)" value="16">
              <div id="entity-model-container" :class="expandWidth ? 'entity-concept-panel-content' : 'concept-panel-content'">
                <ModelChart :entityIri="entityIri" :entityName="entityName" @expand-width="(expand: boolean) => (expandWidth = expand)" />
              </div>
            </TabPanel>
            <TabPanel value="17">
              <div id="graph-container" class="concept-panel-content">
                <Graph :entityIri="entityIri" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
              </div>
            </TabPanel>
            <TabPanel value="18">
              <div id="json-container" class="concept-panel-content">
                <JSONViewer :entityIri="entityIri" :viewerDisplayMode="viewerDisplayMode" />
              </div>
            </TabPanel>
            <TabPanel value="19">
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
import { Ref, computed, nextTick, onMounted, reactive, ref, watch } from "vue";

import { ArrayObjectNamesToStringWithLabel, TextHTMLWithLabel, TextWithLabel } from "@endeavour/vue-library/components";
import { DisplayMode, IM, RDF, RDFS, SHACL } from "@endeavour/vue-library/enums";
import {
  entityIsConcept,
  entityIsFeature,
  entityIsFolder,
  entityIsFunctionalProperty,
  entityIsIndicator,
  entityIsProperty,
  entityIsQuery,
  entityIsRecordModel,
  entityIsValueSet,
  isArrayOf,
  isObjectHasKeys,
  isOfTypes
} from "@endeavour/vue-library/helpers";
import { type TTEntity, TTEntitySchema, type TTIriRef, isTTIriRef } from "@endeavour/vue-library/models";

import { isString } from "lodash-es";

import ExpressionDisplay from "@/components/directory/viewer/ExpressionDisplay.vue";
import IndicatorDisplay from "@/components/directory/viewer/IndicatorDisplay.vue";
import ModelChart from "@/components/directory/viewer/ModelChart.vue";
import SemanticMapDisplay from "@/components/directory/viewer/SemanticMapDisplay.vue";
import SecondaryTree from "@/components/shared/SecondaryTree.vue";
import TermCodeTable from "@/components/shared/TermCodeTable.vue";
import { useDirectService } from "@/composables/useDirectService";
import { EntityService } from "@/services";
import { useSharedStore } from "@/stores/sharedStore";

import Content from "./viewer/Content.vue";
import DataModels from "./viewer/DataModels.vue";
import Details from "./viewer/Details.vue";
import EntityChart from "./viewer/EntityChart.vue";
import JSONViewer from "./viewer/JSONViewer.vue";
import Provenance from "./viewer/Provenance.vue";
import QueryDisplay from "./viewer/QueryDisplay.vue";
import UsedIn from "./viewer/UsedIn.vue";
import DataModel from "./viewer/dataModel/DataModel.vue";
import Properties from "./viewer/dataModel/Properties.vue";
import Graph from "./viewer/graph/Graph.vue";
import Mappings from "./viewer/mapping/Mappings.vue";
import EclDefinition from "./viewer/set/EclDefinition.vue";
import SetDefinition from "./viewer/set/SetDefinition.vue";

interface Props {
  entity: TTEntity;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

const directService = useDirectService();
const sharedStore = useSharedStore();

const loading = ref(true);
const concept: Ref<TTEntity> = ref({});

const entityIri = computed(() => {
  if (isString(props.entity.iri)) return props.entity.iri;
  else return "";
});
const activeTab = ref("0");
const showGraph = computed(() => isOfTypes(types.value, IM.CONCEPT, SHACL.NODESHAPE));
const showMappings = computed(() => (entityIsConcept(types.value) || isOfTypes(types.value, RDFS.CLASS)) && !entityIsRecordModel(types.value));
const showSemanticMaps = computed(() => isOfTypes(types.value, IM.SEMANTIC_MAP));
const showTerms = computed(() => !isOfTypes(types.value, IM.QUERY, SHACL.FUNCTION, IM.SET, IM.CONCEPT_SET, SHACL.NODESHAPE, IM.VALUE_SET));
const tagSeverityMatches = computed(() => sharedStore.tagSeverityMatches);
const entityName = computed(() => (typeof concept.value[RDFS.LABEL] === "string" ? concept.value[RDFS.LABEL] : ""));
const entityDefinition = computed(() => (typeof concept.value[IM.DEFINITION] === "string" ? concept.value[IM.DEFINITION] : ""));
const header = computed(() => {
  if (isString(concept.value[RDFS.LABEL])) return concept.value[RDFS.LABEL];
  else return "";
});
const types = computed(() => {
  if (isObjectHasKeys(concept.value, [RDF.TYPE]) && isArrayOf(concept.value[RDF.TYPE], isTTIriRef)) return concept.value[RDF.TYPE];
  else return [] as TTIriRef[];
});
const code = computed(() => {
  if (isString(concept.value[IM.CODE])) return concept.value[IM.CODE];
  else return "";
});
const preferredName = computed(() => {
  if (isString(concept.value[IM.PREFERRED_NAME])) return concept.value[IM.PREFERRED_NAME];
  else return "";
});
const comment = computed(() => {
  if (isString(concept.value[RDFS.COMMENT])) return concept.value[RDFS.COMMENT];
  else return "";
});
const status = computed(() => {
  if (isArrayOf(concept.value[IM.HAS_STATUS], isTTIriRef)) return concept.value[IM.HAS_STATUS];
  else return [];
});
const returnType = computed(() => {
  if (isArrayOf(concept.value[IM.RETURN_TYPE], isTTIriRef)) return concept.value[IM.RETURN_TYPE];
  else return [];
});
const viewerDisplayMode: Ref<DisplayMode> = ref(DisplayMode.ORIGINAL);

const tabMap = reactive(new Map<string, string>());

const expandWidth = ref(false);

onMounted(async () => {
  await init();
});

watch(
  () => props.entity,
  async () => await init()
);
function updateDisplayMode(mode: DisplayMode) {
  viewerDisplayMode.value = mode;
}

function setDefaultTab() {
  if (entityIsFolder(types.value)) {
    activeTab.value = tabMap.get("Contents") ?? "0";
  } else if (entityIsRecordModel(types.value)) {
    activeTab.value = tabMap.get("Data Model") ?? "0";
  } else if (entityIsQuery(types.value)) {
    activeTab.value = tabMap.get("Query") ?? "0";
  } else if (entityIsIndicator(types.value)) {
    activeTab.value = tabMap.get("Indicator") ?? "0";
  } else if (entityIsFeature(types.value)) {
    activeTab.value = tabMap.get("Feature") ?? "0";
  } else if (entityIsValueSet(types.value)) {
    activeTab.value = tabMap.get("Set") ?? "0";
  } else if (entityIsProperty(types.value)) {
    activeTab.value = tabMap.get("Data models") ?? "0";
  } else if (types.value[0].iri === IM.SEMANTIC_MAP) {
    activeTab.value = tabMap.get("Map entries") ?? "0";
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
  await getConcept(entityIri.value);
  loading.value = false;
  await nextTick();
  setTabMap();
  setDefaultTab();
}

async function getConcept(iri: string) {
  const predicates = [
    RDFS.LABEL,
    IM.DEFINITION,
    RDF.TYPE,
    IM.CODE,
    RDFS.SUBCLASS_OF,
    IM.ROLE_GROUP,
    IM.DEFINITIONAL_STATUS,
    IM.PREFERRED_NAME,
    IM.RETURN_TYPE,
    IM.HAS_STATUS,
    RDFS.COMMENT
  ];
  const result = (concept.value = await EntityService.getPartialEntity(iri, predicates));
  concept.value = result;
}

function onOpenTab(predicate: string) {
  switch (predicate) {
    case SHACL.PROPERTY:
      activeTab.value = tabMap.get("Properties") ?? "0";
      break;
    case IM.DEFINITION:
      if (entityIsQuery(types.value) || entityIsFeature(types.value)) {
        activeTab.value = tabMap.get("Query") ?? "0";
      } else if (entityIsValueSet(types.value)) {
        activeTab.value = tabMap.get("Set") ?? "0";
      }
      break;
    default:
      break;
  }
}

async function handleControlClick(iri: string) {
  await directService.view(iri);
}
</script>
<style scoped>
#concept-main-container {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
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
  overflow: hidden;
  height: 100%;
}

#concept-content-dialogs-container {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.concept-panel-content {
  height: 100%;
  background-color: var(--p-content-background);
  display: flex;
  overflow: auto;
}

#concept-panel-container:deep(.p-tabview-panels) {
  flex: 1 1 auto;
  overflow: auto;
}

.entity-concept-panel-content {
  height: 100%;
  width: 500%;
  background-color: var(--p-content-background);
  display: flex;
}

#concept-panel-container:deep(.p-tabpanels) {
  overflow: auto;
}

#concept-panel-container:deep(.p-tabpanel) {
  height: 100%;
}

#viewer-tabs {
  height: 100%;
  overflow: hidden;
}

#tab-list {
  flex: 0 0 auto;
  display: flex;
}

.info-container {
  padding: 0.25rem;
}
</style>
