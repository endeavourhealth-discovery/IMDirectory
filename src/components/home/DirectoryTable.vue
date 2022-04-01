<template>
  <div id="directory-table-container">
    <div class="card">
      <DataTable
        :value="children"
        class="concept-data-table p-datatable-sm"
        v-model:selection="selected"
        selectionMode="single"
        dataKey="@id"
        @rowUnselect="onRowUnselect"
        @rowSelect="onRowSelect"
        @row-contextmenu="onRowRightClick"
        @contextmenu="onRightClick"
        @row-dblclick="onRowDblClick"
        :scrollable="true"
        scrollHeight="flex"
        responsiveLayout="scroll"
        :loading="loading"
      >
        <template #loading>
          Loading data. Please wait.
        </template>
        <template #empty>
          No records found.
        </template>

        <template #header>
          <div class="grid">
            <div class="col-10 table-header">
              <Breadcrumb :home="home" :model="pathItems" />
              <div v-if="!onFavouriteView">
                <Button
                  v-if="isFavourite(conceptIri)"
                  icon="fa-solid fa-star"
                  style="color: #e39a36"
                  class="p-button-rounded p-button-text p-button-plain"
                  @click="updateParentFavourite"
                />
                <Button v-else icon="fa-regular fa-star" class="p-button-rounded p-button-text p-button-plain" @click="updateParentFavourite" />
                <Button icon="fa fa-info-circle" class="p-button-rounded p-button-text p-button-plain" @click="showParentInfo" />
                <Menu id="path_overlay_menu" ref="pathOverlayMenu" :model="pathOptions" :popup="true" />
              </div>
            </div>
            <div class="col-2 header-button-group p-buttonset">
              <Button icon="pi pi-angle-left" :disabled="canGoBack" class="go-back p-button-rounded p-button-text p-button-plain" @click="goBack" />
              <Button icon="pi pi-angle-right" :disabled="canGoForward" class="go-forward p-button-rounded p-button-text p-button-plain" @click="goForward" />
            </div>
          </div>
        </template>
        <Column field="name" header="Name">
          <template #body="{data}">
            <span :style="getColourFromType(data.type)" class="p-mx-1 type-icon">
              <font-awesome-icon :icon="data.icon" />
            </span>
            <span class="text-name">{{ data.name }}</span>
          </template>
        </Column>
        <Column field="type" header="Type">
          <template #body="{data}"> {{ getNamesAsStringFromTypes(data.type) }}</template>
        </Column>
        <Column :exportable="false" bodyStyle="text-align: center; overflow: visible; justify-content: flex-end;">
          <template #body="{data}">
            <Button
              v-if="data.hasChildren"
              @click="open(data)"
              aria-haspopup="true"
              aria-controls="overlay_menu"
              type="button"
              class="p-button-rounded p-button-text p-button-plain"
              icon="pi pi-folder-open"
            />
            <Button icon="pi pi-fw pi-eye" class="p-button-rounded p-button-text p-button-plain" @click="view(data)" />
            <Button icon="pi pi-fw pi-info-circle" class="p-button-rounded p-button-text p-button-plain" @click="showInfo(data)" />

            <Button
              v-if="isFavourite(data['@id'])"
              style="color: #e39a36"
              icon="pi pi-fw pi-star-fill"
              class="p-button-rounded p-button-text "
              @click="updateFavourites(data)"
            />

            <Button v-else icon="pi pi-fw pi-star" class="p-button-rounded p-button-text p-button-plain" @click="updateFavourites(data)" />
          </template>
        </Column>
      </DataTable>
      <ContextMenu ref="menu" :model="rClickOptions" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import EntityService from "@/services/EntityService";
import DirectService from "@/services/DirectService";
import { RouteRecordName } from "vue-router";
import { EntityReferenceNode, TTIriRef, DefinitionConfig } from "im-library/dist/types/interfaces/Interfaces";
import { Enums, Vocabulary, Helpers } from "im-library";
const { AppEnum } = Enums;
const { IM, RDFS, RDF } = Vocabulary;
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes }
} = Helpers;

export default defineComponent({
  name: "DirectoryTable",
  computed: {
    onFavouriteView() {
      return this.$route.params.selectedIri === IM.NAMESPACE + "Favourites";
    },
    ...mapState(["conceptIri", "favourites"])
  },
  watch: {
    async conceptIri(newValue) {
      if (newValue) await this.init(newValue);
    },
    types(newValue): void {
      if (newValue && newValue.length > 0) {
        this.color = "color: " + getColourFromType(newValue);
        this.icon = getFAIconFromType(newValue);
      }
    },
    async favourites() {
      if (this.onFavouriteView) await this.init(this.conceptIri);
    }
  },
  async mounted() {
    if (this.conceptIri) await this.init(this.conceptIri);
  },
  data() {
    return {
      canGoForward: false,
      canGoBack: false,
      pathOptions: [] as any[],
      home: { icon: "pi pi-home", to: "/" },
      rClickOptions: [
        {
          label: "Open",
          icon: "pi pi-fw pi-folder-open",
          command: () => this.open()
        },
        {
          label: "View",
          icon: "pi pi-fw pi-eye",
          command: () => this.view()
        },
        {
          label: "Info",
          icon: "pi pi-fw pi-info-circle",
          command: () => this.showInfo()
        },
        // {
        //   label: "Edit",
        //   icon: "pi pi-fw pi-pencil",
        //   command: () => this.navigateToEditor()
        // },
        // {
        //   label: "Move to",
        //   icon: "pi pi-fw pi-arrow-circle-right",
        //   command: () => this.showInfo()
        // },
        {
          separator: true
        },
        {
          label: "Favourite",
          icon: "pi pi-fw pi-star",
          command: () => this.updateFavourites()
        }
      ],
      pathItems: [] as any[],
      children: [] as EntityReferenceNode[],
      loading: false,
      concept: {} as any,
      definitionText: "",
      configs: [] as DefinitionConfig[],
      conceptAsString: "",
      selected: {} as any,
      types: [],
      header: "",
      color: "",
      icon: [] as string[]
    };
  },
  methods: {
    updateParentFavourite() {
      this.selected["@id"] = this.conceptIri;
      this.updateFavourites();
    },

    showParentInfo() {
      this.selected = {};
      this.selected["@id"] = this.conceptIri;
      this.$store.commit("updateSelectedConceptIri", this.selected["@id"]);
      this.showInfo();
    },

    updateFavourites(data?: any) {
      if (data) this.onRowSelect(data);
      this.$store.commit("updateFavourites", this.selected["@id"]);
    },

    isFavourite(iri: string) {
      if (!this.favourites.length) return false;
      return this.favourites.includes(iri);
    },

    goBack() {
      if (window.history.length > 0) this.$router.back();
    },

    goForward() {
      if (window.history.length > window.history.state.position + 1) this.$router.forward();
    },

    showInfo(data?: any) {
      if (data) this.onRowSelect(data);
      this.$emit("openBar");
    },

    closeBar() {
      this.$emit("closeBar");
    },

    onRowDblClick(event: any) {
      this.onRowSelect(event);
      if (isFolder(event.data.type, IM.FOLDER)) this.open(event.data);
      else this.view();
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

    openOverlayMenu(event: any, data: any) {
      this.onRowSelect(data);
      this.updateRClickOptions();
      (this.$refs.overlayMenu as any).toggle(event);
    },

    onRowRightClick(event: any) {
      this.onRowSelect(event);
    },

    onRightClick(event: any) {
      this.updateRClickOptions();
      (this.$refs.menu as any).show(event);
    },

    updateRClickOptions() {
      this.rClickOptions[this.rClickOptions.length - 1].label = this.isFavourite(this.selected["@id"]) ? "Unfavourite" : "Favourite";
    },

    navigateToEditor(): void {
      DirectService.directTo(AppEnum.EDITOR, this.selected["@id"], this);
    },

    open(data?: any) {
      if (data) this.onRowSelect(data);
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      this.$router.push({
        name: currentRoute,
        params: { selectedIri: this.selected["@id"] }
      });
    },

    view(data?: any) {
      if (data) this.onRowSelect(data);
      DirectService.directTo(AppEnum.VIEWER, this.selected["@id"], this);
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

    async init(iri: string): Promise<void> {
      this.loading = true;
      if (iri === IM.NAMESPACE + "Favourites") {
        const children = await EntityService.getPartialEntities(this.favourites, []);
        (this.children as any) = children.map(child => {
          return { "@id": child["@id"], name: child[RDFS.LABEL], type: child[RDF.TYPE] };
        });
        this.children.forEach(child => ((child as any).icon = getFAIconFromType(child.type)));
        this.pathItems = [{ label: "Favourites", to: iri.replace(/\//gi, "%2F").replace(/#/gi, "%23") }];
      } else {
        await this.getChildren(iri);
        await this.getPath(iri);
      }
      this.setBackForwardDisables();
      this.loading = false;
    },

    getColourFromType(types: TTIriRef[]) {
      return "color: " + getColourFromType(types);
    },

    getNamesAsStringFromTypes(types: TTIriRef[]): string {
      return getNamesAsStringFromTypes(types);
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

.table-header {
  display: flex;
  align-items: center;
  justify-content: left;
}

.header-button-group {
  display: flex;
  align-items: center;
  justify-content: right;
}

.p-breadcrumb {
  all: unset;
}

.card {
  height: 100%;
  padding: 0;
  margin-bottom: 0;
}

.p-button:disabled {
  all: unset !important;
}

.go-forward:disabled,
.go-back:disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

.type-icon {
  padding-right: 0.5rem;
}
</style>
