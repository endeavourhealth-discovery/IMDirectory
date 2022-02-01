<template>
  <SideNav />
  <div class="layout-main">
    <div class="main-grid">
      <SidebarControl />
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SideNav from "@/components/home/SideNav.vue";
import SidebarControl from "@/components/home/SidebarControl.vue";
import { mapState } from "vuex";
import { IM } from "@/vocabulary/IM";

export default defineComponent({
  name: "Home",
  components: {
    SideNav,
    SidebarControl
  },
  computed: mapState(["sideNavHierarchyFocus"]),
  async mounted() {
    this.updateRoute();
  },
  methods: {
    updateRoute(): void {
      if (this.$route.name === "Home" || this.$route.name === "Dashboard") {
        switch (this.sideNavHierarchyFocus.name) {
          case "InformationModel":
            this.$store.commit("updateConceptIri", IM.MODULE_IM);
            break;
          case "Ontology":
            this.$store.commit("updateConceptIri", IM.MODULE_ONTOLOGY);
            break;
          case "ValueSets":
            this.$store.commit("updateConceptIri", IM.MODULE_SETS);
            break;
          case "Queries":
            this.$store.commit("updateConceptIri", IM.MODULE_QUERIES);
            break;
        }
      } else if (this.$route.name === "Concept") {
        this.$store.commit("updateConceptIri", this.$route.params.selectedIri as string);
      }
    }
  }
});
</script>

<style scoped>
.main-grid {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas: "sidebar content";
  column-gap: 7px;
}
.header-grow {
  flex-grow: 1;
}
.user-menu {
  height: 100%;
  margin-left: 5px;
  width: 12.5rem;
}
.p-menubar {
  height: 100%;
}
</style>
