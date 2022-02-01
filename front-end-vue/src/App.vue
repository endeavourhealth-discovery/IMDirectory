<template>
  <div class="layout-wrapper layout-static">
    <Toast />
    <div v-if="loading" class="p-d-flex p-flex-row p-jc-center p-ai-center loading-container">
      <ProgressSpinner />
    </div>
    <router-view v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ProgressSpinner from "primevue/progressspinner";

export default defineComponent({
  name: "App",
  components: { ProgressSpinner: ProgressSpinner },
  async mounted() {
    // check for user and log them in if found or logout if not
    this.loading = true;
    await this.$store.dispatch("authenticateCurrentUser");
    this.$store.commit("updateHistoryCount", window.history.length);
    await this.$store.dispatch("fetchBlockedIris");
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

/* Settings specifically for dealing with 300% scaling */
/* @media (-webkit-device-pixel-ratio: 3) {
  .p-component {
    font-size: 0.7rem !important;
  }
  .p-tree .p-tree-container .p-treenode .p-treenode-content .p-tree-toggler {
    width: 1rem !important;
    height: 1rem !important;
  }

  .p-button {
    font-size: 0.7rem !important;
  }

  .p-tabview .p-tabview-nav li .p-tabview-nav-link {
    padding: 0.5rem !important;
  }

  .p-panel.p-panel-toggleable .p-panel-header {
    padding: 0rem 1rem !important;
  }

  .monaco-editor {
    font-size: 0.7rem !important;
  }

  .im-logo {
    font-size: 2em !important;
  }

  .user-icon {
    font-size: 2em !important;
  }

  .settings-icon {
    font-size: 2em !important;
  }

  @media screen and (max-width: 1439px) {
    .layout-menu-container {
      width: 8vw;
    }
  }

  @media screen and (min-width: 1440px) {
    .layout-menu-container {
      width: 115px;
    }
  }
} */

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
