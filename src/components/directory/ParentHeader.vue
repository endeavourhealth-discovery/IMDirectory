<template>
  <div class="title-buttons-container">
    <div class="title-container">
      <h4 class="title">
        <span :style="getColour(concept)" class="p-mx-1 type-icon" key="type-icon">
          <i :class="getIcon(concept)" aria-hidden="true" />
        </span>
        {{ concept["http://www.w3.org/2000/01/rdf-schema#label"] || "Favourites" }}
      </h4>
    </div>
    <div class="concept-buttons-container">
      <Button
        icon="pi pi-fw pi-eye"
        class="p-button-secondary p-button-outlined concept-button"
        @click="view(concept['@id'])"
        v-tooltip.left="'Open in Viewer'"
      />
      <Button
        icon="pi pi-fw pi-info-circle"
        class="p-button-secondary p-button-outlined concept-button"
        @click="showInfo(concept['@id'])"
        v-tooltip.left="'Show summary panel'"
      />
      <Button
        icon="fa-solid fa-pen-to-square"
        class="p-button-secondary p-button-outlined concept-button"
        @click="edit(concept['@id'])"
        v-tooltip.left="'Edit'"
      />
      <Button
        v-if="isFavourite(concept['@id'])"
        style="color: #e39a36"
        icon="pi pi-fw pi-star-fill"
        class="p-button-secondary p-button-outlined concept-button-fav"
        @click="updateFavourites(concept['@id'])"
        v-tooltip.left="'Unfavourite'"
      />
      <Button
        v-else
        icon="pi pi-fw pi-star"
        class="p-button-secondary p-button-outlined concept-button"
        @click="updateFavourites(concept['@id'])"
        v-tooltip.left="'Favourite'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Helpers, Vocabulary, Env } from "im-library";
import DirectService from "@/services/DirectService";
import { mapState } from "vuex";
const { IM, RDF } = Vocabulary;
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType },
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;

export default defineComponent({
  name: "ParentHeader",
  emits: ["openBar"],
  props: ["concept"],
  computed: {
    ...mapState(["favourites"])
  },
  methods: {
    isFavourite(iri: string) {
      return isArrayHasLength(this.favourites) && this.favourites.includes(iri);
    },

    getIcon(concept: any) {
      if (concept["@id"] === IM.NAMESPACE + "Favourites") return ["fa-solid", "star"];
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
      DirectService.directTo(Env.VIEWER_URL, iri, this, "concept");
    },

    edit(iri: string) {
      DirectService.directTo(Env.EDITOR_URL, iri, this, "editor");
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
  align-items: center;
  gap: 0.5rem;
}

.concept-button,
.concept-button-fav {
  height: fit-content;
}

.concept-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}

.concept-button-fav:hover {
  background-color: #e39a36 !important;
  color: #ffffff !important;
}
</style>
