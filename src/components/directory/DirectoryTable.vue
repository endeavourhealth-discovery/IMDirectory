<template>
  <DataTable
    :value="children"
    class="concept-data-table p-datatable-sm"
    v-model:selection="selected"
    selectionMode="single"
    dataKey="@id"
    :scrollable="true"
    scrollHeight="flex"
    :loading="loading"
    :lazy="true"
    :paginator="totalCount > pageSize ? true : false"
    :rows="pageSize"
    :totalRecords="totalCount"
    contextMenu
    @rowContextmenu="onRowContextMenu"
    @row-dblclick="onRowDblClick"
    @row-select="onRowSelect"
    @page="onPage($event)"
  >
    <template #loading>
      Loading data. Please wait.
    </template>
    <template #empty>
      No records found.
    </template>

    <template #header>Contains</template>
    <Column field="name" header="Name">
      <template #body="{data}">
        <span :style="getColourStyleFromType(data.type)" class="p-mx-1 type-icon">
          <i :class="data.icon" aria-hidden="true" />
        </span>
        <span>{{ data.name }}</span>
      </template>
    </Column>
    <Column field="type" header="Type">
      <template #body="{data}">
        <span>{{ getTypesDisplay(data.type) }}</span>
      </template>
    </Column>
    <Column :exportable="false">
      <template #body="{data}">
        <div class="buttons-container">
          <Button
            v-if="data.hasChildren"
            @click="open(data['@id'])"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            type="button"
            class="p-button-rounded p-button-text p-button-plain row-button"
            icon="pi pi-folder-open"
            v-tooltip.top="'Open'"
          />
          <Button icon="pi pi-fw pi-eye" class="p-button-rounded p-button-text p-button-plain row-button" @click="view(data['@id'])" v-tooltip.top="'View'" />
          <Button
            icon="pi pi-fw pi-info-circle"
            class="p-button-rounded p-button-text p-button-plain row-button"
            @click="showInfo(data['@id'])"
            v-tooltip.top="'Info'"
          />
          <Button
            icon="fa-solid fa-pen-to-square"
            class="p-button-rounded p-button-text p-button-plain row-button"
            @click="edit(data['@id'])"
            v-tooltip.top="'Edit'"
          />
          <Button
            v-if="isFavourite(data['@id'])"
            style="color: #e39a36"
            icon="pi pi-fw pi-star-fill"
            class="p-button-rounded p-button-text row-button-fav"
            @click="updateFavourites(data['@id'])"
            v-tooltip.left="'Unfavourite'"
          />

          <Button
            v-else
            icon="pi pi-fw pi-star"
            class="p-button-rounded p-button-text p-button-plain row-button"
            @click="updateFavourites(data['@id'])"
            v-tooltip.left="'Favourite'"
          />
        </div>
      </template>
    </Column>
  </DataTable>
  <ContextMenu ref="menu" :model="rClickOptions" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { Helpers, Vocabulary } from "im-library";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { RouteRecordName } from "vue-router";
const { IM, RDFS, RDF } = Vocabulary;
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes },
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;

export default defineComponent({
  name: "DirectoryTable",
  computed: {
    ...mapState(["conceptIri", "favourites"])
  },
  emits: ["openBar"],
  watch: {
    conceptIri() {
      this.init();
    },
    favourites() {
      if (this.onFavouriteView()) this.init();
    }
  },

  mounted() {
    this.init();
  },

  data() {
    return {
      loading: false,
      children: [] as any[],
      selected: {} as any,
      rClickOptions: [
        {
          label: "Open",
          icon: "pi pi-fw pi-folder-open",
          command: () => this.open((this.selected as any)["@id"])
        },
        {
          label: "View",
          icon: "pi pi-fw pi-eye",
          command: () => this.view((this.selected as any)["@id"])
        },
        {
          label: "Info",
          icon: "pi pi-fw pi-info-circle",
          command: () => this.showInfo((this.selected as any)["@id"])
        },
        {
          separator: true
        },
        {
          label: "Favourite",
          icon: "pi pi-fw pi-star",
          command: () => this.updateFavourites((this.selected as any)["@id"])
        }
      ],
      totalCount: 0,
      nextPage: 2,
      pageSize: 50
    };
  },

  methods: {
    async init() {
      this.loading = true;
      !this.onFavouriteView() ? await this.getChildren(this.conceptIri) : await this.getFavourites();
      this.loading = false;
    },

    onFavouriteView() {
      return this.conceptIri === IM.NAMESPACE + "Favourites";
    },

    async getFavourites() {
      const children = await this.$entityService.getPartialEntities(this.favourites, []);
      this.children = children.map(child => {
        return { "@id": child["@id"], name: child[RDFS.LABEL], type: child[RDF.TYPE] };
      });
      this.children.forEach((child: any) => (child.icon = getFAIconFromType(child.type)));
    },

    getTypesDisplay(types: TTIriRef[]): string {
      return getNamesAsStringFromTypes(types);
    },

    getColourStyleFromType(types: TTIriRef[]) {
      return "color: " + getColourFromType(types);
    },

    async getChildren(iri: string) {
      const result = await this.$entityService.getPagedChildren(iri, 1, this.pageSize);
      this.children = result.result;
      this.totalCount = result.totalCount;
      this.children.forEach((child: any) => (child.icon = getFAIconFromType(child.type)));
    },

    isFavourite(iri: string) {
      return isArrayHasLength(this.favourites) && this.favourites.includes(iri);
    },

    updateRClickOptions() {
      this.rClickOptions[this.rClickOptions.length - 1].label = this.isFavourite(this.selected["@id"]) ? "Unfavourite" : "Favourite";
    },

    onRowContextMenu(data: any) {
      this.selected = data.data;
      this.updateRClickOptions();
      (this.$refs.menu as any).show(event);
    },

    updateFavourites(iri: string) {
      this.$store.commit("updateFavourites", iri);
    },

    onRowDblClick(event: any) {
      if (isFolder(event.data.type)) this.open(event.data["@id"]);
      else this.view(event.data["@id"]);
    },

    view(iri: string) {
      this.$directService.directTo(this.$env.VIEWER_URL, iri, "concept");
    },

    edit(iri: string) {
      this.$directService.directTo(this.$env.EDITOR_URL, iri, "editor");
    },

    open(iri: string) {
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      this.$router.push({
        name: currentRoute,
        params: { selectedIri: iri }
      });
    },

    onRowSelect(event: any) {
      this.$store.commit("updateSelectedConceptIri", event.data["@id"]);
    },

    showInfo(iri: string) {
      this.$store.commit("updateSelectedConceptIri", iri);
      this.$emit("openBar");
    },

    async loadMore() {
      this.loading = true;
      const result = await this.$entityService.getPagedChildren(this.conceptIri, this.nextPage, this.pageSize);
      this.children = result.result;
      this.loading = false;
    },

    async onPage(event: any) {
      this.nextPage = event.page + 1;
      await this.loadMore();
    }
  }
});
</script>

<style scoped>
.buttons-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  row-gap: 0.5rem;
}

.type-icon {
  padding-right: 0.5rem;
}

.row-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}

.row-button-fav:hover {
  background-color: #e39a36 !important;
  color: #ffffff !important;
}
</style>
