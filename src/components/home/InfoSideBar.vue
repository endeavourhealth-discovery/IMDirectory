<template>
  <div id="info-side-bar-wrapper" v-if="visible">
    <div id="concept-empty-container" v-if="selectedConceptIri === 'http://endhealth.info/im#Favourites'">
      <div class="header">
        <div class="title">
          <span>Please select an item to display</span>
        </div>
        <Button class="p-button-rounded p-button-text p-button-plain header-close-button" icon="pi pi-times" @click="closeBar" />
      </div>
    </div>
    <div id="concept-main-container" v-else>
      <div class="header">
        <PanelHeader :types="types" :header="header" />
        <Button class="p-button-rounded p-button-text p-button-plain header-close-button" icon="pi pi-times" @click="closeBar" />
      </div>
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else id="concept-content-dialogs-container">
        <div id="concept-panel-container">
          <TabView :lazy="true">
            <TabPanel header="Details">
              <div v-if="isObjectHasKeysWrapper(concept)" class="concept-panel-content" id="definition-container">
                <Definition :concept="concept" :configs="configs" />
              </div>
            </TabPanel>
            <TabPanel v-if="terms" header="Terms">
              <div class="concept-panel-content" id="term-table-container">
                <TermCodeTable :terms="terms" />
              </div>
            </TabPanel>
            <TabPanel header="Hierarchy position">
              <div class="concept-panel-content" id="secondary-tree-container">
                <SecondaryTree :conceptIri="selectedConceptIri" />
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Definition from "./infoSideBar/Definition.vue";
import PanelHeader from "./infoSideBar/PanelHeader.vue";
import { DefinitionConfig, TTIriRef, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers, Models } from "im-library";
import { mapState } from "vuex";
const { IM, RDF, RDFS } = Vocabulary;
const {
  ConceptTypeMethods: { isQuery },
  DataTypeCheckers: { isObjectHasKeys },
  ContainerDimensionGetters: { getContainerElementOptimalHeight },
  Sorters: { byOrder }
} = Helpers;

export default defineComponent({
  name: "InfoSideBar",
  computed: {
    ...mapState(["conceptIri", "selectedConceptIri"]),
    activeProfile: {
      get(): any {
        return this.$store.state.activeProfile;
      },
      set(value: any): void {
        this.$store.commit("updateActiveProfile", value);
      }
    }
  },
  components: {
    PanelHeader,
    Definition
  },
  props: { visible: { type: Boolean, required: true } },
  watch: {
    async conceptIri() {
      if (this.conceptIri) this.$store.commit("updateSelectedConceptIri", this.conceptIri);
      else this.closeBar();
    },
    async selectedConceptIri() {
      if (this.selectedConceptIri) await this.init();
    }
  },
  async mounted() {
    if (!this.selectedConceptIri && this.conceptIri) {
      this.$store.commit("updateSelectedConceptIri", this.conceptIri);
    }
    await this.init();
  },
  data() {
    return {
      loading: false,
      concept: {} as any,
      definitionText: "",
      types: [] as TTIriRef[],
      header: "",
      configs: [] as DefinitionConfig[],
      conceptAsString: "",
      terms: [] as any[] | undefined,
      profile: {} as Models.Query.Profile,
      isQuery: false
    };
  },
  methods: {
    closeBar() {
      this.$emit("closeBar");
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
      predicates.push(IM.DEFINITION);

      this.concept = await this.$entityService.getPartialEntity(iri, predicates);

      this.concept["@id"] = iri;
      const result = await this.$entityService.getPagedChildren(iri, 1, 10);
      const subtypes = result.result.map((child: EntityReferenceNode) => {
        return { "@id": child["@id"], name: child.name };
      });
      this.concept["subtypes"] = { children: subtypes, totalCount: result.totalCount, loadMore: this.loadMore };
      this.concept["termCodes"] = await this.$entityService.getEntityTermCodes(iri);
    },

    async getInferred(iri: string): Promise<void> {
      const result = await this.$entityService.getDefinitionBundle(iri);
      if (isObjectHasKeys(result, ["entity"]) && isObjectHasKeys(result.entity, [RDFS.SUBCLASS_OF, IM.ROLE_GROUP])) {
        const roleGroup = result.entity[IM.ROLE_GROUP];
        delete result.entity[IM.ROLE_GROUP];
        const newRoleGroup: any = {};
        newRoleGroup[IM.ROLE_GROUP] = roleGroup;
        result.entity[RDFS.SUBCLASS_OF].push(newRoleGroup);
      }
      this.concept["inferred"] = result;
    },

    async getConfig(): Promise<void> {
      const defaultPredicateNames = await this.$configService.getDefaultPredicateNames();
      this.$store.commit("updateDefaultPredicateNames", defaultPredicateNames);
      const definitionConfig = await this.$configService.getComponentLayout("definition");
      const summaryConfig = await this.$configService.getComponentLayout("summary");
      this.configs = definitionConfig.concat(summaryConfig);

      if (this.configs.every(config => isObjectHasKeys(config, ["order"]))) {
        this.configs.sort(byOrder);
      } else {
        this.$loggerService.error(undefined, "Failed to sort config for definition component layout. One or more config items are missing 'order' property.");
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
      const entity = await this.$entityService.getPartialEntity(iri, [IM.HAS_TERM_CODE]);
      this.terms = isObjectHasKeys(entity, [IM.HAS_TERM_CODE])
        ? (entity[IM.HAS_TERM_CODE] as []).map(term => {
            return { name: term[RDFS.LABEL], code: term[IM.CODE] };
          })
        : undefined;
    },

    async loadMore(children: any[], totalCount: number, nextPage: number, pageSize: number, loadButton: boolean, iri: string) {
      if (loadButton) {
        if (nextPage * pageSize < totalCount) {
          const result = await this.$entityService.getPagedChildren(iri, nextPage, pageSize);
          const resultChildren = result.result.map((child: EntityReferenceNode) => {
            return { "@id": child["@id"], name: child.name };
          });
          children = children.concat(resultChildren);
          nextPage = nextPage + 1;
          loadButton = true;
        } else if (nextPage * pageSize > totalCount) {
          const result = await this.$entityService.getPagedChildren(iri, nextPage, pageSize);
          const resultChildren = result.result.map((child: EntityReferenceNode) => {
            return { "@id": child["@id"], name: child.name };
          });
          children = children.concat(resultChildren);
          loadButton = false;
        } else {
          loadButton = false;
        }
      }
      return { children: children, totalCount: totalCount, nextPage: nextPage, pageSize: pageSize, loadButton: loadButton, iri: iri };
    },

    isObjectHasKeysWrapper(object: any) {
      return isObjectHasKeys(object);
    }
  }
});
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
