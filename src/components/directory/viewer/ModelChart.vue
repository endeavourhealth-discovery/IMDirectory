<template>
  <div class="loading-container" v-if="loading">
    <ProgressSpinner />
  </div>
  <pre class="mermaid"
    >{{ builderString }}
</pre>
</template>

<script setup lang="ts">
import { Ref, nextTick, onMounted, ref } from "vue";

import mermaid from "mermaid";

import { PropertyDisplay } from "@/models";
import { DataModelService } from "@/services";

const props = defineProps<{
  entityIri: string;
  entityName: string;
}>();

const emit = defineEmits<{
  expandWidth: [payload: boolean];
}>();

const diagramString = ref("");
const builderString = ref("");
const loading = ref(true);

const properties: Ref<PropertyDisplay[]> = ref([]);

onMounted(async () => {
  loading.value = true;
  await buildString();
  mermaid.initialize({ startOnLoad: false });
  await nextTick();
  await mermaid.run();
  loading.value = false;
});

async function getDataModelProps(iri: string): Promise<void> {
  const results = await DataModelService.getPropertiesDisplay(iri);
  if (results && results.length !== 0) {
    results.forEach((result: PropertyDisplay) => {
      result.property[0].name = result.property[0].name?.slice(0, result.property[0].name?.indexOf("(")).replace(/\W/g, "").toUpperCase() as string;
      if (result.isNode) properties.value.push(result);
    });
    let expand = false;
    if (properties.value.length > 12) expand = true;
    emit("expandWidth", expand);
  }
}

async function buildString() {
  const entityNameTitle = props.entityName.replace(/\W/g, "").toUpperCase();
  diagramString.value = "erDiagram\n";
  await getDataModelProps(props.entityIri);
  for (let property of properties.value) {
    diagramString.value = diagramString.value + " " + entityNameTitle;
    if (property.cardinality && property.reverseCardinality) addCardinality(property.cardinality, property.reverseCardinality);
    const typeName = property
      .type![0].name!.replace(/\w+/g, function (w: string) {
        return w[0].toUpperCase() + w.slice(1).toLowerCase();
      })
      .replace(/\W/g, "");

    diagramString.value = diagramString.value + property.property[0].name!.toUpperCase().replace(" ", "") + " : " + typeName;
  }

  builderString.value = diagramString.value;
}

function addCardinality(cardinality: string, reverseCardinality: string) {
  let left;
  let id = "..";
  let right;
  if (cardinality === "0 : 1") right = "o|";
  else if (cardinality === "1 : 1") {
    right = "||";
    id = "--";
  } else if (cardinality === "0 : *") right = "o{";
  else right = "|{";

  if (reverseCardinality === "0 : 1") left = "|o";
  else if (reverseCardinality === "1 : 1") {
    left = "||";
    id = "--";
  } else if (reverseCardinality === "0 : *") left = "}o";
  else left = "}|";

  diagramString.value = diagramString.value + " " + left + id + right + " ";
}
</script>

<style scoped>
.mermaid {
  width: 100%;
}

.loading-container {
  height: 20rem;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  flex: 0 0 100%;
}
</style>
