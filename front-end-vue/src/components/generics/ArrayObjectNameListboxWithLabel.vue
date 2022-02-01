<template>
  <div v-if="isArrayObjectWithName" :style="{ width: size }">
    <div class="head-container">
      <strong class="label">{{ label }}: </strong>
      <span>&nbsp;({{ data.length }})</span>
      <Button
        :icon="buttonExpanded ? 'pi pi-minus' : 'pi pi-plus'"
        class="p-button-rounded p-button-text p-button-primary p-button-sm expand-button"
        :id="'expand-button-' + id"
        @click="setButtonExpanded"
        v-styleclass="{
          selector: '#' + id,
          enterClass: 'p-d-none',
          enterActiveClass: 'my-fadein',
          leaveActiveClass: 'my-fadeout',
          leaveToClass: 'p-d-none'
        }"
      />
    </div>
    <Listbox
      :options="data"
      listStyle="max-height: 12rem;overflow: auto;"
      v-model="selected"
      @change="navigate(selected['@id'])"
      emptyMessage="None"
      :id="id"
      class="array-listbox p-d-none"
    >
      <template #option="slotProps">
        <div class="data-name">
          {{ slotProps.option?.name || slotProps.option?.["@id"] }}
        </div>
      </template>
    </Listbox>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { RouteRecordName } from "node_modules/vue-router/dist/vue-router";
import LoggerService from "@/services/LoggerService";
import { mapState } from "vuex";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export default defineComponent({
  name: "ArrayObjectNameListboxWithLabel",
  props: {
    label: { type: String },
    data: { type: Array as PropType<Array<unknown>> },
    size: { type: String },
    id: { type: String }
  },
  computed: {
    isArrayObjectWithName(): boolean {
      if (!this.data) return false;
      if (!isArrayHasLength(this.data)) return false;
      if (this.data.every(item => isObjectHasKeys(item, ["name"]))) {
        return true;
      } else {
        LoggerService.warn(
          undefined,
          "Data error. Data is not array, array does not contain Object or Object has no property 'name' for use within component ArrayObjectNameListboxWithLabel.vue"
        );
        return false;
      }
    },
    ...mapState(["selectedEntityType"])
  },
  mounted() {
    this.expandAtStartup();
  },
  data() {
    return {
      selected: {} as any,
      buttonExpanded: false
    };
  },
  methods: {
    navigate(iri: string) {
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      if (iri)
        this.$router.push({
          name: currentRoute,
          params: { selectedIri: iri }
        });
    },

    setButtonExpanded() {
      this.buttonExpanded = !this.buttonExpanded;
    },

    expandAtStartup() {
      if (this.selectedEntityType === "Ontology" && this.label === "Is a") {
        const button = document.getElementById(`expand-button-${this.id}`) as HTMLElement;
        if (button) button.click();
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.head-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.array-listbox {
  margin: 0.5rem 0 0 0;
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
