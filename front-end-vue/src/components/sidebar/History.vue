<template>
  <Listbox v-model="selectedHistoryItem" :options="getHistory()" optionLabel="conceptName" @click="navigate" class="history-listbox">
    <template #option="slotProps">
      <div>
        <span>{{ slotProps.option.conceptName }}</span>
      </div>
    </template>
  </Listbox>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { HistoryItem } from "@/models/HistoryItem";
import { mapState } from "vuex";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export default defineComponent({
  name: "History",
  computed: mapState(["history", "sideNavHierarchyFocus"]),
  data() {
    return {
      selectedHistoryItem: {} as HistoryItem
    };
  },
  methods: {
    getHistory(): HistoryItem[] {
      return this.history.filter((obj: any) => {
        return !!obj.conceptName;
      });
    },

    navigate(): void {
      if (isObjectHasKeys(this.selectedHistoryItem, ["url"])) this.$router.push(this.selectedHistoryItem.url);
    }
  }
});
</script>

<style scoped>
.history-listbox {
  height: 100%;
  overflow: auto;
}
</style>
