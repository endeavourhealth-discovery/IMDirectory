<template>
  <div class="switch-button-container">
    <div class="buttons-container">
      <Button v-if="show?.minus" icon="fa-solid fa-minus" severity="danger" class="p-button-rounded p-button-outlined" @click="deleteClicked" />
      <Button v-if="show?.plus" icon="fa-solid fa-plus" severity="success" class="p-button-rounded p-button-outlined" @click="addNextClicked" />
    </div>
    <Menu ref="optionsMenu" :model="menuOptions" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { ECLComponent } from "@/enums";

interface Props {
  position?: number;
  show?: { minus: boolean; plus: boolean };
  options: ECLComponent[];
}

const props = withDefaults(defineProps<Props>(), {
  show: { minus: true, plus: true } as any
});

const emit = defineEmits({
  addNextClicked: (_payload: ECLComponent) => true,
  deleteClicked: () => true
});

const menuOptions: Ref<any[]> = ref([]);
const selected: Ref<ECLComponent | null> = ref(null);

watch(selected, newValue => {
  if (newValue) emit("addNextClicked", newValue);
});

const optionsMenu = ref();

onMounted(() => setMenuOptions());

function addNextClicked(event: any) {
  optionsMenu.value.toggle(event);
}

function deleteClicked() {
  emit("deleteClicked");
}

function setMenuOptions() {
  for (const item of props.options) {
    menuOptions.value.push({
      label: item,
      command: (option: any) => {
        selected.value = null;
        selected.value = option.item.label;
      }
    });
  }
}
</script>

<style scoped>
.switch-button-container {
  order: 2;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.buttons-container {
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
