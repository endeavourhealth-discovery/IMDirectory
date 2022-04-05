<template>
  <div class="title-buttons-container">
    <div class="title-container">
      <h4 class="title">
        <span :style="getColour(concept)" class="p-mx-1 type-icon">
          <font-awesome-icon :icon="getIcon(concept)" />
        </span>
        {{ concept["http://www.w3.org/2000/01/rdf-schema#label"] || "Favourites" }}
      </h4>
    </div>
    <div class="concept-buttons-container">
      <Button icon="pi pi-fw pi-eye" class="p-button-secondary p-button-outlined" @click="view(concept['@id'])" v-tooltip="'Open in Viewer'" />
      <Button icon="pi pi-fw pi-info-circle" class="p-button-secondary p-button-outlined" @click="showInfo(concept['@id'])" v-tooltip="'Show summary panel'" />
      <Button
        v-if="isFavourite(concept['@id'])"
        style="color: #e39a36"
        icon="pi pi-fw pi-star-fill"
        class="p-button-secondary p-button-outlined"
        @click="updateFavourites(concept['@id'])"
        v-tooltip="'Unfavourite'"
      />
      <Button v-else icon="pi pi-fw pi-star" class="p-button-secondary p-button-outlined" @click="updateFavourites(concept['@id'])" v-tooltip="'Favourite'" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Helpers, Vocabulary, Enums } from "im-library";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
import { RouteRecordName } from "vue-router";
import DirectService from "@/services/DirectService";
import { mapState } from "vuex";
const { IM, RDFS, RDF } = Vocabulary;
const { AppEnum } = Enums;
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isFolder, getNamesAsStringFromTypes },
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;

export default defineComponent({
  name: "ParentHeader",
  emits: ["openBar"],
  props: ["concept"],
  computed: {
    ...mapState(["conceptIri", "favourites"])
  },
  methods: {
    isFavourite(iri: string) {
      return isArrayHasLength(this.favourites) && this.favourites.includes(iri);
    },

    getIcon(concept: any) {
      if (concept["@id"] === IM.NAMESPACE + "Favourites") return ["fas", "star"];
      return getFAIconFromType(concept[RDF.TYPE]);
    },

    getColour(concept: any) {
      return "color: " + getColourFromType(concept[RDF.TYPE]);
    },

    showInfo(iri: string) {
      this.$store.commit("updateSelectedConceptIri", iri);
      this.$emit("openBar");
    },

    view(iri: string) {
      DirectService.directTo(AppEnum.VIEWER, iri, this);
    },

    updateFavourites(iri: string) {
      this.$store.commit("updateFavourites", iri);
    }
  }
});
</script>

<style scoped>
.title-container {
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.title-buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin: 0;
  width: 100%;
  padding: 0.5rem;
}

.title {
  padding: 0;
  margin: 0;
}

.type-icon {
  padding-right: 0.5rem;
}

.concept-buttons-container {
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
