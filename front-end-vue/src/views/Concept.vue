<template>
  <div id="concept-main-container">
    <Panel>
      <template #icons>
        <div class="icons-container">
          <button class="p-panel-header-icon p-link p-mr-2" @click="focusTree" v-tooltip.left="'Focus hierarchy tree to this concept'">
            <i class="fas fa-sitemap" aria-hidden="true"></i>
          </button>
          <div v-if="isObjectHasKeysWrapper(concept, ['inferred'])" class="copy-container">
            <Button
              icon="far fa-copy"
              class="p-button-rounded p-button-text p-button-secondary"
              @click="toggle($event, 'copyMenu')"
              v-tooltip="'Copy concept to clipboard'"
            />
            <Menu id="copy-options" ref="copyMenu" :model="copyMenuItems" :popup="true" />
          </div>
          <Button
            type="button"
            class="p-panel-header-icon p-link p-mr-2"
            @click="toggle($event, 'downloadMenu')"
            v-tooltip.bottom="'Download concept'"
            aria-haspopup="true"
            aria-controls="overlay_menu"
          >
            <i class="fas fa-cloud-download-alt" aria-hidden="true"></i>
          </Button>
          <Menu id="overlay_menu" ref="downloadMenu" :model="items" :popup="true" />
          <!--<button
            class="p-panel-header-icon p-link p-mr-2"
            @click="directToCreateRoute"
            v-tooltip.bottom="'Create new concept'"
          >
            <i class="fas fa-plus-circle" aria-hidden="true"></i>
          </button>
          <button
            class="p-panel-header-icon p-link p-mr-2"
            @click="directToEditRoute"
            v-tooltip.bottom="'Edit concept'"
          >
            <i class="fas fa-pencil-alt" aria-hidden="true"></i>
          </button>-->
        </div>
      </template>
      <template #header>
        <PanelHeader :types="types" :header="header" />
      </template>
      <div id="concept-content-dialogs-container">
        <div id="concept-panel-container">
          <TabView v-model:activeIndex="active" :lazy="true">
            <TabPanel header="Details">
              <div v-if="loading" class="loading-container" :style="contentHeight">
                <ProgressSpinner />
              </div>
              <div v-else class="concept-panel-content" id="definition-container" :style="contentHeight">
                <Definition :concept="concept" :configs="configs" />
              </div>
            </TabPanel>
            <TabPanel header="Maps" v-if="showMappings">
              <div class="concept-panel-content" id="mappings-container" :style="contentHeight">
                <Mappings :conceptIri="conceptIri" />
              </div>
            </TabPanel>
            <TabPanel header="Used in">
              <div class="concept-panel-content" id="usedin-container" :style="contentHeight">
                <UsedIn :conceptIri="conceptIri" />
              </div>
            </TabPanel>
            <TabPanel header="Entity chart" v-if="showGraph">
              <div class="concept-panel-content" id="entity-chart-container" :style="contentHeight">
                <EntityChart :conceptIri="conceptIri" />
              </div>
            </TabPanel>
            <TabPanel header="Properties" v-if="isRecordModel">
              <div class="concept-panel-content" id="properties-container" :style="contentHeight">
                <Properties :conceptIri="conceptIri" />
              </div>
            </TabPanel>
            <TabPanel header="Members" v-if="isSet">
              <div class="concept-panel-content" id="members-container" :style="contentHeight">
                <Members :conceptIri="conceptIri" />
              </div>
            </TabPanel>
            <TabPanel header="ECL" v-if="isSet && isObjectHasKeysWrapper(concept.inferred)">
              <div class="concept-panel-content" id="ecl-container" :style="contentHeight">
                <EclDefinition :definition="concept.inferred" />
              </div>
            </TabPanel>
            <TabPanel header="Graph">
              <div class="concept-panel-content" id="graph-container" :style="contentHeight">
                <Graph :conceptIri="conceptIri" />
              </div>
            </TabPanel>
            <TabPanel header="Hierarchy position">
              <div class="concept-panel-content" id="secondary-tree-container" :style="contentHeight">
                <SecondaryTree :conceptIri="conceptIri" />
              </div>
            </TabPanel>
          </TabView>
        </div>
        <DownloadDialog v-if="showDownloadDialog" @closeDownloadDialog="closeDownloadDialog" :showDialog="showDownloadDialog" :conceptIri="conceptIri" />
      </div>
    </Panel>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EntityChart from "../components/concept/EntityChart.vue";
import Graph from "../components/concept/graph/Graph.vue";
import Definition from "../components/concept/Definition.vue";
import UsedIn from "../components/concept/UsedIn.vue";
import Members from "../components/concept/Members.vue";
import PanelHeader from "../components/concept/PanelHeader.vue";
import Mappings from "../components/concept/Mappings.vue";
import EclDefinition from "@/components/concept/EclDefinition.vue";
import { isOfTypes, isValueSet, isProperty } from "@/helpers/ConceptTypeMethods";
import { mapState } from "vuex";
import DownloadDialog from "@/components/concept/DownloadDialog.vue";
import EntityService from "@/services/EntityService";
import ConfigService from "@/services/ConfigService";
import LoggerService from "@/services/LoggerService";
import SecondaryTree from "../components/concept/SecondaryTree.vue";
import { IM } from "@/vocabulary/IM";
import { RDF } from "@/vocabulary/RDF";
import { RDFS } from "@/vocabulary/RDFS";
import { MODULE_IRIS } from "@/helpers/ModuleIris";
import { SHACL } from "@/vocabulary/SHACL";
import Properties from "@/components/concept/Properties.vue";
import { DefinitionConfig } from "@/models/configs/DefinitionConfig";
import { TTIriRef } from "@/models/TripleTree";
import { copyConceptToClipboard, conceptObjectToCopyString } from "@/helpers/CopyConceptToClipboard";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getContainerElementOptimalHeight } from "@/helpers/GetContainerElementOptimalHeight";
import { byOrder } from "@/helpers/Sorters";

export default defineComponent({
  name: "Concept",
  components: {
    PanelHeader,
    EntityChart,
    Graph,
    UsedIn,
    Members,
    Definition,
    DownloadDialog,
    SecondaryTree,
    Mappings,
    Properties,
    EclDefinition
  },
  computed: {
    isSet(): boolean {
      return isValueSet(this.types);
    },

    showGraph(): boolean {
      return isOfTypes(this.types, IM.CONCEPT, SHACL.NODESHAPE);
    },

    showMappings(): boolean {
      return (isOfTypes(this.types, IM.CONCEPT) || isOfTypes(this.types, RDFS.CLASS)) && !isOfTypes(this.types, SHACL.NODESHAPE);
    },

    isConcept(): boolean {
      return isOfTypes(this.types, IM.CONCEPT);
    },

    isQuery(): boolean {
      return isOfTypes(this.types, IM.QUERY_TEMPLATE);
    },

    isRecordModel(): boolean {
      return isOfTypes(this.types, SHACL.NODESHAPE);
    },

    isFolder(): boolean {
      return isOfTypes(this.types, IM.FOLDER);
    },

    isProperty(): boolean {
      return isProperty(this.types);
    },

    ...mapState(["conceptIri", "selectedEntityType", "conceptActivePanel", "activeModule", "blockedIris"])
  },
  watch: {
    async conceptIri() {
      await this.init();
    },

    selectedEntityType(newValue, oldValue) {
      this.setActivePanel(newValue, oldValue);
    },

    active(newValue) {
      this.$store.commit("updateConceptActivePanel", newValue);
    },

    types() {
      if (this.isFolder) {
        if ("activeElement" in document) {
          (document.activeElement as HTMLElement).blur();
        }
        this.active = 0;
      }
    }
  },
  async mounted() {
    this.setContentHeight();
    window.addEventListener("resize", this.onResize);
    await this.init();
    this.setContentHeight();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      loading: false,
      editDialogView: true,
      showDownloadDialog: false,
      concept: {} as any,
      definitionText: "",
      display: false,
      types: [] as TTIriRef[],
      header: "",
      dialogHeader: "",
      active: 0,
      contentHeight: "",
      contentHeightValue: 0,
      copyMenuItems: [] as any,
      configs: [] as DefinitionConfig[],
      conceptAsString: "",
      items: [
        {
          label: "JSON Format",
          command: () => {
            this.downloadOption("json");
          }
        },
        {
          label: "Turtle Format",
          command: () => {
            this.downloadOption("turtle");
          }
        }
        // {label: "Custom Format",
        // command: () => {
        //     this.downloadOption("custom");
        //   }
        // }
      ] as any,
      selectedOption: {} as any
    };
  },
  methods: {
    onResize(): void {
      this.setContentHeight();
    },

    focusTree(): void {
      this.$store.commit("updateFocusTree", true);
    },

    directToEditRoute(): void {
      this.$router.push({
        name: "Edit",
        params: { iri: this.concept["@id"] }
      });
    },

    directToCreateRoute(): void {
      this.$router.push({ name: "Create" });
    },

    async getConcept(iri: string): Promise<void> {
      const predicates = this.configs
        .filter((c: DefinitionConfig) => c.type !== "Divider")
        .filter((c: DefinitionConfig) => c.predicate !== "subtypes")
        .filter((c: DefinitionConfig) => c.predicate !== "inferred")
        .filter((c: DefinitionConfig) => c.predicate !== "termCodes")
        .filter((c: DefinitionConfig) => c.predicate !== "@id")
        .filter((c: DefinitionConfig) => c.predicate !== "None")
        .filter((c: DefinitionConfig) => c.predicate !== undefined)
        .map((c: DefinitionConfig) => c.predicate);

      this.concept = await EntityService.getPartialEntity(iri, predicates);

      this.concept["@id"] = iri;
      this.concept["subtypes"] = await EntityService.getEntityChildren(iri);

      this.concept["termCodes"] = await EntityService.getEntityTermCodes(iri);
    },

    async getInferred(iri: string): Promise<void> {
      const result = await EntityService.getDefinitionBundle(iri);
      if (isObjectHasKeys(result, ["entity"]) && isObjectHasKeys(result.entity, [RDFS.SUBCLASS_OF, IM.ROLE_GROUP])) {
        const roleGroup = result.entity[IM.ROLE_GROUP];
        delete result.entity[IM.ROLE_GROUP];
        result.entity[RDFS.SUBCLASS_OF].push({ "http://endhealth.info/im#roleGroup": roleGroup });
      }
      this.concept["inferred"] = result;
    },

    async getConfig(name: string): Promise<void> {
      this.configs = await ConfigService.getComponentLayout(name);
      if (this.configs.every(config => isObjectHasKeys(config, ["order"]))) {
        this.configs.sort(byOrder);
      } else {
        LoggerService.error(undefined, "Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
      }
    },

    async init(): Promise<void> {
      this.loading = true;
      await this.getConfig("definition");
      await this.getConcept(this.conceptIri);
      await this.getInferred(this.conceptIri);
      this.types = isObjectHasKeys(this.concept, [RDF.TYPE]) ? this.concept[RDF.TYPE] : ([] as TTIriRef[]);
      this.header = this.concept[RDFS.LABEL];
      await this.setCopyMenuItems();
      this.setStoreType();
      this.conceptAsString = copyConceptToClipboard(this.concept, this.configs, undefined, this.blockedIris);
      this.loading = false;
    },

    setStoreType(): void {
      let type;
      if (this.isSet) {
        type = "Sets";
      } else if (this.isConcept && !this.isRecordModel) {
        type = "Ontology";
      } else if (this.isQuery) {
        type = "Queries";
      } else if (this.isRecordModel) {
        type = "DataModel";
      } else if (this.isProperty) {
        type = "Property";
      } else {
        type = this.activeModule;
        this.active = 0;
      }
      this.$store.commit("updateSelectedEntityType", type);
      if (!MODULE_IRIS.includes(this.conceptIri)) {
        this.$store.commit("updateModuleSelectedEntities", {
          module: this.isProperty ? "DataModel" : type,
          iri: this.conceptIri
        });
      }
    },

    setActivePanel(newType: string, oldType: string): void {
      if (newType === oldType) {
        this.active = this.conceptActivePanel;
      } else {
        if (this.isSet) {
          this.active = 2;
        } else if (this.isRecordModel) {
          this.active = 3;
        } else {
          this.active = 0;
        }
      }
    },

    setContentHeight(): void {
      const calcHeight = getContainerElementOptimalHeight("concept-main-container", ["p-panel-header", "p-tabview-nav"], true, 4, 1);
      if (!calcHeight.length) {
        this.contentHeight = "height: 800px; max-height: 800px;";
        this.contentHeightValue = 800;
      } else {
        this.contentHeight = "height: " + calcHeight + ";" + "max-height: " + calcHeight + ";";
        this.contentHeightValue = parseInt(calcHeight, 10);
      }
    },

    openDownloadDialog(): void {
      this.showDownloadDialog = true;
    },

    closeDownloadDialog(): void {
      this.showDownloadDialog = false;
    },

    async setCopyMenuItems(): Promise<void> {
      this.copyMenuItems = [
        {
          label: "Copy",
          disabled: true
        },
        {
          separator: true
        },
        {
          label: "All",
          command: async () => {
            await navigator.clipboard
              .writeText(copyConceptToClipboard(this.concept, this.configs, undefined, this.blockedIris))
              .then(() => {
                this.$toast.add(LoggerService.success("Concept copied to clipboard"));
              })
              .catch(err => {
                this.$toast.add(LoggerService.error("Failed to copy concept to clipboard", err));
              });
          }
        }
      ];

      let key: string;
      let value: any;
      for ([key, value] of Object.entries(this.concept)) {
        let result = conceptObjectToCopyString(key, value, 0, 1, this.configs);
        if (!result || !result.value) continue;
        const label = result.label;
        const text = result.value;
        this.copyMenuItems.push({
          label: label,
          command: async () => {
            await navigator.clipboard
              .writeText(text)
              .then(() => {
                this.$toast.add(LoggerService.success(label + " copied to clipboard"));
              })
              .catch(err => {
                this.$toast.add(LoggerService.error("Failed to copy " + label + " to clipboard", err));
              });
          }
        });
      }
    },

    isObjectHasKeysWrapper(object: any, keys: string[]) {
      return isObjectHasKeys(object, keys);
    },

    async exportConcept(format: any) {
      this.loading = true;
      const result = await EntityService.downloadConcept(this.conceptIri, format);
      this.loading = false;
      const url = window.URL.createObjectURL(new Blob([result], { type: format === "turtle" ? "text/plain" : "application/javascript" }));
      const link = document.createElement("a");
      link.href = url;
      const ending = format === "turtle" ? ".txt" : ".json";
      link.download = "Concept" + ending;
      link.click();
    },
    downloadOption(format: any) {
      if (format === "custom") {
        this.openDownloadDialog();
      } else {
        this.exportConcept(format);
      }
    },

    toggle(event: any, refId: string) {
      const x = this.$refs[refId] as any;
      x.toggle(event);
    }
  }
});
</script>
<style scoped>
#concept-main-container {
  grid-area: content;
  height: calc(100vh - 2rem);
  width: 100%;
  overflow-y: auto;
  background-color: #ffffff;
}

.p-tabview-panel {
  min-height: 100%;
}

.p-panel {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  height: 100%;
}

.concept-panel-content {
  overflow: auto;
  background-color: #ffffff;
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

.loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
}
</style>
