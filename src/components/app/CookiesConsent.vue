<template>
  <Drawer
    id="cookies-sidebar"
    :autoZIndex="false"
    :blockScroll="true"
    :dismissable="false"
    :modal="true"
    :showCloseIcon="false"
    :visible="!cookiesEssentialAccepted || showCookieConsent"
    position="left"
    style="width: 40%"
  >
    <h1>Our use of cookies</h1>
    <p>We use necessary cookies to make this site work.</p>
    <p>
      For detailed information on the cookies we use, please visit our
      <router-link to="/cookies">cookies page</router-link>
      .
    </p>
    <div class="buttons-container">
      <Button data-testid="accept-all-cookies" label="Accept all cookies" @click="handleAcceptAll" />
      <Button data-testid="accept-essential-cookies" label="Accept essential only" @click="handleAcceptEssential" />
    </div>
    <h2>Essential cookies</h2>
    <p>These cookies enable core functionality such as security, network management and accessibility.</p>

    <h2>Optional cookies</h2>
    <ToggleSwitch v-model="optionalChecked" data-testid="optional-cookies-switch" />
    <p>
      These cookies are used to improve the user experience on this site. These cookies are recommended for the best experience, but are not required to use the
      site's core functionality.
    </p>
    <div class="save-button-container">
      <Button class="save-button" data-testid="cookies-save" label="Save and close" @click="handleSave" />
    </div>
  </Drawer>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, onMounted, ref, watch } from "vue";
import { useSharedStore } from "@/stores/sharedStore";
import { useUserStore } from "@/stores/userStore";

const sharedStore = useSharedStore();
const userStore = useUserStore();

const cookiesEssentialAccepted: ComputedRef<boolean> = computed(() => userStore.cookiesEssentialAccepted);
const cookiesOptionalAccepted: ComputedRef<boolean> = computed(() => userStore.cookiesOptionalAccepted);
const showCookieConsent: ComputedRef<boolean> = computed(() => sharedStore.showCookieConsent);

const essentialChecked = ref(false);
const optionalChecked = ref(false);

watch(cookiesOptionalAccepted, newValue => (optionalChecked.value = newValue));

onMounted(() => {
  if (cookiesEssentialAccepted.value) essentialChecked.value = true;
  if (cookiesOptionalAccepted.value) optionalChecked.value = true;
});

function handleAcceptAll() {
  userStore.updateCookiesEssentialAccepted(true);
  userStore.updateCookiesOptionalAccepted(true);
  sharedStore.updateShowCookieConsent(false);
}

function handleAcceptEssential() {
  userStore.updateCookiesEssentialAccepted(true);
  userStore.updateCookiesOptionalAccepted(false);
  userStore.clearOptionalCookies();
  sharedStore.updateShowCookieConsent(false);
}

function handleSave() {
  userStore.updateCookiesEssentialAccepted(true);
  userStore.updateCookiesOptionalAccepted(optionalChecked.value);
  if (!optionalChecked.value) userStore.clearOptionalCookies();
  sharedStore.updateShowCookieConsent(false);
}
</script>

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
