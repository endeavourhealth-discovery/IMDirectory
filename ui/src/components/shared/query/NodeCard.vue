<template>
  <div :class="'node-card '">
    <div :class="'node-card-header ' + [expanded ? 'expanded' : '']" @click="onClick">
      <NodeIcon :class="`node-icon`" strokewidth="2" width="20" height="20" :icon="icon" />
      <div class="node-card-title" v-html="richTitle()"></div>
      <div v-if="allowExpansion" class="node-chevron">
        <NodeIcon class="icon" strokewidth="2" width="20" height="20" :icon="expanded ? 'chevron_up' : 'chevron_down'" />
      </div>
    </div>
    <div v-if="expanded" class="node-card-body">
      <div v-if="activeTab == 'Prettified' && definition?.pathTo" class="tab-content prettified">
        <IMDefinition type="clause" :data="data" :path="path"> </IMDefinition>
      </div>
      <div v-else-if="activeTab == 'Prettified' && definition?.alias" class="tab-content prettified">
        <IMDefinition type="property" :data="data" :path="path"> </IMDefinition>
      </div>
      <div v-if="activeTab == 'Raw JSON'" class="tab-content json">
        {{ definition }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import IMDefinition from "./IMDefinition.vue";
import NodeIcon from "./NodeIcon.vue";
import jp from "jsonpath";

export default defineComponent({
  name: "NodeCard",
  props: ["icon", "title", "definition", "allowExpansion", "data", "path"],
  components: { NodeIcon, IMDefinition },
  data() {
    return {
      activeTab: "Prettified",
      tabs: [{ label: "Prettified" }, { label: "Raw JSON" }],
      expanded: false
    };
  },
  methods: {
    richTitle() {
      //populates title with hyperlinks to IM Viewer
      let html: string = `<div>${this.title}</div>`;
      const jsonQuery = `$..[?(@.name && @.@id)]`;
      const names = jp.nodes(this.definition, jsonQuery);
      names.forEach((item: any) => {
        const url = `https://dev.endhealth.co.uk/viewer/#/concept/${encodeURIComponent(item?.value["@id"])}`;
        const name = item?.value?.name;
        html = html.replaceAll(name, `<a target="_blank" href="${url}">${name}</a>`);
      });
      return html;
    },
    onClick() {
      this.expanded = !this.expanded;
    }
  }
});
</script>

<style scoped>
.tab-content {
  background-color: var(--surface-a);
  border: 1px solid var(--surface-border);
  border-radius: 5px;
  padding: 6px;
}

.node-card-body .tabs {
  margin-top: 10px;
  margin-left: 30px;
}

.tabs .tab-item {
  font-weight: 500;
  border-radius: 20px;
  padding: 5px 10px;
  /* border-bottom: transparent 2px solid; */
}
.tabs .tab-item.active {
  background-color: var(--blue-500);
  color: var(--surface-a);
}

.node-icon {
  color: var(--blue-500);
  min-height: 20px;
  min-width: 20px;
}
.node-chevron {
  display: flex;
  align-items: center;
  margin-left: 10px;
  color: var(--text-color);
  min-height: 20px;
  min-width: 20px;
}

.node-chevron .icon {
  border: var(--surface-border) 1px solid;
  border-radius: 50%;
  padding: 2px;
}

.node-card {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--surface-border);
  top: -5px;
  margin-bottom: 7px;
  border-radius: 7px;
  padding: 6px 10px 6px 10px;
}

.node-card-header {
  display: inline-flex;
  position: relative;
  width: 100%;
}
.node-card-header.expanded {
  padding-bottom: 10px;
}
.node-card-title {
  margin-left: 10px;
  margin-top: 2px;
  color: var(--text-color);
  font-size: 14px;
  line-height: 16px;
  font-weight: 500;
}

.node-card:hover {
  cursor: pointer;
  box-shadow: 0px 0px 7px var(--black-500);
}
</style>

<style>
.node-card-header a {
  color: var(--blue-500) !important;
  font-weight: 700;
}
.node-card-header a:hover {
  text-decoration: underline !important;
}
</style>
