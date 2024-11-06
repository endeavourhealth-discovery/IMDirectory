<template>
  <div id="landing-page-container">
    <div id="landing-content">
      <div id="shortcuts-container">
        <h2>Quick links</h2>
        <div class="shortcuts">
          <template v-for="shortcut of shortcuts">
            <Shortcut
              :icon="shortcut.icon"
              :label="shortcut.label"
              :command="shortcut.command"
              :url="shortcut.url"
              :color="shortcut.color"
              :size="shortcut.size"
              :newTab="shortcut.newTab"
            />
          </template>
        </div>
      </div>
      <RecentActivity />
      <Favourites />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { DirectService } from "@/services";
import { IM, SHACL } from "@/vocabulary";
import Shortcut from "@/components/directory/landingPage/Shortcut.vue";
import RecentActivity from "@/components/directory/landingPage/RecentActivity.vue";
import Favourites from "@/components/directory/landingPage/Favourites.vue";

const directService = new DirectService();

const shortcuts: Ref<{ label: string; icon: string | string[]; url?: string; command?: Function; color: string; size: number; newTab?: boolean }[]> = ref([
  {
    label: "Ontology",
    icon: getFAIconFromType([{ "@id": IM.CONCEPT }]),
    command: () => directService.select(IM.NAMESPACE + "HealthModelOntology"),
    color: getColourFromType([{ "@id": IM.CONCEPT }]),
    size: 4
  },
  {
    label: "Sets",
    icon: getFAIconFromType([{ "@id": IM.SET }]),
    command: () => directService.select(IM.MODULE_SETS),
    color: getColourFromType([{ "@id": IM.SET }]),
    size: 4
  },
  {
    label: "Health records",
    icon: getFAIconFromType([{ "@id": SHACL.NODESHAPE }]),
    command: () => directService.select(IM.HEALTH_RECORDS),
    color: getColourFromType([{ "@id": SHACL.NODESHAPE }]),
    size: 4
  },
  {
    label: "Queries",
    icon: getFAIconFromType([{ "@id": IM.QUERY }]),
    command: () => directService.select(IM.MODULE_QUERIES),
    color: getColourFromType([{ "@id": IM.QUERY }]),
    size: 4
  },
  {
    label: "Creator",
    icon: "fa-duotone fa-circle-plus",
    command: () => directService.create(),
    color: "var(--p-orange-500)",
    size: 4
  },
  {
    label: "Code templates",
    icon: "fa-duotone fa-code",
    command: () => directService.codeGenerator(),
    color: "var(--p-teal-500)",
    size: 4
  },
  {
    label: "ASSIGN UPRN",
    icon: "fa-duotone fa-map-location-dot",
    command: () => directService.uprn(),
    color: "var(--p-red-500)",
    size: 4
  },
  {
    label: "Wiki",
    icon: "/logos/ship-small.png",
    url: "https://wiki.endeavourhealth.org/index.php?title=Welcome_to_the_Endeavour_Health_knowledge_base",
    color: "var(--p-blue-500)",
    size: 4,
    newTab: true
  }
]);
</script>

<style scoped>
#landing-page-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}

#landing-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.p-card {
  box-shadow: none;
}

#shortcuts-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  flex: 0 1 auto;
  padding: 1rem;
  gap: 1rem;
}

.shortcuts {
  display: flex;
  flex-flow: row wrap;
  padding: 0.5rem;
  gap: 1.5rem;
}
</style>
