<template>
  <div class="parent-header-container">
    <div class="title-buttons-container">
      <div class="title-container">
        <h4 class="title">
          <IMFontAwesomeIcon :icon="getIcon(concept)" :style="getColour(concept)" :key="concept['@id']" class="p-mx-1 type-icon" />
          <span>{{ concept["http://www.w3.org/2000/01/rdf-schema#label"] || "Favourites" }}</span>
        </h4>
      </div>
      <div class="concept-buttons-container">
        <ActionButtons
          :buttons="hasQueryDefinition ? ['runQuery', 'findInTree', 'view', 'edit', 'favourite'] : ['findInTree', 'view', 'edit', 'favourite']"
          :iri="concept['@id']"
          :type="'conceptButton'"
        />
      </div>
    </div>
    <TextWithLabel label="Iri" :data="concept['@id']" :show="concept['@id'] ? true : false" />
    <TextWithLabel label="Code" :data="concept['http://endhealth.info/im#code']" :show="concept['http://endhealth.info/im#code'] ? true : false" />
    <div class="flex flex-row justify-content-start">
      <ArrayObjectNameTagWithLabel
        label="Status"
        :data="concept['http://endhealth.info/im#status']"
        :show="concept['http://endhealth.info/im#status'] ? true : false"
      />
      <ArrayObjectNamesToStringWithLabel
        label="Types"
        :data="concept['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']"
        :show="concept['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] ? true : false"
      />
    </div>

    <TextHTMLWithLabel
      label="Description"
      :data="concept['http://www.w3.org/2000/01/rdf-schema#comment']"
      :show="concept['http://www.w3.org/2000/01/rdf-schema#comment'] ? true : false"
    />
  </div>
</template>

<script setup lang="ts">
import TextHTMLWithLabel from "@/components/shared/generics/TextHTMLWithLabel.vue";
import ArrayObjectNamesToStringWithLabel from "@/components/shared/generics/ArrayObjectNamesToStringWithLabel.vue";
import ArrayObjectNameTagWithLabel from "@/components/shared/generics/ArrayObjectNameTagWithLabel.vue";
import ActionButtons from "@/components/shared/ActionButtons.vue";
import TextWithLabel from "@/components/shared/generics/TextWithLabel.vue";
import IMFontAwesomeIcon from "../shared/IMFontAwesomeIcon.vue";
import { IM, RDF } from "@im-library/vocabulary";
import { getColourFromType, getFAIconFromType, isQuery, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { computed, Ref, watch, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const store = useStore();
const props = defineProps({ concept: { type: Object as any, required: true } });
const conceptIri = computed(() => store.state.conceptIri);
const hasQueryDefinition: Ref<boolean> = ref(false);

onMounted(async () => {
  hasQueryDefinition.value = await getHasQueryDefinition();
});

watch(conceptIri, async () => {
  hasQueryDefinition.value = await getHasQueryDefinition();
});

async function getHasQueryDefinition() {
  const entity = await EntityService.getPartialEntity(conceptIri.value, [RDF.TYPE, IM.DEFINITION]);
  const hasDefinition = isObjectHasKeys(entity, [RDF.TYPE, IM.DEFINITION]);
  const isQueryOrSet = isQuery(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE]);
  return hasDefinition && isQueryOrSet;
}

function getIcon(concept: any) {
  if (concept["@id"] === IM.NAMESPACE + "Favourites") return ["fa-solid", "star"];
  return getFAIconFromType(concept[RDF.TYPE]);
}

function getColour(concept: any) {
  return "color: " + getColourFromType(concept[RDF.TYPE]);
}
</script>

<style scoped>
.parent-header-container {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding: 0.5rem;
  gap: 0.5rem;
}

.title-container {
  display: flex;
  flex-flow: column;
  justify-content: center;
}

.title-buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
}

.title {
  padding: 0;
  margin: 0;
}

.type-icon {
  padding-right: 0.5rem;
}

.concept-buttons-container {
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}
</style>
