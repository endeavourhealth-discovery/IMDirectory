<template>
  <div id="directory-table-container">
    <div class="header-container">
      <!-- <ParentHierarhcy /> -->
      <ParentHeader @openBar="openBar" :concept="concept" />
    </div>
    <div class="datatable-container">
      <DirectoryTable @openBar="openBar" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import DirectoryTable from "@/components/directory/DirectoryTable.vue";
import ParentHeader from "@/components/directory/ParentHeader.vue";
import EntityService from "@/services/EntityService";
import { EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers } from "im-library";
const { IM } = Vocabulary;
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes },
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;

export default defineComponent({
  name: "Directory",
  components: {
    DirectoryTable,
    ParentHeader
  },
  emits: ["openBar"],
  computed: {
    ...mapState(["conceptIri", "favourites"])
  },
  watch: {
    async conceptIri() {
      await this.init();
    }
  },

  data() {
    return {
      canGoForward: false,
      canGoBack: false,
      pathOptions: [] as any[],
      home: { icon: "pi pi-home", to: "/" },
      pathItems: [] as any[],
      children: [] as EntityReferenceNode[],
      loading: false,
      concept: {} as any,
      selected: {} as any,
      header: "",
      color: "",
      icon: [] as string[]
    };
  },
  async mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.concept = await EntityService.getPartialEntity(this.conceptIri, []);
    },
    goBack() {
      if (window.history.length > 0) this.$router.back();
    },

    goForward() {
      if (window.history.length > window.history.state.position + 1) this.$router.forward();
    },

    onRowUnselect() {
      this.selected = {};
    },

    onRowSelect(event: any) {
      this.selected = event?.data || event;
      this.$store.commit("updateSelectedConceptIri", this.selected["@id"]);
    },

    openPathOverlaymenu(event: any) {
      (this.$refs.pathOverlayMenu as any).toggle(event);
    },

    openBar() {
      this.$emit("openBar");
    },

    setBackForwardDisables() {
      this.canGoForward = window.history.length === window.history.state.position + 1;
      this.canGoBack = window.history.state.position === 0;
    },

    async getChildren(iri: string) {
      this.children = await EntityService.getEntityChildren(iri);
      this.children.forEach(child => ((child as any).icon = getFAIconFromType(child.type)));
    },

    async getPath(iri: string) {
      let folderPath = (await EntityService.getPathBetweenNodes(iri, IM.MODULE_IM)).reverse();
      if (!folderPath.length) folderPath = await EntityService.getFolderPath(iri);
      this.pathItems = folderPath.map(iriRef => {
        return { label: iriRef.name, to: iriRef["@id"].replace(/\//gi, "%2F").replace(/#/gi, "%23") };
      });
      if (this.pathItems.length > 2) {
        const filteredOutPathItems = this.pathItems.splice(1, this.pathItems.length - 2);
        this.pathItems.splice(this.pathItems.length - 1, 0, {
          label: "...",
          to: this.$route.fullPath,
          command: () => {
            this.openPathOverlaymenu(event);
          }
        });
        this.pathOptions = filteredOutPathItems;
      }
    }
  }
});
</script>
<style scoped>
#directory-table-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.datatable-container {
  flex: 0 2 auto;
  overflow: auto;
  padding: 0.5rem;
}

.header-container {
  display: flex;
  flex-flow: column nowrap;
}

.breadcrumb-container {
  padding: 1rem 1rem 0 1rem;
}

.padding-container {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  overflow: auto;
}

.p-tabview-panel {
  min-height: 100%;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: left;
}

.header-button-group {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: right;
}

.p-breadcrumb {
  border: none;
  padding: 0;
  margin: 0;
  background-color: #f8f9fa;
}

.card {
  height: 100%;
  padding: 0;
  margin-bottom: 0;
}

.go-forward:disabled,
.go-back:disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

.fav-icon {
  margin-left: 0.5rem;
}
</style>
