<template>
  <div id="privacy-policy-main-container">
    <TopBar>
      <template #content>
        <div class="topbar-content">
          <span class="title"><strong>Privacy policy</strong></span>
        </div>
      </template>
    </TopBar>
    <div class="privacy-policy-content">
      <Button label="Back" icon="fa-solid fa-arrow-left" @click="goBack" class="back-button" />
      <h1>{{ companyName }} Privacy Policy</h1>
      <p>
        This privacy policy details how {{ companyName }} (hereby covered by "we", "us" or "our") handles the use of your personal data. It explains our
        policies around the collection, processing, use and sharing of the data you provide to our services.
      </p>
      <h2>Data collection</h2>
      <p>
        This site collects data provided directly by you through registration or input within our services. It additionally automatically collects data based on
        a users usage of our services through cookies where necessary, in compliance with our <router-link to="/cookies">cookie policy</router-link>. We collect
        the minimum data required to provide our services and personalised experiences.
      </p>
      <h2>Data processing</h2>
      <p>{{ companyName }} is solely responsible for the processing of personal data provided to their services.</p>
      <h2>Data use</h2>
      <p>Personal data collected is used to provide our services, handle security and for compliance with our industry regulations.</p>
      <h2>Data sharing</h2>
      <p>
        We may share your information with third parties under one of the following circumstances: with your consent, with our service providers, for security
        purposes, to comply with our legal obligations, or when there is a change of buisness control. {{ companyName }} do not sell your personal information
        nor use it for advertising.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TopBar from "@/components/shared/TopBar.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const companyName = ref("Voror Health Technologies Ltd");

async function goBack() {
  if (window.history.length > 2) router.back();
  else await router.push({ name: "LandingPage" });
}
</script>

<style scoped>
#privacy-policy-main-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
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

.privacy-policy-content {
  flex: 1 1 auto;
  overflow: auto;
  padding: 1rem 20%;
}

.back-button {
  width: fit-content;
}
</style>
