<template>
  <div id="concept-main-container">
    <div class="card">
      <DataTable
        :value="children"
        class="p-datatable-sm"
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
          <div class="p-grid">
            <div class="p-col-6 table-header">
              <Breadcrumb :home="home" :model="pathItems" />
              <Menu id="path_overlay_menu" ref="pathOverlayMenu" :model="pathOptions" :popup="true" />
            </div>
            <div class="p-col-6 header-button-group p-buttonset">
              <Button icon="pi pi-angle-left" class="p-button-rounded p-button-text p-button-plain" @click="goBack" />
              <Button icon="pi pi-angle-right" class="p-button-rounded p-button-text p-button-plain" @click="goForward" />
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
        <Column field="lastModified" header="Last Modified"></Column>
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
      <Sidebar v-model:visible="visibleRight" :baseZIndex="1000" position="right" class="p-sidebar-lg">
        <InfoSideBar id="info-bar" :conceptIri="selected['@id']" />
      </Sidebar>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import EntityService from "@/services/EntityService";
import DirectService from "@/services/DirectService";
import ConfigService from "@/services/ConfigService";
import LoggerService from "@/services/LoggerService";
import { IM } from "@/vocabulary/IM";
import { RDFS } from "@/vocabulary/RDFS";
import { DefinitionConfig } from "@/models/configs/DefinitionConfig";
import { TTIriRef } from "@/models/TripleTree";
import { copyConceptToClipboard } from "@/helpers/CopyConceptToClipboard";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getContainerElementOptimalHeight } from "@/helpers/GetContainerElementOptimalHeight";
import { byOrder } from "@/helpers/Sorters";
import { EntityReferenceNode } from "@/models/EntityReferenceNode";
import { RouteRecordName } from "vue-router";
import InfoSideBar from "./InfoSideBar.vue";
import { getColourFromType, getFAIconFromType, isOfTypes } from "@/helpers/ConceptTypeMethods";

export default defineComponent({
  name: "DirectoryTable",
  components: {
    InfoSideBar
  },
  computed: {
    ...mapState(["conceptIri", "favourites"])
  },
  watch: {
    async conceptIri() {
      await this.init();
    },
    types(newValue): void {
      if (newValue.length > 0) {
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
      pathOptions: [] as any[],
      visibleRight: false,
      home: { icon: "pi pi-home", to: "/" },
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
    isFavourite(iri: string) {
      if (!this.favourites.length) return false;
      return !!this.favourites.find((favourite: any) => favourite["@id"] === iri);
    },

    goBack() {
      this.$router.back();
    },

    goForward() {
      this.$router.forward();
    },

    getNamesFromTypes(typeList: TTIriRef[]) {
      return typeList.map(type => type.name).join(", ");
    },

    showInfo() {
      this.visibleRight = true;
    },

    onRowDblClick(event: any) {
      this.onRowSelect(event);
      this.navigate();
    },

    onRowUnselect() {
      this.selected = {};
    },

    onRowSelect(event: any) {
      this.selected = event?.data || event;
    },

    openPathOverlaymenu(event: any) {
      (this.$refs.pathOverlayMenu as any).toggle(event);
    },

    openOverlayMenu(event: any, data: any) {
      this.onRowSelect(data);
      (this.$refs.overlayMenu as any).toggle(event);
    },

    onRowRightClick(event: any) {
      this.onRowSelect(event);
    },

    onRightClick(event: any) {
      (this.$refs.menu as any).show(event);
    },

    navigate(): void {
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      if (isOfTypes(this.selected?.type, IM.FOLDER)) {
        this.$router.push({
          name: currentRoute,
          params: { selectedIri: this.selected["@id"] }
        });
      } else {
        DirectService.directTo(this.selected["@id"]);
      }
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
      if (this.conceptIri) {
        await this.getChildren(this.conceptIri);
        await this.getConfig("definition");
        await this.getConcept(this.conceptIri);
        await this.getInferred(this.conceptIri);
        await this.getPath(this.conceptIri);
        this.conceptAsString = copyConceptToClipboard(this.concept, this.configs, undefined);
      }
      this.loading = false;
    },

    getColourFromType(types: TTIriRef[]) {
      return "color: " + getColourFromType(types);
    },

    async getChildren(iri: string) {
      this.children = await EntityService.getEntityChildren(iri);
      this.children.forEach(child => (child.icon = getFAIconFromType(child.type)));
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
  height: calc(100% - 4.1rem);
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

#info-bar {
  height: calc(100vh - 6rem);
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
</style>
