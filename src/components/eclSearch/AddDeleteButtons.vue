<template>
  <div class="switch-button-container">
    <div class="buttons-container">
      <Button v-if="show.minus" icon="fas fa-minus" class="p-button-rounded p-button-outlined p-button-danger" @click="deleteClicked" />
      <Button v-if="show.plus" icon="fas fa-plus" class="p-button-rounded p-button-outlined p-button-success" @click="addNextClicked" />
    </div>
    <Menu ref="optionsMenu" :model="menuOptions" :popup="true" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { ECLComponent } from "im-library/dist/types/enums/Enums";

export default defineComponent({
  name: "AddDeleteButtons",
  props: {
    position: Number,
    show: { type: Object as PropType<{ minus: Boolean; plus: boolean }>, default: { minus: true, plus: true } },
    options: { type: Array as PropType<Array<ECLComponent>>, required: true }
  },
  emits: {
    addNextClicked: (_payload: ECLComponent) => true,
    deleteClicked: () => true
  },
  watch: {
    selected: {
      handler(newValue) {
        if (newValue) this.$emit("addNextClicked", newValue);
      }
    }
  },
  mounted() {
    this.setMenuOptions();
  },
  data() {
    return {
      menuOptions: [] as any[],
      selected: null as ECLComponent | null
    };
  },
  methods: {
    addNextClicked(event: any) {
      (this.$refs.optionsMenu as any).toggle(event);
    },

    deleteClicked() {
      this.$emit("deleteClicked");
    },

    setMenuOptions() {
      for (const item of this.options) {
        this.menuOptions.push({
          label: item,
          command: (option: any) => {
            this.selected = null;
            this.selected = option.item.label;
          }
        });
      }
    }
  }
});
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
