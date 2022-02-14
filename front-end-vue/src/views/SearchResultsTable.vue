<template>
  <div id="search-results-main-container">
    <div class="card">
      <DataTable
        :loading="searchLoading"
        :value="searchResults"
        contextMenu
        v-model:contextMenuSelection="selectedResult"
        @rowContextmenu="onRowContextMenu"
        responsiveLayout="scroll"
        ref="searchTable"
      >
        <Column field="name" header="Name"></Column>
        <Column field="entityType" header="Types">
          <template #body="slotProps">
            {{ getNamesFromTypes(slotProps.data.entityType) }}
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="slotProps">
            {{ slotProps.data.status }}
          </template>
        </Column>
        <Column field="code" header="Code"></Column>
      </DataTable>

      <ContextMenu :model="rClickOptions" ref="cm" />
    </div>
  </div>
</template>

<script lang="ts">
import { isOfTypes } from "@/helpers/ConceptTypeMethods";
import { ConceptSummary } from "@/models/search/ConceptSummary";
import { TTIriRef } from "@/models/TripleTree";
import { IM } from "@/vocabulary/IM";
import { defineComponent } from "vue";
import { RouteRecordName } from "vue-router";
import { mapState } from "vuex";

export default defineComponent({
  name: "SearchResultsTable",
  computed: mapState(["searchLoading", "filterOptions", "selectedFilters", "searchResults"]),
  data() {
    return {
      selectedResult: {} as ConceptSummary,
      rClickOptions: [
        {
          label: "Open",
          icon: "pi pi-fw pi-folder-open",
          command: () => this.navigate()
        },
        {
          label: "Info",
          icon: "pi pi-fw pi-info-circle",
          command: () => this.showInfo()
        },
        {
          label: "Edit",
          icon: "pi pi-fw pi-pencil",
          command: () => this.showInfo()
        },
        {
          label: "Move to",
          icon: "pi pi-fw pi-arrow-circle-right",
          command: () => this.showInfo()
        },
        {
          separator: true
        },
        {
          label: "Favourite",
          icon: "pi pi-fw pi-star",
          command: () => this.showInfo()
        }
      ]
    };
  },
  methods: {
    onRowContextMenu(event: any) {
      (this.$refs.cm as any).show(event.originalEvent);
    },

    getNamesFromTypes(typeList: TTIriRef[]) {
      return typeList.map(type => type.name).join(", ");
    },

    navigate(): void {
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      if (isOfTypes(this.selectedResult?.entityType, IM.FOLDER)) {
        this.$router.push({
          name: currentRoute,
          params: { selectedIri: this.selectedResult.iri }
        });
      } else {
        const viewAppBase = "https://dev.endhealth.co.uk/#/concept/";
        window.open(viewAppBase + encodeURIComponent(this.selectedResult?.iri));
      }
    }
  }
});
</script>

<style scoped>
#search-results-main-container {
  grid-area: content;
  height: calc(100% - 5rem);
  width: 100%;
  overflow-y: auto;
  background-color: #ffffff;
}

.p-tabview-panel {
  min-height: 100%;
}

.p-datatable {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  height: 100%;
}
</style>
