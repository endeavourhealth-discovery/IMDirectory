<template>
  <TopBar>
    <template #content>
      <Search/>
    </template>
  </TopBar>
  <div class="layout-wrapper layout-static">
    <Toast />
    <ConfirmDialog />
    <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
      <ProgressSpinner />
    </div>
    <router-view v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Search from "@/components/topbar/Search.vue";
import ProgressSpinner from "primevue/progressspinner";

export default defineComponent({
  name: "App",
  components: { ProgressSpinner: ProgressSpinner, Search },
  async mounted() {
    // check for user and log them in if found or logout if not
    this.loading = true;
    await this.$store.dispatch("authenticateCurrentUser");
    await this.$store.dispatch("fetchBlockedIris");
    await this.$store.dispatch("fetchHighLevelTypes");
    this.loading = false;
  },
  data() {
    return {
      loading: false
    };
  }
});
</script>

<style>
body {
  overflow: hidden;
}

.loading-container {
  width: 100vw;
  height: 100vh;
}

#popup-user {
  background-color: #3b3e47 !important;
  /* bottom setting when cog is visible */
  /* bottom: calc(4rem + 45px) !important;  */
  bottom: 20px !important;
  top: unset !important;
}

@media screen and (max-width: 1439px) {
  #popup-user {
    left: 8vw !important;
  }
}

@media screen and (min-width: 1440px) {
  #popup-user {
    left: 115px !important;
  }
}

#popup-user ul li a .p-menuitem-icon {
  color: lightgray !important;
}

#popup-user ul li a .p-menuitem-text {
  color: lightgray !important;
}

#popup-user ul li:hover a .p-menuitem-icon {
  color: #3b3e47 !important;
}

#popup-user ul li:hover a .p-menuitem-text {
  color: #3b3e47 !important;
}

.avatar-popup {
  width: 25em;
  height: 40vh;
  overflow-y: auto;
}

.avatar-popup div div .p-button {
  margin: 2px;
  border-right: 1px solid #ced4da !important;
}

.swal2-container .swal2-popup .swal2-actions {
  justify-content: flex-end;
}

.p-toast-message-text {
  width: calc(100% - 4rem);
}

.p-toast-message-content {
  width: 100%;
}

.p-toast-detail {
  width: 100%;
  word-wrap: break-word;
}
</style>
