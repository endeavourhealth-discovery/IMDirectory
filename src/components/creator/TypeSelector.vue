<template>
  <Dialog :visible="showTypeSelector" :modal="true" :closable="false" :close-on-escape="false">
    <div class="type-selector">
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
      </div>
      <div v-else class="header-content-container">
        <span class="text">Select entity type:</span>
        <div class="type-buttons-container">
          <button v-for="(option, idx) in typeOptions" class="custom-button" @click="typeSelected(option)" v-bind:key="idx">
            <span>{{ option.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, inject } from "vue";
import { EntityService } from "@/services";
import { RDF } from "@/vocabulary";
import injectionKeys from "@/injectionKeys/injectionKeys";
import editorShapes from "@/constants/editorShapes";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";
import { EntityReferenceNode } from "@/interfaces/AutoGen";

interface Props {
  showTypeSelector?: boolean;
  updateShowTypeSelector: (value: boolean) => void;
}
const props = withDefaults(defineProps<Props>(), {
  showTypeSelector: false
});

const entityUpdate = inject(injectionKeys.editorEntity)?.updateEntity;

let loading = ref(false);
let typeOptions: Ref<EntityReferenceNode[]> = ref([]);

onMounted(async () => {
  await setOptions();
});

async function setOptions() {
  loading.value = true;
  const entityTypes = await EntityService.getEntityChildren("http://endhealth.info/im#EntityTypes");
  typeOptions.value = entityTypes.filter(entityType => editorShapes.some(shape => shape.targetShape?.iri === entityType.iri));
  loading.value = false;
}

function typeSelected(data: EntityReferenceNode) {
  const result: TTEntity = {};
  result[RDF.TYPE] = [{ iri: data.iri, name: data.name }];
  if (entityUpdate) entityUpdate(result);
  props.updateShowTypeSelector(false);
}
</script>

<style scoped>
.type-selector {
  width: 100%;
  height: 100%;
}

.header-content-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.type-buttons-container {
  width: 80%;
  flex: 0 1 auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.text {
  font-size: large;
  padding: 0 0 1rem 0;
}

.custom-button {
  display: flex;
  font-family: "Lato", sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: #bb3f3f;
  color: #fff;
  line-height: 42px;
  padding: 0 1rem;
  border: none;
}

.custom-button span {
  flex: 1 1 auto;
  display: block;
  width: 100%;
  height: 100%;
}
.custom-button:before,
.custom-button:after {
  position: absolute;
  content: "";
  height: 0%;
  width: 2px;
  background: #bb3f3f;
}
.custom-button:before {
  right: 0;
  top: 0;
  transition: all 500ms ease;
}
.custom-button:after {
  left: 0;
  bottom: 0;
  transition: all 500ms ease;
}
.custom-button:hover {
  color: #bb3f3f;
  background: transparent;
}
.custom-button:hover:before {
  transition: all 500ms ease;
  height: 100%;
}
.custom-button:hover:after {
  transition: all 500ms ease;
  height: 100%;
}
.custom-button span:before,
.custom-button span:after {
  position: absolute;
  content: "";
  background: #bb3f3f;
}
.custom-button span:before {
  left: 0;
  top: 0;
  width: 0%;
  height: 2px;
  transition: all 500ms ease;
}
.custom-button span:after {
  right: 0;
  bottom: 0;
  width: 0%;
  height: 2px;
  transition: all 500ms ease;
}
.custom-button span:hover:before {
  width: 100%;
}
.custom-button span:hover:after {
  width: 100%;
}
</style>
