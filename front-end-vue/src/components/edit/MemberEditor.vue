<template>
  <div class="loading-container p-d-flex p-flex-row p-jc-center p-ai-center" v-if="loading">
    <ProgressSpinner />
  </div>
  <PickList
    v-else
    v-model="data"
    dataKey="code"
    :listStyle="listHeight"
    :responsive="false"
    @move-to-target="membersUpdated"
    @move-to-source="membersUpdated"
    @move-all-to-target="membersUpdated"
    @move-all-to-source="membersUpdated"
  >
    <template #sourceHeader>
      Included
    </template>
    <template #targetHeader>
      Excluded
    </template>
    <template #item="slotProps">
      <div class="member-container">
        <p class="member-name">{{ slotProps.item.concept.name }}</p>
      </div>
    </template>
  </PickList>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MemberEditor",
  props: ["iri", "contentHeight", "updatedMembers"],
  emits: { "members-updated": (payload: any) => true },
  watch: {
    contentHeight() {
      this.setListHeight();
    }
  },
  mounted() {
    this.setListHeight();
  },
  data() {
    return {
      members: JSON.parse(JSON.stringify(this.updatedMembers)),
      data: [JSON.parse(JSON.stringify(this.updatedMembers.included)), JSON.parse(JSON.stringify(this.updatedMembers.excluded))] as any,
      listHeight: "",
      loading: false
    };
  },
  methods: {
    setListHeight(): void {
      const container = document.getElementById("member-editor-container") as HTMLElement;
      const pickListHeader = container.getElementsByClassName("p-picklist-header")[0] as HTMLElement;
      if (container && pickListHeader) {
        const optimumHeight = container.getBoundingClientRect().height - pickListHeader.getBoundingClientRect().height - 4;
        this.listHeight = "height: " + optimumHeight + "px; max-height: " + optimumHeight + "px;";
      }
      this.removeOrderButtons();
    },

    removeOrderButtons(): void {
      const container = document.getElementById("member-editor-container") as HTMLElement;
      const sourceOrderButtons = container.getElementsByClassName("p-picklist-source-controls")[0] as HTMLElement;
      const targetOrderButtons = document.getElementsByClassName("p-picklist-target-controls")[0] as HTMLElement;
      if (sourceOrderButtons) {
        sourceOrderButtons.remove();
      }
      if (targetOrderButtons) {
        targetOrderButtons.remove();
      }
    },

    membersUpdated(): void {
      this.$emit("members-updated", {
        included: this.data[0],
        excluded: this.data[1],
        valueSet: this.members.valueSet
      });
    }
  }
});
</script>

<style scoped>
.member-name {
  word-wrap: break-word;
}

.loading-container {
  height: 100%;
}
</style>
