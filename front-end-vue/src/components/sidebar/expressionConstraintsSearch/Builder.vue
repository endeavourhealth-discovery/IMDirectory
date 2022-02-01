<template>
  <Dialog
    :visible="showDialog"
    :modal="true"
    :closable="false"
    :maximizable="true"
    :style="{
      minWidth: '80vw',
      minHeight: '80vh',
      display: 'flex',
      flexFlow: 'column nowrap'
    }"
    id="builder-dialog"
    :contentStyle="{ flexGrow: '100' }"
  >
    <template #header>
      <h3>ECL Builder:</h3>
    </template>
    <div id="query-builder-container">
      <div id="query-build">
        <template v-for="item in queryBuild" :key="item.id">
          <component
            :is="item.component"
            :value="item.value"
            :id="item.id"
            :position="item.position"
            :last="queryBuild.length - 2 <= item.position ? true : false"
            @deleteClicked="deleteItem"
            @addClicked="addItem"
            @updateClicked="updateItem"
            @addNextOptionsClicked="addNextOptions"
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
          icon="far fa-copy"
          v-tooltip.left="'Copy to clipboard'"
          v-clipboard:copy="copyToClipboard()"
          v-clipboard:success="onCopy"
          v-clipboard:error="onCopyError"
        />
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
import Logic from "@/components/sidebar/expressionConstraintsSearch/Logic.vue";
import RefinementGroup from "@/components/sidebar/expressionConstraintsSearch/RefinementGroup.vue";
import FocusConcept from "@/components/sidebar/expressionConstraintsSearch/FocusConcept.vue";
import AddNext from "@/components/sidebar/expressionConstraintsSearch/AddNext.vue";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";
import LoggerService from "@/services/LoggerService";
import { ComponentDetails } from "@/models/ecl/ComponentDetails";
import { NextComponentSummary } from "@/models/ecl/NextComponentSummary";
import { byPosition } from "@/helpers/Sorters";

export default defineComponent({
  name: "Builder",
  components: {
    Logic,
    RefinementGroup,
    FocusConcept,
    AddNext
  },
  props: { showDialog: Boolean },
  emits: {
    ECLSubmitted: (payload: string) => true,
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
    this.queryBuild = this.setStartBuild();
  },
  data() {
    return {
      queryString: "",
      queryBuild: [] as ComponentDetails[]
    };
  },
  methods: {
    submit(): void {
      this.$emit("ECLSubmitted", this.queryString);
    },

    closeBuilderDialog(): void {
      this.$emit("closeDialog");
    },

    async addNextOptions(data: NextComponentSummary): Promise<void> {
      const nextOptionsComponent = this.getNextOptions(data.previousPosition, data.previousComponentType, data.parentGroup);
      if (this.queryBuild[data.previousPosition + 1].type === ECLType.ADD_NEXT) {
        this.queryBuild[data.previousPosition + 1] = nextOptionsComponent;
      } else {
        this.queryBuild.splice(data.previousPosition + 1, 0, nextOptionsComponent);
      }
      this.updatePositions();
      await this.$nextTick();
      const itemToScrollTo = document.getElementById(nextOptionsComponent.id);
      itemToScrollTo?.scrollIntoView();
    },

    addItem(data: { selectedType: ECLType; position: number }): void {
      const newComponent = this.generateNewComponent(data.selectedType, data.position);
      if (!newComponent) return;
      this.queryBuild[data.position] = newComponent;
      if (this.queryBuild[this.queryBuild.length - 1].type !== ECLType.ADD_NEXT) {
        this.queryBuild.push(this.getNextOptions(this.queryBuild.length - 1, this.queryBuild[this.queryBuild.length - 1].type, undefined));
      }
      this.updatePositions();
    },

    generateQueryString(): void {
      this.queryString = this.queryBuild
        .map(item => {
          if (item.type === ECLType.LOGIC) {
            return item.label + "\n";
          } else {
            return item.label;
          }
        })
        .join(" ")
        .replace(/\n +/g, "\n");
    },

    deleteItem(data: ComponentDetails): void {
      const index = this.queryBuild.findIndex(item => item.position === data.position);
      this.queryBuild.splice(index, 1);
      if (data.position === 0) {
        this.queryBuild.unshift(this.setStartBuild()[0]);
      }
      if (index < this.queryBuild.length - 1 && this.queryBuild[index].type === ECLType.ADD_NEXT) {
        this.queryBuild[index] = this.getNextOptions(index - 1, this.queryBuild[index - 1].type, undefined);
      }
      if (this.queryBuild[this.queryBuild.length - 1].type !== ECLType.ADD_NEXT) {
        this.queryBuild.push(this.getNextOptions(this.queryBuild.length - 1, this.queryBuild[this.queryBuild.length - 1].type, undefined));
      } else {
        this.queryBuild[this.queryBuild.length - 1] = this.getNextOptions(
          this.queryBuild.length - 2,
          this.queryBuild[this.queryBuild.length - 2].type,
          undefined
        );
      }
      this.updatePositions();
    },

    updateItem(data: ComponentDetails): void {
      const index = this.queryBuild.findIndex(item => item.position === data.position);
      this.queryBuild[index] = data;
    },

    getNextOptions(position: number, previous: ECLType, group: ECLType | undefined): ComponentDetails {
      return {
        id: "addNext" + "_" + (position + 1),
        value: {
          previousPosition: position,
          previousComponentType: previous,
          parentGroup: group
        },
        position: position + 1,
        type: ECLType.ADD_NEXT,
        label: "",
        component: ECLComponent.ADD_NEXT
      };
    },

    generateNewComponent(type: ECLType, position: number): ComponentDetails | undefined {
      let result;
      switch (type) {
        case ECLType.LOGIC:
          result = {
            id: ECLType.LOGIC + "_" + position,
            value: null,
            position: position,
            type: ECLType.LOGIC,
            label: "",
            component: ECLComponent.LOGIC
          };
          break;
        case ECLType.REFINEMENT_GROUP:
          result = {
            id: ECLType.REFINEMENT_GROUP + "_" + position,
            value: null,
            position: position,
            type: ECLType.REFINEMENT_GROUP,
            label: "",
            component: ECLComponent.REFINEMENT_GROUP
          };
          break;
        case ECLType.FOCUS_CONCEPT:
          result = {
            id: ECLType.FOCUS_CONCEPT + "_" + position,
            value: null,
            position: position,
            type: ECLType.FOCUS_CONCEPT,
            label: "",
            component: ECLComponent.FOCUS_CONCEPT
          };
          break;
        default:
          break;
      }
      return result;
    },

    setStartBuild(): ComponentDetails[] {
      return [
        {
          component: ECLComponent.FOCUS_CONCEPT,
          id: ECLType.FOCUS_CONCEPT + "_" + 0,
          value: null,
          position: 0,
          type: ECLType.FOCUS_CONCEPT,
          label: ""
        },
        {
          id: ECLType.ADD_NEXT + "_" + 1,
          value: {
            previousPosition: 0,
            previousComponentType: ECLType.FOCUS_CONCEPT,
            parentGroup: undefined
          },
          position: 1,
          type: ECLType.ADD_NEXT,
          label: "",
          component: ECLComponent.ADD_NEXT
        }
      ];
    },

    updatePositions(): void {
      this.queryBuild.forEach((item: ComponentDetails, index: number) => {
        item.position = index;
      });
    },

    copyToClipboard(): string {
      return this.queryString;
    },

    onCopy(): void {
      this.$toast.add(LoggerService.success("Value copied to clipboard"));
    },

    onCopyError(): void {
      this.$toast.add(LoggerService.error("Failed to copy value to clipboard"));
    }
  }
});
</script>

<style scoped>
#query-builder-container {
  width: 100%;
  height: calc(100% - 10rem - 2rem);
}

#query-build {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 1rem;
  margin: 0 0 1rem 0;
  max-height: calc(100% - 2rem);
  overflow: auto;
}

#query-build ::v-deep(.focus-concept-container) {
  flex-basis: 100%;
}

#query-build ::v-deep(.refinement-container) {
  flex-basis: 100%;
}

#query-build ::v-deep(.logic-container) {
  flex-basis: 100%;
}

#query-build ::v-deep(.add-next-container) {
  flex-basis: 100%;
}

#query-build ::v-deep(.refinement-group-container) {
  flex-basis: 100%;
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
  height: 10rem;
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
  height: calc(100% - 1.75rem - 1.5rem);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
</style>
