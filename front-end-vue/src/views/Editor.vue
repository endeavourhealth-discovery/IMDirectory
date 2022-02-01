<template>
  <SideNav />
  <ConfirmDialog></ConfirmDialog>
  <div id="editor-main-container">
    <Panel header="Editor">
      <TabView v-model:activeIndex="active">
        <TabPanel header="Form">
          <div class="panel-content" id="form-editor-container" :style="contentHeight">
            <FormEditor
              v-if="active === 0 && Object.keys(conceptUpdated).length > 0"
              :iri="iri"
              :updatedConcept="conceptUpdated"
              @concept-updated="updateConcept"
            />
          </div>
        </TabPanel>
        <TabPanel v-if="hasMembers" header="Members">
          <div class="panel-content" id="member-editor-container" :style="contentHeight">
            <MemberEditor
              v-if="active === 2 && Object.keys(membersUpdated).length > 0"
              :iri="iri"
              :contentHeight="contentHeight"
              :updatedMembers="membersUpdated"
              @members-updated="updateMembers"
            />
          </div>
        </TabPanel>
      </TabView>
    </Panel>
    <div class="button-bar p-d-flex p-flex-row p-jc-end" id="editor-button-bar">
      <Button icon="pi pi-times" label="Cancel" class="p-button-secondary" @click="$router.go(-1)" />
      <Button icon="pi pi-refresh" label="Reset" class="p-button-warning" @click="refreshEditor" />
      <Button icon="pi pi-check" label="Save" class="save-button" @click="submit" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SideNav from "@/components/home/SideNav.vue";
import FormEditor from "@/components/edit/FormEditor.vue";
import EntityService from "@/services/EntityService";
import ConfirmDialog from "primevue/confirmdialog";
import MemberEditor from "@/components/edit/MemberEditor.vue";
import { IM } from "@/vocabulary/IM";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export default defineComponent({
  name: "Editor",
  components: {
    SideNav,
    ConfirmDialog,
    FormEditor,
    MemberEditor
  },
  beforeRouteLeave(to, from, next) {
    if (this.checkForChanges()) {
      this.$confirm.require({
        message: "All unsaved changes will be lost. Are you sure you want to proceed?",
        header: "Confirmation",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          next();
        }
      });
    } else {
      next();
    }
  },
  computed: {
    hasMembers(): any {
      return isObjectHasKeys(this.membersOriginal);
    }
  },
  data() {
    return {
      iri: this.$route.params.iri?.toString(),
      concept: {} as any,
      conceptOriginal: {} as any,
      conceptUpdated: {} as any,
      membersOriginal: {} as any,
      membersUpdated: {} as any,
      active: 0,
      contentHeight: ""
    };
  },
  async mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.setContentHeight);
    });
    this.fetchConceptData();

    this.setContentHeight();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.setContentHeight);
  },
  methods: {
    async fetchConceptData(): Promise<void> {
      if (this.iri) {
        // const entityReturn = await EntityService.getEntity(this.iri);
        // if (entityReturn) this.concept = entityReturn;

        const dtoReturn = await EntityService.getEntityDefinitionDto(this.iri);
        if (dtoReturn) {
          this.conceptOriginal = dtoReturn;
          this.conceptUpdated = JSON.parse(JSON.stringify(dtoReturn));
        }

        // if (this.hasMembers) {
        const membersReturn = await EntityService.getEntityMembers(this.iri, false, false);
        if (membersReturn) {
          this.membersOriginal = membersReturn;
          this.membersUpdated = JSON.parse(JSON.stringify(membersReturn));
        }
        // }
      }
    },

    submit(): void {
      console.log("submit");
    },

    updateMembers(data: any) {
      this.membersUpdated = data;
    },

    updateConcept(data: any) {
      this.conceptUpdated = data;
    },

    checkForChanges() {
      if (
        JSON.stringify(this.membersUpdated) === JSON.stringify(this.membersOriginal) &&
        JSON.stringify(this.conceptUpdated) === JSON.stringify(this.conceptOriginal)
      ) {
        return false;
      } else {
        return true;
      }
    },

    refreshEditor(): void {
      this.conceptUpdated = {};
      this.membersUpdated = {};
    },

    setContentHeight(): void {
      const container = document.getElementById("editor-main-container") as HTMLElement;
      const header = container.getElementsByClassName("p-panel-header")[0] as HTMLElement;
      const nav = container.getElementsByClassName("p-tabview-nav")[0] as HTMLElement;
      const buttonBar = container.getElementsByClassName("button-bar")[0] as HTMLElement;
      const content = container.getElementsByClassName("p-panel-content")[0] as HTMLElement;
      const currentFontSize = parseFloat(window.getComputedStyle(document.documentElement, null).getPropertyValue("font-size"));
      if (container && header && nav && currentFontSize && buttonBar && content) {
        header.style.border = "none";
        header.style.borderBottom = "1px solid #dee2e6";
        content.style.border = "none";
        content.style.paddingBottom = "0";
        const height =
          container.getBoundingClientRect().height -
          header.getBoundingClientRect().height -
          nav.getBoundingClientRect().height -
          buttonBar.getBoundingClientRect().height -
          currentFontSize * 3 -
          2;
        this.contentHeight = "height: " + height + "px;";
      }
    }
  }
});
</script>

<style scoped>
#editor-main-container {
  margin: 1rem;
  height: calc(100vh - 2rem);
  width: 100%;
  overflow-y: auto;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
}

.placeholder {
  height: 100%;
}

#editor-button-bar {
  padding: 0 2rem 1rem 0;
  gap: 0.5rem;
}
</style>
