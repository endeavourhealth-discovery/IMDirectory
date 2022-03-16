<template>
  <div id="concept-main-container">
    <Panel>
      <template #icons>
        <button class="p-panel-header-icon p-link mr-2" @click="closeBar">
          <span class="pi pi-times"></span>
        </button>
      </template>
      <template #header>
        <PanelHeader :types="types" :header="header" />
      </template>
      <div id="concept-content-dialogs-container">
        <div id="concept-panel-container">
          <TabView :lazy="true">
            <TabPanel header="Details">
              <div v-if="loading" class="loading-container" :style="contentHeight">
                <ProgressSpinner />
              </div>
              <div v-else class="concept-panel-content" id="definition-container" :style="contentHeight">
                <Definition :concept="concept" :configs="configs" />
              </div>
            </TabPanel>
            <TabPanel v-if="terms" header="Terms">
              <div class="concept-panel-content" id="term-table-container" :style="contentHeight">
                <TermCodeTable :terms="terms" />
              </div>
            </TabPanel>
            <TabPanel header="Hierarchy position">
              <div class="concept-panel-content" id="secondary-tree-container" :style="contentHeight">
                <SecondaryTree :conceptIri="selectedConceptIri" />
              </div>
            </TabPanel>
            <!-- TODO -->
            <!-- <TabPanel header="Activity">
              <div class="concept-panel-content" id="activity-container" :style="contentHeight"></div>
            </TabPanel> -->
          </TabView>
        </div>
      </div>
    </Panel>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Definition from "../infobar/Definition.vue";
import PanelHeader from "../infobar/PanelHeader.vue";
import EntityService from "@/services/EntityService";
import ConfigService from "@/services/ConfigService";
import LoggerService from "@/services/LoggerService";
import SecondaryTree from "@/components/infobar/SecondaryTree.vue";
import { DefinitionConfig, TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers } from "im-library";
import { mapState } from "vuex";
const { IM, RDF, RDFS } = Vocabulary;
const {
  DataTypeCheckers: { isObjectHasKeys },
  ContainerDimensionGetters: { getContainerElementOptimalHeight },
  Sorters: { byOrder }
} = Helpers;

export default defineComponent({
  name: "InfoSideBar",
  computed: {
    ...mapState(["selectedConceptIri"])
  },
  components: {
    PanelHeader,
    Definition,
    SecondaryTree
  },

  watch: {
    async selectedConceptIri() {
      if (this.selectedConceptIri) await this.init();
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
      concept: {} as any,
      definitionText: "",
      types: [] as TTIriRef[],
      header: "",
      contentHeight: "",
      contentHeightValue: 0,
      configs: [] as DefinitionConfig[],
      conceptAsString: "",
      terms: [] as any[] | undefined
    };
  },
  methods: {
    closeBar() {
      this.$emit("closeBar");
    },
    onResize(): void {
      this.setContentHeight();
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

    async getConfig(): Promise<void> {
      const defaultPredicateNames = await ConfigService.getDefaultPredicateNames();
      this.$store.commit("updateDefaultPredicateNames", defaultPredicateNames);
      const definitionConfig = await ConfigService.getComponentLayout("definition");
      const summaryConfig = await ConfigService.getComponentLayout("summary");
      this.configs = definitionConfig.concat(summaryConfig);

      if (this.configs.every(config => isObjectHasKeys(config, ["order"]))) {
        this.configs.sort(byOrder);
      } else {
        LoggerService.error(undefined, "Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
      }
    },

    async init(): Promise<void> {
      this.loading = true;
      await this.getConfig();
      await this.getConcept(this.selectedConceptIri);
      await this.getInferred(this.selectedConceptIri);
      await this.getTerms(this.selectedConceptIri);
      this.types = isObjectHasKeys(this.concept, [RDF.TYPE]) ? this.concept[RDF.TYPE] : ([] as TTIriRef[]);
      this.header = this.concept[RDFS.LABEL];
      this.loading = false;
    },

    async getTerms(iri: string) {
      const entity = await EntityService.getPartialEntity(iri, [IM.HAS_TERM_CODE]);
      this.terms = isObjectHasKeys(entity, [IM.HAS_TERM_CODE])
        ? (entity[IM.HAS_TERM_CODE] as []).map(term => {
            return { name: term[RDFS.LABEL], code: term[IM.CODE] };
          })
        : undefined;
    },

    setContentHeight(): void {
      const calcHeight = getContainerElementOptimalHeight("concept-main-container", ["p-panel-header", "p-tabview-nav"], true, 4, 1);
      if (!calcHeight.length) {
        this.contentHeight = "height: 700px; max-height: 700px;";
        this.contentHeightValue = 800;
      } else {
        this.contentHeight = "height: " + calcHeight + ";" + "max-height: " + calcHeight + ";";
        this.contentHeightValue = parseInt(calcHeight, 10);
      }
    }
  }
});
</script>
<style scoped>
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
  height: calc(100vh - 12rem) !important;
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
