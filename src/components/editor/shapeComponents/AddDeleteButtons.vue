<template>
  <div class="switch-button-container">
    <div class="buttons-container">
      <Button v-if="show?.minus" data-testid="delete-button" icon="fa-solid fa-trash" severity="danger" @click="deleteClicked" />
      <Button v-if="show?.plus" data-testid="add-button" icon="fa-solid fa-plus" label="Add" severity="success" @click="addNextClicked" />
    </div>
    <Menu ref="optionsMenu" :model="menuOptions" :popup="true" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, watch } from "vue";
import { ComponentType } from "@/enums";
import { cloneDeep } from "lodash-es";
import { MenuItem } from "primevue/menuitem";

interface Props {
  position?: number;
  show?: { minus: boolean; plus: boolean };
  options: { type: ComponentType; name: string }[];
}

const props = withDefaults(defineProps<Props>(), {
  show: { minus: true, plus: true } as any
});

const emit = defineEmits<{
  addNextClicked: [payload: { type: ComponentType; name: string } | undefined];
  deleteClicked: [];
}>();

let menuOptions: Ref<MenuItem[]> = ref([]);
let selected: Ref<{ type: ComponentType; name: string } | undefined> = ref();

const optionsMenu = ref();

watch(
  () => cloneDeep(selected.value),
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

function addNextClicked(event: MouseEvent) {
  if (props.options?.length === 1) {
    selected.value = props.options[0];
  } else {
    optionsMenu.value.toggle(event);
  }
}

function deleteClicked() {
  emit("deleteClicked");
}

function setMenuOptions() {
  menuOptions.value = [];
  for (const item of props.options) {
    menuOptions.value.push({
      label: item.name,
      command: option => {
        selected.value = props.options.find(item => item.name === option.item.label);
      }
    });
  }
}
</script>

<style scoped>
.switch-button-container {
  flex: 0 0 auto;
  height: 100%;
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
