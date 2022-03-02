<template>
  <div v-if="hasData" id="term-codes-container" :style="{ width: size }">
    <div class="head-container">
      <strong class="label">{{ label }}</strong>
      <span>&nbsp;({{ data.length }})</span>
      <Button
        :icon="buttonExpanded ? 'pi pi-minus' : 'pi pi-plus'"
        class="p-button-rounded p-button-text p-button-primary p-button-sm expand-button"
        @click="setButtonExpanded"
        v-styleclass="{
          selector: '#term-codes-table',
          enterClass: 'p-d-none',
          enterActiveClass: 'my-fadein',
          leaveActiveClass: 'my-fadeout',
          leaveToClass: 'p-d-none'
        }"
      />
    </div>
    <DataTable :value="data" :paginator="data.length > 5 ? true : false" :rows="5" id="term-codes-table" class="p-d-none">
      <template #empty>
        No records found
      </template>
      <Column field="name" header="Name" :sortable="true">
        <template #body="slotProps">
          <div>
            {{ slotProps.data.name }}
          </div>
        </template>
      </Column>
      <Column field="code" header="Code" :sortable="true">
        <template #body="slotProps">
          <div>
            {{ slotProps.data.code || "None" }}
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { TermCode } from "@/models/terms/TermCode";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";

export default defineComponent({
  name: "TermsTable",
  props: {
    label: { type: String },
    data: { type: Array as PropType<Array<TermCode>> },
    size: { type: String },
    id: { type: String }
  },
  computed: {
    hasData(): boolean {
      return isArrayHasLength(this.data)
    }
  },
  data() {
    return {
      buttonExpanded: false
    };
  },
  methods: {
    setButtonExpanded(): void {
      this.buttonExpanded = !this.buttonExpanded;
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

#term-codes-table {
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
