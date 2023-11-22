<template>
  <div class="parent-header-container">
    <div class="title-buttons-container">
      <div class="title-container">
        <h4 class="title">
          <IMFontAwesomeIcon v-if="concept" :icon="getIcon(concept)" :style="getColour(concept)" class="p-mx-1 type-icon" :key="concept['@id']" />
          <span>{{ concept["http://www.w3.org/2000/01/rdf-schema#label"] || "Select a task or an action" }}</span>
        </h4>
      </div>
      <div class="concept-buttons-container">
        <Button
          icon="pi pi-fw pi-eye"
          severity="secondary"
          class="p-button-outlined concept-button"
          @click="view(concept['@id'])"
          v-tooltip.left="'Open in Viewer'"
        />
        <Button
          icon="pi pi-fw pi-info-circle"
          severity="secondary"
          class="p-button-outlined concept-button"
          @click="showInfo(concept['@id'])"
          v-tooltip.left="'Show summary panel'"
        />
        <Button icon="pi pi-fw pi-pencil" severity="secondary" class="p-button-outlined concept-button" @click="edit(concept['@id'])" v-tooltip.left="'Edit'" />
        <!-- <Button
          icon="pi pi-fw pi-play"
          class="p-button-secondary p-button-outlined concept-button"
          @click="starTask(concept['@id'])"
          v-tooltip.left="'Start task'"
        /> -->
      </div>
    </div>
    <TextWithLabel label="Iri" :data="concept['@id']" :show="true" />
    <TextWithLabel label="Code" :data="concept['http://endhealth.info/im#code']" :show="true" />
    <div class="flex flex-row justify-content-start">
      <ArrayObjectNameTagWithLabel label="Status" :data="concept['http://endhealth.info/im#status']" :show="true" />
      <ArrayObjectNamesToStringWithLabel label="Types" :data="concept['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']" :show="true" />
    </div>

    <TextHTMLWithLabel label="Description" :data="concept['http://www.w3.org/2000/01/rdf-schema#comment']" :show="true" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { DirectService, EntityService, Env } from "@/services";
import { IM, RDF } from "@im-library/vocabulary";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/userStore";

const emit = defineEmits({ showDetails: (_payload: string) => true });
interface Props {
  conceptIri: string;
}

const props = defineProps<Props>();
watch(
  () => props.conceptIri,
  async newValue => {
    if (newValue) await getConcept();
  }
);

const router = useRouter();
const userStore = useUserStore();

const directService = new DirectService();

const concept: Ref<any> = ref({});

onMounted(async () => {
  if (props.conceptIri) await getConcept();
});

async function getConcept() {
  concept.value = await EntityService.getPartialEntity(props.conceptIri, []);
}

function getIcon(concept: any) {
  if (concept["@id"] === IM.NAMESPACE + "Favourites") return ["fa-solid", "star"];
  return getFAIconFromType(concept[RDF.TYPE]);
}

function getColour(concept: any) {
  return "color: " + getColourFromType(concept[RDF.TYPE]);
}

function showInfo(iri: string) {
  emit("showDetails", iri);
}

function view(iri: string) {
  directService.directTo(Env.VIEWER_URL, iri, "concept");
}

function edit(iri: string) {
  router.push({ name: "TaskDefinition", params: { taskIri: iri } });
}

function starTask(iri: string) {
  router.push({ name: "EntityMapper", params: { taskIri: iri } });
}

function updateFavourites(iri: string) {
  userStore.updateFavourites(iri);
}
</script>

<style scoped>
.parent-header-container {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding: 0.5rem;
  gap: 0.5rem;
}

.title-container {
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.title-buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
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
  background-color: var(--text-color) !important;
  color: var(--surface-a) !important;
}

.concept-button-fav:hover {
  background-color: var(--yellow-500) !important;
  color: var(--surface-a) !important;
}
</style>
