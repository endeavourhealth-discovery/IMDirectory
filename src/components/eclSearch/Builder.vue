<template>
  <Dialog
    :visible="showDialog"
    :modal="true"
    :closable="false"
    :maximizable="true"
    :style="{
      minWidth: '90vw',
      minHeight: '90vh',
      display: 'flex',
      flexFlow: 'column nowrap'
    }"
    id="ecl-builder-dialog"
    :contentStyle="{ flexGrow: '100', display: 'flex' }"
  >
    <template #header>
      <h3>ECL Builder:</h3>
    </template>
    <div id="builder-string-container">
      <div id="query-builder-container">
        <div id="query-build">
          <template v-for="item of queryBuild" :key="item.id">
            <component
              :is="item.type"
              :value="item.value"
              :id="item.id"
              :position="item.position"
              :showButtons="item.showButtons"
              @deleteClicked="deleteItem"
              @addClicked="addItem"
              @updateClicked="updateItem"
              @addNextOptionsClicked="addItem"
            >
            </component>
          </template>
        </div>
      </div>
      <div id="build-string-container">
        <h3>Output:</h3>
        <div class="string-copy-container">
          <pre class="output-string">{{ queryString }}</pre>
          <Button
            icon="fa-solid fa-copy"
            v-tooltip.left="'Copy to clipboard'"
            v-clipboard:copy="copyToClipboard()"
            v-clipboard:success="onCopy"
            v-clipboard:error="onCopyError"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-secondary" @click="closeBuilderDialog" />
      <Button label="OK" icon="pi pi-check" class="p-button-primary" @click="submit" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Logic from "@/components/eclSearch/builder/Logic.vue";
import RefinementGroup from "@/components/eclSearch/builder/RefinementGroup.vue";
import FocusConcept from "@/components/eclSearch/builder/FocusConcept.vue";
import { Enums, Helpers } from "im-library";
import { ECLComponentDetails } from "im-library/dist/types/interfaces/Interfaces";
const {
  Sorters: { byPosition },
  EclSearchBuilderMethods: { generateNewComponent, addItem, updateItem, updatePositions }
} = Helpers;
const { ECLComponent } = Enums;

export default defineComponent({
  name: "Builder",
  components: {
    Logic,
    RefinementGroup,
    FocusConcept
  },
  props: { showDialog: Boolean },
  emits: {
    ECLSubmitted: (_payload: string) => true,
    closeDialog: () => true
  },
  watch: {
    queryBuild: {
      handler() {
        this.queryBuild.sort(byPosition);
        this.generateQueryString();
      },
      deep: true
    }
  },
  mounted() {
    this.setStartBuild();
  },
  data() {
    return {
      queryString: "",
      queryBuild: [] as ECLComponentDetails[]
    };
  },
  methods: {
    submit(): void {
      this.$emit("ECLSubmitted", this.queryString);
    },

    closeBuilderDialog(): void {
      this.$emit("closeDialog");
    },

    addItem(data: { selectedType: Enums.ECLComponent; position: number; value: any }): void {
      if (data.selectedType === ECLComponent.LOGIC) {
        data.value = { data: data.value, parentGroup: ECLComponent.BUILDER };
      }
      addItem(data, this.queryBuild, { minus: true, plus: true });
    },

    generateQueryString(): void {
      this.queryString = this.queryBuild
        .map(item => {
          if (item.type === ECLComponent.LOGIC) {
            return item.queryString + "\n";
          } else {
            return item.queryString;
          }
        })
        .join(" ")
        .replace(/\n +/g, "\n");
    },

    deleteItem(data: ECLComponentDetails): void {
      const index = this.queryBuild.findIndex(item => item.position === data.position);
      this.queryBuild.splice(index, 1);
      const length = this.queryBuild.length;
      if (length === 0) {
        this.setStartBuild();
        return;
      }
      updatePositions(this.queryBuild);
    },

    updateItem(data: ECLComponentDetails): void {
      updateItem(data, this.queryBuild);
    },

    setStartBuild(): void {
      this.queryBuild = [];
      this.queryBuild.push(generateNewComponent(ECLComponent.FOCUS_CONCEPT, 0, null, { minus: false, plus: true }));
    },

    copyToClipboard(): string {
      return this.queryString;
    },

    onCopy(): void {
      this.$toast.add(this.$loggerService.success("Value copied to clipboard"));
    },

    onCopyError(): void {
      this.$toast.add(this.$loggerService.error("Failed to copy value to clipboard"));
    }
  }
});
</script>

<style scoped>
#builder-string-container {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
}

#query-builder-container {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
}

#query-build {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;
  gap: 1rem;
  flex: 1 1 auto;
  overflow: auto;
}

#next-option-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  min-height: 2rem;
}

#build-string-container {
  width: 100%;
  flex: 0 1 auto;
  display: flex;
  flex-flow: column nowrap;
}

.output-string {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 3px;
  padding: 1rem;
  margin: 0;
  height: 100%;
  flex-grow: 100;
  overflow-y: auto;
  tab-size: 4;
}

.string-copy-container {
  height: 10rem;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
</style>
