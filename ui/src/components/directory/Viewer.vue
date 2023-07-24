<template>
  <div id="concept-main-container">
    <div v-if="entityIri === 'http://endhealth.info/im#Favourites'">
      <Content />
    </div>
    <div v-else-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else id="concept-content-dialogs-container">
      <div id="concept-panel-container">
        <TabView :lazy="true" v-model:active-index="activeTab" id="info-side-bar-tabs">
          <TabPanel header="Details">
            <div class="concept-panel-content" id="details-container">
              <Details :entityIri="entityIri" @on-open-tab="onOpenTab" @navigateTo="(iri:string) => emit('navigateTo', iri)" />
            </div>
          </TabPanel>
          <TabPanel v-if="terms" header="Terms">
            <div class="concept-panel-content" id="term-table-container">
              <TermCodeTable :terms="terms" />
            </div>
          </TabPanel>
          <TabPanel v-if="showMappings" header="Maps">
            <div class="concept-panel-content" id="mappings-container">
              <Mappings :entityIri="entityIri" />
            </div>
          </TabPanel>
          <TabPanel v-if="isValueSet(types)" header="Set">
            <div class="concept-panel-content" id="set-container">
              <SetDefinition :entityIri="entityIri" />
            </div>
          </TabPanel>
          <TabPanel header="ECL" v-if="isValueSet(types) && isObjectHasKeys(concept, ['http://endhealth.info/im#definition'])">
            <div class="concept-panel-content" id="ecl-container">
              <EclDefinition :definition="concept['http://endhealth.info/im#definition']" />
            </div>
          </TabPanel>
          <TabPanel v-if="isRecordModel(types)" header="Data Model">
            <div class="concept-panel-content" id="data-model-container">
              <DataModel :entityIri="entityIri" @navigateTo="(iri:string) => emit('navigateTo', iri)" />
            </div>
          </TabPanel>
          <TabPanel header="Properties" v-if="isRecordModel(types)">
            <div class="concept-panel-content" id="properties-container">
              <Properties :entityIri="entityIri" @navigateTo="(iri:string) => emit('navigateTo', iri)" />
            </div>
          </TabPanel>
          <TabPanel v-if="isQuery(types)" header="Query">
            <div class="concept-panel-content" id="query-container">
              <QueryDisplay :entityIri="entityIri" />
            </div>
          </TabPanel>
          <TabPanel header="Contents">
            <div v-if="isObjectHasKeys(concept)" class="concept-panel-content" id="definition-container">
              <Content />
            </div>
          </TabPanel>
          <TabPanel header="Used in">
            <div class="concept-panel-content" id="usedin-container">
              <UsedIn :entityIri="entityIri" />
            </div>
          </TabPanel>
          <TabPanel header="Hierarchy position">
            <div class="concept-panel-content" id="secondary-tree-container">
              <SecondaryTree :entityIri="entityIri" @navigateTo="(iri:string) => emit('navigateTo', iri)" />
            </div>
          </TabPanel>
          <TabPanel header="Entity chart" v-if="showGraph">
            <div class="concept-panel-content" id="entity-chart-container">
              <EntityChart :entityIri="entityIri" />
            </div>
          </TabPanel>
          <TabPanel header="Graph">
            <div class="concept-panel-content" id="graph-container">
              <Graph :entityIri="entityIri" />
            </div>
          </TabPanel>
          <TabPanel header="JSON">
            <div class="concept-panel-content" id="json-container">
              <JSONViewer :entityIri="entityIri" />
            </div>
          </TabPanel>
          <TabPanel header="Provenance">
            <div class="concept-panel-content" id="provenance-container">
              <Provenance :entityIri="entityIri" />
            </div>
          </TabPanel>
        </TabView>
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

import { DefinitionConfig } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isOfTypes, isValueSet, isConcept, isQuery, isFolder, isRecordModel } from "@im-library/helpers/ConceptTypeMethods";
import { EntityService } from "@/services";
import { IM, RDF, RDFS, SHACL } from "@im-library/vocabulary";
import Details from "./viewer/Details.vue";

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

const loading = ref(true);
const types: Ref<TTIriRef[]> = ref([]);
const header = ref("");

const activeTab = ref(0);
const showGraph = computed(() => isOfTypes(types.value, IM.CONCEPT, SHACL.NODESHAPE));
const showMappings = computed(() => (isConcept(types.value) || isOfTypes(types.value, RDFS.CLASS)) && !isRecordModel(types.value));

const { concept, getConcept }: { concept: Ref<any>; getConcept: Function } = setupConcept();
const { configs, getConfig }: { configs: Ref<DefinitionConfig[]>; getConfig: Function } = setupConfig();
const { terms, getTerms }: { terms: Ref<any[] | undefined>; getTerms: Function } = setupTerms();
let tabMap = reactive(new Map<string, number>());

onMounted(async () => {
  await init();
});

watch(
  () => props.entityIri,
  async () => await init()
);

function setDefaultTab() {
  if (isFolder(types.value)) {
    activeTab.value = tabMap.get("Contents") || 0;
  } else if (isRecordModel(types.value)) {
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
      activeTab.value = tabMap.get("Properties") || 0;
      break;
    case IM.DEFINITION:
      if (isQuery(types.value)) {
        activeTab.value = tabMap.get("Query") || 0;
      } else if (isValueSet(types.value)) {
        activeTab.value = tabMap.get("Set") || 0;
      }
      break;
    default:
      break;
  }
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

.p-tabview {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
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
  background-color: var(--surface-a);
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

#concept-panel-container:deep(.p-tabview-panel) {
  height: 100%;
  overflow: auto;
}

#concept-panel-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}
</style>
