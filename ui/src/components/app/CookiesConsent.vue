<template>
  <Sidebar
    :visible="!cookiesEssentialAccepted || showCookieConsent"
    position="left"
    :showCloseIcon="false"
    :dismissable="false"
    :blockScroll="true"
    :modal="true"
    :autoZIndex="false"
    id="cookies-sidebar"
    style="width: 40%"
  >
    <h1>Our use of cookies</h1>
    <p>We use necessary cookies to make this site work.</p>
    <p>For detailed information on the cookies we use, please visit our <router-link to="/cookies">cookies page</router-link>.</p>
    <div class="buttons-container">
      <Button label="Accept all cookies" @click="handleAcceptAll" />
      <Button label="Accept essential only" @click="handleAcceptEssential" />
    </div>
    <h2>Essential cookies</h2>
    <p>These cookies enable core functionality such as security, network management and accessibility.</p>

    <h2>Optional cookies</h2>
    <InputSwitch v-model="optionalChecked" />
    <p>
      These cookies are used to improve the user experience on this site. These cookies are recommended for the best experience, but are not required to use the
      site's core functionality.
    </p>
    <div class="save-button-container">
      <Button label="Save and close" @click="handleSave" class="save-button" />
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { ComputedRef, onMounted, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useRootStore } from "@/stores/rootStore";
import { useCookieStore } from "@/stores/cookieStore";

const rootStore = useRootStore();
const cookieStore = useCookieStore();
const route = useRoute();

const cookiesEssentialAccepted: ComputedRef<boolean> = computed(() => cookieStore.cookiesEssentialAccepted);
const cookiesOptionalAccepted: ComputedRef<boolean> = computed(() => cookieStore.cookiesOptionalAccepted);
const showCookieConsent: ComputedRef<boolean> = computed(() => cookieStore.showCookieConsent);

const essentialChecked = ref(false);
const optionalChecked = ref(false);

watch(cookiesOptionalAccepted, newValue => (optionalChecked.value = newValue));

onMounted(() => {
  if (cookiesEssentialAccepted.value) essentialChecked.value = true;
  if (cookiesOptionalAccepted.value) optionalChecked.value = true;
});

function handleAcceptAll() {
  cookieStore.updateCookiesEssentialAccepted(true);
  cookieStore.updateCookiesOptionalAccepted(true);
  cookieStore.updateShowCookieConsent(false);
}

function handleAcceptEssential() {
  cookieStore.updateCookiesEssentialAccepted(true);
  cookieStore.updateCookiesOptionalAccepted(false);
  cookieStore.clearOptionalCookies();
  cookieStore.updateShowCookieConsent(false);
}

function handleSave() {
  cookieStore.updateCookiesEssentialAccepted(true);
  cookieStore.updateCookiesOptionalAccepted(optionalChecked.value);
  if (!optionalChecked.value) cookieStore.clearOptionalCookies();
  cookieStore.updateShowCookieConsent(false);
}
</script>

<style>
.p-sidebar-mask {
  z-index: 10000;
}
</style>

<style scoped>
.save-button-container {
  display: flex;
  justify-content: center;
  flex-flow: row;
}
.buttons-container {
  display: flex;
  justify-content: center;
  flex-flow: row;
  gap: 0.5rem;
}
.save-button {
  width: fit-content;
}
</style>
