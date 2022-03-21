<template>
  <div id="concept-main-container">
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
        responsiveLayout="scroll"
        :loading="loading"
      >
        <template #loading>
          Loading customers data. Please wait.
        </template>
        <template #empty>
          No records found.
        </template>

        <template #header>
          <div class="grid">
            <div class="col-10 table-header">
              <Breadcrumb :home="home" :model="pathItems" />
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
            <div class="col-2 header-button-group p-buttonset">
              <Button icon="pi pi-angle-left" :disabled="canGoBack" class="go-back p-button-rounded p-button-text p-button-plain" @click="goBack" />
              <Button icon="pi pi-angle-right" :disabled="canGoForward" class="go-forward p-button-rounded p-button-text p-button-plain" @click="goForward" />
            </div>
          </div>
        </template>
        <Column field="name" header="Name">
          <template #body="{data}">
            <span :style="getColourFromType(data.type)" class="p-mx-1">
              <font-awesome-icon v-if="data.type && data.type.length" :icon="data.icon" />
            </span>
            {{ data.name }}
            <span v-if="isFavourite(data['@id'])" style="color: #e39a36" class="p-mx-1">
              <i class="fa-solid fa-star"></i>
            </span>
          </template>
        </Column>
        <Column field="type" header="Type">
          <template #body="{data}"> {{ getNamesFromTypes(data.type) }}</template>
        </Column>
        <!-- <Column field="lastModified" header="Last Modified"></Column> -->
        <Column headerStyle="width: 4rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
          <template #body="{data}">
            <Button
              @click="openOverlayMenu($event, data)"
              aria-haspopup="true"
              aria-controls="overlay_menu"
              type="button"
              class="p-button-rounded p-button-text p-button-plain"
              icon="pi pi-ellipsis-v"
            />
            <Menu id="overlay_menu" ref="overlayMenu" :model="rClickOptions" :popup="true" />
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
  DataTypeCheckers: { isObjectHasKeys },
  CopyConceptToClipboard: { copyConceptToClipboard },
  ContainerDimensionGetters: { getContainerElementOptimalHeight },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isOfTypes },
  Sorters: { byOrder }
} = Helpers;

export default defineComponent({
  name: "DirectoryTable",
  computed: {
    ...mapState(["conceptIri", "favourites"])
  },
  watch: {
    async conceptIri(newValue) {
      if (newValue !== IM.NAMESPACE + "Favourites") await this.init();
    },
    types(newValue): void {
      if (newValue && newValue.length > 0) {
        this.color = "color: " + getColourFromType(newValue);
        this.icon = getFAIconFromType(newValue);
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
      contentHeight: "",
      contentHeightValue: 0,
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

    updateFavourites() {
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

    getNamesFromTypes(typeList: TTIriRef[]) {
      return typeList.map(type => type.name).join(", ");
    },

    showInfo() {
      this.$emit("openBar");
    },

    closeBar() {
      this.$emit("closeBar");
    },

    onRowDblClick(event: any) {
      this.onRowSelect(event);
      if (isOfTypes(this.selected?.type, IM.FOLDER)) this.open();
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

    open() {
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      this.$router.push({
        name: currentRoute,
        params: { selectedIri: this.selected["@id"] }
      });
    },

    view() {
      DirectService.directTo(AppEnum.VIEWER, this.selected["@id"], this);
    },

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
      this.concept = await EntityService.getPartialEntity(iri, [RDF.TYPE, RDFS.LABEL]);

      this.concept["@id"] = iri;
      this.types = this.concept["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];
      this.header = this.concept["http://www.w3.org/2000/01/rdf-schema#label"];
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

    async init(): Promise<void> {
      this.loading = true;
      if (this.conceptIri) {
        await this.getChildren(this.conceptIri);
        await this.getConcept(this.conceptIri);
        await this.getInferred(this.conceptIri);
        await this.getPath(this.conceptIri);
      }
      this.setBackForwardDisables();
      this.loading = false;
    },

    getColourFromType(types: TTIriRef[]) {
      return "color: " + getColourFromType(types);
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
      const folderPath = await EntityService.getFolderPath(iri);
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
    }
  }
});
</script>
<style scoped>
#concept-main-container {
  grid-area: content;
  height: calc(100vh - 4.1rem);
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

.concept-data-table {
  height: calc(100vh - 5.2rem);
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
  padding: 0;
}

.p-button:disabled {
  all: unset !important;
}

.go-forward:disabled,
.go-back:disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}
</style>
