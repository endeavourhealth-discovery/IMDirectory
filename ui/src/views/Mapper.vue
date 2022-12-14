<template>
  <div id="topbar-mapper-container">
    <TopBar>
      <template #content>
        <span class="title"><strong>IM Mapper</strong></span>
      </template>
    </TopBar>

    <div :class="showInfo ? 'main-container' : ''">
      <div :class="showInfo ? 'main-view' : ''">
        <EntityMapper @showDetails="showDetails" @updateSelected="updateSelected" />
      </div>

      <div v-if="showInfo" class="details-view">
        <InfoSideBar :selectedConceptIri="selectedConceptIri" @closeBar="hideDetails" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InfoSideBar from "@/components/editor/infobar/InfoSideBar.vue";
import EntityMapper from "@/components/mapper/EntityMapper.vue";

let showInfo = ref(false);
let selectedConceptIri = ref("");

function updateSelected(selectedIri: string) {
  selectedConceptIri.value = selectedIri;
}

function showDetails(selectedIri: string) {
  selectedConceptIri.value = selectedIri;
  showInfo.value = true;
}

function hideDetails() {
  showInfo.value = false;
}
</script>

<style scoped lang="scss">
#topbar-mapper-container {
  height: 100vh;
  width: 100vw;
  overflow: auto;
}

.title {
  font-size: 2rem;
  white-space: nowrap;
}

.steps-json-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  overflow: auto;
  position: relative;
}

.steps-content {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  background-color: #ffffff;
}

.p-steps {
  width: 100%;
}

.main-container {
  display: flex;
}

.main-view {
  flex: 75%;
}

.details-view {
  flex: 25%;
}
</style>
