<template>
  <div id="cookies-main-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>Cookies</strong></span>
        </div>
      </template>
    </TopBar>
    <div id="cookies-content-container">
      <Button label="Back" icon="fa-solid fa-arrow-left" @click="goBack" class="back-button" />
      <h1>Essential Cookies</h1>
      <DataTable :value="essentialCookiesData" :show-gridlines="true">
        <Column field="cookie" header="Cookie"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="purpose" header="Purpose"></Column>
      </DataTable>
      <h1>User Preference Cookies</h1>
      <DataTable :value="userCookiesData" :show-gridlines="true">
        <Column field="cookie" header="Cookie"></Column>
        <Column field="name" header="Name"></Column>
        <Column field="purpose" header="Purpose"></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import TopBar from "@/components/shared/TopBar.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const essentialCookiesData: Ref<{ cookie: string; name: string; purpose: string }[]> = ref([
  { cookie: "Cookie control", name: "cookiesAccepted", purpose: "Remembers a user's choice about consent for cookies." },
  {
    cookie: "Current version",
    name: "IMVersion",
    purpose: "Stores the current version of the web app. Used to show current version and changes upon an update."
  },
  { cookie: "Banner control", name: "showBanner", purpose: "Used to store whether the user has closed the updates banner." },
  { cookie: "Snomed license", name: "snomedLicenseAccepted", purpose: "Identifies whether a user has accepted the Snomed License required to use the site." },
  { cookie: "User identity control", name: "Cognito...", purpose: "Multiple security control cookies required for user accounts." }
]);

const userCookiesData: Ref<{ cookie: string; name: string; purpose: string }[]> = ref([
  { cookie: "Theme", name: "currentTheme", purpose: "Remembers the theme a user has selected." },
  { cookie: "Favourites", name: "favourites", purpose: "Stores entites that a user has selected as favourites for easy access." },
  { cookie: "Recent activity", name: "recentLocalActivity", purpose: "Stored the entites recently accessed for returning quick access." },
  { cookie: "Splitter positions", name: "(directory/viewer)MainSplitter(Vertical/Horizontal)", purpose: "Remembers the positions of the dividing splitters." },
  { cookie: "Ecl editor storage", name: "eclEditorSavedString", purpose: "Remembers the last ecl used within the ecl editor." },
  { cookie: "Editor storage", name: "editorSavedEntity", purpose: "Stores the changes to the entity currently being edited to prevent loss of progress." },
  { cookie: "Creator storage", name: "creatorSavedEntity", purpose: "Stores the changes to the entity currently being created to prevent loss of progress." },
  { cookie: "Editor iri", name: "editorSelectedIri", purpose: "Stores the original iri of the entity currently being edited." }
]);

function goBack() {
  if (window.history.length > 2) router.back();
  else router.push({ name: "LandingPage" });
}
</script>

<style scoped>
#cookies-main-container {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}
#cookies-content-container {
  flex: 1 1 auto;
  padding: 1rem 4rem;
  overflow: auto;
}
.topbar-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}
.title {
  font-size: 2rem;
}
</style>
