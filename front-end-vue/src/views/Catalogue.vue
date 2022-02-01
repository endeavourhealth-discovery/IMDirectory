<template>
  <SideNav />
  <div class="layout-main">
    <div class="catalogue-grid">
      <CatalogueSideBar :typeOptions="types" :history="history" @updateHistory="updateHistory" />
      <router-view :instanceIri="instanceIri" :instance="instance" :history="history" :types="types" :loading="loading" @updateHistory="updateHistory" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SideNav from "@/components/home/SideNav.vue";
import CatalogueService from "@/services/CatalogueService";
import CatalogueSideBar from "@/components/catalogue/CatalogueSideBar.vue";
import { mapState } from "vuex";
import { IM } from "@/vocabulary/IM";
import { TTBundle } from "@/models/TripleTree";
import { InstanceHistoryItem } from "@/models/catalogue/InstanceHistoryItem";
import { SimpleCount } from "@/models/SimpleCount";

export default defineComponent({
  name: "Catalogue",
  components: {
    SideNav,
    CatalogueSideBar
  },
  watch: {
    async instanceIri(): Promise<void> {
      this.init();
    }
  },
  computed: { ...mapState(["instanceIri"]) },
  data() {
    return {
      instance: {} as TTBundle,
      history: [] as InstanceHistoryItem[],
      types: [] as SimpleCount[],
      loading: false
    };
  },
  async mounted() {
    this.updateSideNav();
    await this.init();
  },
  methods: {
    async init(): Promise<void> {
      this.loading = true;
      await this.getTypesCount();
      if (this.instanceIri.length) {
        this.getInstance();
        this.$router.push({ name: "Individual", params: { selectedIri: this.instanceIri } });
      } else {
        this.$router.push({ name: "CatalogueDashboard" });
      }
      this.loading = false;
    },

    updateSideNav(): void {
      this.$store.commit("updateSideNavHierarchyFocus", {
        name: "Catalogue",
        fullName: "Catalogue",
        route: "Catalogue",
        iri: IM.MODULE_CATALOGUE
      });
    },

    async getTypesCount(): Promise<void> {
      const result = await CatalogueService.getTypesCount();
      this.types = result;
    },

    async getInstance(): Promise<void> {
      this.instance = await CatalogueService.getPartialInstance(this.instanceIri);
    },

    updateHistory(historyItem: InstanceHistoryItem): void {
      if (this.history.findIndex(item => item["@id"] === historyItem["@id"]) === -1) {
        this.history.push(historyItem);
      }
    }
  }
});
</script>
<style scoped>
.catalogue-grid {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas: "sidebar content";
  column-gap: 7px;
}
</style>
