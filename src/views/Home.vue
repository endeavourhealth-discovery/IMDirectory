<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local" @resizeend="setSplitterContainerHoriz">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto;">
      <Navigator />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto;">
      <div class="splitter-right" v-if="visibleRight" :style="splitterContentWidth">
        <router-view @openBar="visibleRight = true" />
        <div id="info-side-bar-wrapper" v-if="visibleRight">
          <InfoSideBar @closeBar="visibleRight = false" />
        </div>
      </div>

      <div class="splitter-right" v-else>
        <router-view @openBar="visibleRight = true" />
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navigator from "@/components/home/Navigator.vue";
import InfoSideBar from "@/components/infobar/InfoSideBar.vue";
import { Helpers, Vocabulary } from "im-library";
import { EntityReferenceNode, FilterDefaultsConfig, Namespace } from "im-library/dist/types/interfaces/Interfaces";
import ConfigService from "@/services/ConfigService";
import EntityService from "@/services/EntityService";
import { mapState } from "vuex";
const {
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;
const { IM, RDFS } = Vocabulary;

export default defineComponent({
  name: "Home",
  components: {
    Navigator,
    InfoSideBar
  },
  computed: mapState(["filterOptions", "filterDefaults"]),
  async mounted() {
    await this.getConfigs();
    await this.setFilterOptions();
    this.setFilterDefaults();
    this.setSplitterContainerHoriz({ sizes: localStorage.getItem("directoryMainSplitterHorizontal") });
  },
  data() {
    return {
      visibleRight: false,
      selectedIri: "",
      splitterContentWidth: "",
      configs: {} as FilterDefaultsConfig
    };
  },
  methods: {
    setSplitterContainerHoriz(event: any) {
      let leftWidth;
      if (isArrayHasLength(event.sizes) && event.sizes[0] > 0) {
        leftWidth = event.sizes[0];
      } else if (typeof event.sizes === "string") {
        const parsed = JSON.parse(event.sizes);
        if (isArrayHasLength(parsed) && parsed[0] > 0) {
          leftWidth = parsed[0];
        } else {
          leftWidth = 30;
        }
      } else {
        leftWidth = 30;
      }
      const calcWidth = 100 - leftWidth;
      this.splitterContentWidth = "width: calc(" + calcWidth + "vw - 0.5rem);" + "max-width: calc(" + calcWidth + "vw - 0.5rem);";
    },

    async getConfigs(): Promise<void> {
      this.configs = await ConfigService.getFilterDefaults();
      this.$store.commit("updateFilterDefaults", this.configs);
    },

    async setFilterOptions(): Promise<void> {
      const schemeOptions = await EntityService.getNamespaces();
      const statusOptions = await EntityService.getEntityChildren(IM.STATUS);
      const typeOptions = (await EntityService.getPartialEntities(this.filterDefaults.typeOptions, [RDFS.LABEL])).map(typeOption => {
        return { "@id": typeOption["@id"], name: typeOption[RDFS.LABEL] };
      });
      this.$store.commit("updateFilterOptions", {
        status: statusOptions,
        schemes: schemeOptions,
        types: typeOptions
      });
    },

    setFilterDefaults() {
      const selectedStatus = this.filterOptions.status.filter((item: EntityReferenceNode) => this.configs.statusOptions.includes(item["@id"]));
      const selectedSchemes = this.filterOptions.schemes.filter((item: Namespace) => this.configs.schemeOptions.includes(item.iri));
      const selectedTypes = this.filterOptions.types.filter((item: EntityReferenceNode) => this.configs.typeOptions.includes(item["@id"]));
      this.$store.commit("updateSelectedFilters", {
        status: selectedStatus,
        schemes: selectedSchemes,
        types: selectedTypes
      });
      this.$store.commit("updateHierarchySelectedFilters", selectedSchemes);
    }
  }
});
</script>

<style scoped>
.p-splitter {
  height: 100%;
  width: 100%;
}

#info-side-bar-wrapper {
  overflow-x: none;
  transition: 0.5s;
  width: 40%;
}

.splitter-right {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow: auto;
}
</style>
