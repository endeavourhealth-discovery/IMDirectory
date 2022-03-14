<template>
  <div v-if="hasData" id="axioms-container" :style="{ width: size }">
    <div class="head-container">
      <strong class="label">{{ label }}</strong>
      <span v-if="getCount()">&nbsp;({{ getCount() }})</span>
      <Button
        :icon="buttonExpanded ? 'pi pi-minus' : 'pi pi-plus'"
        class="p-button-rounded p-button-text p-button-primary p-button-sm expand-button"
        :id="'expand-button-' + label"
        @click="setButtonExpanded()"
        v-styleclass="{
          selector: '.tgl-' + label,
          enterClass: 'hidden',
          enterActiveClass: 'my-fadein',
          leaveActiveClass: 'my-fadeout',
          leaveToClass: 'hidden'
        }"
      />
    </div>
    <div v-html="definition" :class="'hidden text-definition tgl-' + label"></div>
    <div class="loading-container" v-if="loading">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { mapState } from "vuex";
import ConfigService from "@/services/ConfigService";
import { PartialEntity, TTBundle } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
const {
  DataTypeCheckers: { isObjectHasKeys, isArrayHasLength },
  Transforms: { bundleToText }
} = Helpers;

export default defineComponent({
  name: "TextDefinition",
  props: {
    label: { type: String },
    data: {
      type: Object as () => PartialEntity,
      default: () => null
    },
    size: { type: String },
    show: { type: Boolean }
  },
  computed: {
    hasData(): boolean {
      if (isObjectHasKeys(this.data, ["entity", "predicates"]) && isObjectHasKeys(this.data.entity)) {
        return true;
      } else {
        return false;
      }
    },
    ...mapState(["blockedIris"])
  },
  async mounted() {
    await this.init();
  },
  data() {
    return {
      buttonExpanded: false,
      count: 0,
      definition: "",
      loading: false
    };
  },
  methods: {
    async init(): Promise<void> {
      this.loading = true;
      await this.getDefinition();
      this.loading = false;
      await this.$nextTick();
      if (this.label === "Definition") {
        const button = document.getElementById(`expand-button-${this.label}`) as HTMLElement;
        if (button) button.click();
      }
    },

    setButtonExpanded(): void {
      this.buttonExpanded = !this.buttonExpanded;
    },

    async getDefinition(): Promise<void> {
      if (!this.hasData) return;
      const defaults = await ConfigService.getDefaultPredicateNames();
      this.definition = bundleToText("/viewer", this.data as TTBundle, defaults, 0, true, this.blockedIris);
    },

    getCount(): number {
      let count = 0;
      Object.keys(this.data.entity).forEach(key => {
        if (isArrayHasLength((this.data.entity as any)[key])) {
          count += (this.data.entity as any)[key].length;
        } else {
          count++;
        }
      });
      return count;
    }
  }
});
</script>

<style scoped>
.loading-container {
  height: 100%;
  widows: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.text-definition {
  border: 1px solid #dee2e6;
  border-radius: 3px;
  padding: 0.5rem;
  margin: 0.5rem 0 0 0;
  overflow: auto;
  white-space: break-spaces;
}

.head-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

@keyframes my-fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes my-fadeout {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.my-fadein {
  animation: my-fadein 150ms linear;
}

.my-fadeout {
  animation: my-fadeout 150ms linear;
}
</style>
