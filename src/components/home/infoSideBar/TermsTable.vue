<template>
  <div v-if="data && hasData" id="term-codes-container" :style="{ width: size }">
    <div class="head-container">
      <strong class="label">{{ label }}</strong>
      <span>&nbsp;({{ data.length }})</span>
      <Button
        :icon="buttonExpanded ? 'pi pi-minus' : 'pi pi-plus'"
        class="p-button-rounded p-button-text p-button-primary p-button-sm expand-button"
        @click="setButtonExpanded"
        v-styleclass="{
          selector: '#term-codes-table',
          enterClass: 'hidden',
          enterActiveClass: 'my-fadein',
          leaveActiveClass: 'my-fadeout',
          leaveToClass: 'hidden'
        }"
      />
    </div>
    <DataTable :value="data" :paginator="data.length > 5 ? true : false" :rows="5" id="term-codes-table" class="hidden">
      <template #empty> No records found </template>
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

<script setup lang="ts">
import { defineComponent, PropType, ref, Ref, computed } from "vue";
import { TermCode } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
const {
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;

const props = defineProps({
  label: { type: String },
  data: { type: Array as PropType<Array<TermCode>> },
  size: { type: String },
  id: { type: String }
});

const hasData = computed(() => isArrayHasLength(props.data));

const buttonExpanded = ref(false);

function setButtonExpanded(): void {
  buttonExpanded.value = !buttonExpanded.value;
}
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
