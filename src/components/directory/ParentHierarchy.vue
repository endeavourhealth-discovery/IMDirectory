<template>
  <div class="breadcrumb-container">
    <div class="padding-container grid">
      <div class="col-10 table-header">
        <Breadcrumb :home="home" :model="pathItems" />
        <Menu id="path_overlay_menu" ref="pathOverlayMenu" :model="pathOptions" :popup="true" />
      </div>
      <div class="col-2 header-button-group p-buttonset">
        <Button icon="pi pi-angle-left" :disabled="canGoBack" class="go-back p-button-rounded p-button-text p-button-plain" @click="goBack" />
        <Button icon="pi pi-angle-right" :disabled="canGoForward" class="go-forward p-button-rounded p-button-text p-button-plain" @click="goForward" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Helpers, Vocabulary } from "im-library";
import { TTIriRef } from "im-library/dist/types/interfaces/Interfaces";
const { IM } = Vocabulary;
const {
  Converters: { iriToUrl }
} = Helpers;

export default defineComponent({
  name: "ParentHierarhcy",
  props: ["conceptIri"],
  data() {
    return { pathItems: [] as any[], pathOptions: [] as any[], home: { icon: "pi pi-home", to: "/" }, canGoForward: false, canGoBack: false };
  },
  watch: {
    conceptIri() {
      this.init();
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    openPathOverlaymenu(event: any) {
      (this.$refs.pathOverlayMenu as any).toggle(event);
    },

    goBack() {
      if (window.history.length > 0) this.$router.back();
    },

    goForward() {
      if (window.history.length > window.history.state.position + 1) this.$router.forward();
    },

    init() {
      if (this.conceptIri) {
        this.getPath();
        this.setBackForwardDisables();
      }
    },

    async getPath() {
      if (this.conceptIri === IM.NAMESPACE + "Favourites") {
        this.pathItems = [{ label: "Favourites", to: iriToUrl(IM.NAMESPACE) + "Favourites" }];
        return;
      }
      let folderPath = (await this.$entityService.getPathBetweenNodes(this.conceptIri, IM.MODULE_IM)).reverse();
      if (!folderPath.length) folderPath = await this.$entityService.getFolderPath(this.conceptIri);
      this.pathItems = folderPath.map((iriRef: TTIriRef) => {
        return { label: iriRef.name, to: iriToUrl(iriRef["@id"]) };
      });
      if (this.pathItems.length > 2) {
        const filteredOutPathItems = this.pathItems.splice(1, this.pathItems.length - 2);
        this.pathItems.splice(this.pathItems.length - 1, 0, {
          label: "...",
          to: this.$route.fullPath,
          command: () => {
            this.openPathOverlaymenu(event);
          }
        });
        this.pathOptions = filteredOutPathItems;
      }
    },

    setBackForwardDisables() {
      this.canGoForward = window.history.length === window.history.state.position + 1;
      this.canGoBack = window.history.state.position === 0;
    }
  }
});
</script>

<style scoped>
.breadcrumb-container {
  padding: 1rem 1rem 0 1rem;
}

.padding-container {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  overflow: a;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: left;
}

.header-button-group {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: right;
}

.go-forward:disabled,
.go-back:disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

.p-breadcrumb {
  border: none;
  padding: 0;
  margin: 0;
  background-color: #f8f9fa;
}
</style>
