<template>
  <div class="text-html-with-label-container" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <span v-if="!data" class="text-html-container">None</span>
    <div v-else class="text-html-container" v-html="convertedText" :id="id" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextHTMLWithLabel",
  props: {
    label: { type: String },
    data: { type: String },
    size: { type: String },
    id: { type: String }
  },
  mounted() {
    this.init();
  },
  data() {
    return {
      convertedText: ""
    };
  },
  methods: {
    init() {
      let text = "";
      if (!this.id) {
        return;
      } else if (this.data) {
        text = this.data;
        if (text.startsWith("<p>")) {
          text = text.slice(3);
        }
        if (this.data.endsWith("<p>")) {
          text = text.slice(0, -3);
        }
        text = text.replace(/<p>/g, "</p><p class='" + this.id + "-p'>");
        text = text.replace(/\n/g, "</p><p class='" + this.id + "-p'>");
        this.convertedText = "<p class='" + this.id + "-p'>" + text + "</p>";
      }
    }
  }
});
</script>

<style scoped>
.text-html-with-label-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  padding: 0.25rem 0.5rem 0 0;
}

.label {
  padding-right: 0.5rem;
}

.text-html-with-label-container ::v-deep(p) {
  margin: 0 0 0 0;
}
</style>
