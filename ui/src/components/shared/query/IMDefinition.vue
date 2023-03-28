<template>
  <template v-if="type == 'clause'">
    <div class="pathTo mb10">
      <span class="ml10"> {{ data?.select?.entityType?.name }} </span>
      <NodeIcon class="ml10 arrow-right" strokewidth="3" width="14" height="14" icon="arrow_right"></NodeIcon>
      <span class="ml10"> {{ definition?.pathTo[0]?.name }} </span>
      <NodeIcon class="ml10 arrow-right" strokewidth="3" width="14" height="14" icon="arrow_right"></NodeIcon>
      <div class="ml10">{{ definition?.entityType?.name }}</div>
    </div>
    <div class="mb10" v-if="definition?.property">
      <span class="ml10"> Any entry:</span>
      <div class="properties ml10">
        <Property class="ml10" v-for="prop in definition?.property" :key="prop['@id']" :modelValue="prop"> </Property>
      </div>
    </div>
    <div v-if="definition?.orderLimit && definition?.testProperty">
      <span class="ml10">
        First {{ definition?.orderLimit?.count == 1 ? "" : definition?.orderLimit?.count }} {{ definition?.orderLimit?.count > 1 ? "entries" : "entry" }} after
        sorting by {{ definition?.orderLimit?.direction?.toLowerCase() }} {{ definition?.orderLimit?.orderBy?.name }}:
      </span>
      <div class="properties ml10">
        <Property class="ml10" v-for="prop in definition?.testProperty" :key="prop['@id']" :modelValue="prop"> </Property>
      </div>
    </div>
  </template>
  <template v-if="type == 'property'">
    <div class="pathTo">
      <span class="ml10"> {{ data?.select?.entityType?.name }} </span>
      <Property class="ml10" :modelValue="definition"> </Property>
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NodeIcon from "./NodeIcon.vue";
import Property from "./Property.vue";
import _ from "lodash";

export default defineComponent({
  name: "IMDefinition",
  props: ["type", "data", "path"],
  components: { NodeIcon, Property },

  data() {
    return {
      definition: _.get(this.data, this.path)
    };
  }
});
</script>

<style scoped></style>

<style>
.pathTo {
  display: flex;
}
.properties {
  display: flex;
  flex-direction: column;
}

.inSet {
  display: flex;
}

.ml20 {
  margin-left: 20px;
}
.mb10 {
  margin-bottom: 10px;
}
.ml10 {
  margin-left: 10px;
}
.arrow-right {
  margin-top: 4px;
  margin-left: 5px;
  min-width: 14px;
  min-height: 14px;
  color: var(--blue-500);
}
</style>
