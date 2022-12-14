<template>
  <div class="switch-button-container">
    <div class="buttons-container">
      <Button v-if="show.minus" icon="pi pi-times" class="p-button-rounded p-button-danger p-button-text" @click="deleteClicked" />
      <Button v-if="show.plus" icon="pi pi-plus" label="Add" class="p-button-success" @click="addNextClicked" />
    </div>
    <Menu ref="optionsMenu" :model="menuOptions" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref, watch } from "vue";
import { ComponentType } from "@im-library/enums";
import _ from "lodash";

const props = defineProps({
  position: Number,
  show: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } },
  options: { type: Array as PropType<{ type: ComponentType; name: string }[]>, required: true }
});

const emit = defineEmits({
  addNextClicked: (_payload: any) => true,
  deleteClicked: () => true
});

let menuOptions: Ref<any[]> = ref([]);
let selected: Ref<{ type: ComponentType; name: string } | undefined> = ref();

const optionsMenu = ref();

watch(
  () => _.cloneDeep(selected.value),
  newValue => {
    if (newValue) emit("addNextClicked", newValue);
  }
);

watch(
  () => props.options,
  () => {
    setMenuOptions();
  }
);

onMounted(() => {
  setMenuOptions();
});

function addNextClicked(event: any) {
  (optionsMenu.value as any).toggle(event);
}

function deleteClicked() {
  emit("deleteClicked");
}

function setMenuOptions() {
  menuOptions.value = [];
  for (const item of props.options) {
    menuOptions.value.push({
      label: item.name,
      command: (option: any) => {
        selected.value = props.options.find(item => item.name === option.item.label);
      }
    });
  }
}
</script>

<style scoped>
.switch-button-container {
  display: flex;
  align-items: center;
}

.buttons-container {
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
