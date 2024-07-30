<template>
  <div class="parent-header-container">
    <div class="title-buttons-container">
      <div class="title-container">
        <h2 v-if="!showSelect" class="title">
          <IMFontAwesomeIcon :icon="getIcon(entity)" :style="getColour(entity)" :key="entity['@id']" class="p-mx-1 type-icon" />
          <span>{{ entity[RDFS.LABEL] || "Favourites" }}</span>
        </h2>
        <h2 v-else class="title">
          <IMFontAwesomeIcon :icon="getIcon(entity)" :style="getColour(entity)" :key="entity['@id']" class="p-mx-1 type-icon" />
          <span>{{ entity[RDFS.LABEL] || "Favourites" }}</span>
        </h2>
      </div>
      <div class="entity-buttons-container">
        <ActionButtons
          :buttons="!showSelect ? ['findInTree', 'view', 'edit', 'favourite'] : ['findInTree', 'view', 'addToList']"
          :iri="entity['@id']"
          :type="'entityButton'"
          @locate-in-tree="(iri: string) => emit('locateInTree', iri)"
          @view-hierarchy="(iri: string) => emit('viewHierarchy', iri)"
          @add-to-list="(iri: string) => emit('addToList', iri)"
        />
      </div>
    </div>
    <div class="flex flex-row">
      <TextWithLabel label="Iri" :data="entity['@id']" v-if="!!entity['@id']" />
      <TextWithLabel label="Code" :data="entity[IM.CODE]" v-if="!!entity[IM.CODE]" />
    </div>
    <div class="flex flex-row justify-start">
      <ArrayObjectNameTagWithLabel v-if="!!entity['http://endhealth.info/im#status']" label="Status" :data="entity['http://endhealth.info/im#status']" />
      <ArrayObjectNamesToStringWithLabel
        label="Types"
        :data="entity['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']"
        v-if="!!entity['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']"
      />
    </div>
    <div>
      <TextWithLabel label="Preferred name" :data="entity[IM.PREFERRED_NAME]" v-if="!!entity[IM.PREFERRED_NAME]" />
      <ArrayObjectNamesToStringWithLabel label="Return Type" :data="entity[IM.RETURN_TYPE]" v-if="!!entity[IM.RETURN_TYPE]" />
    </div>

    <TextHTMLWithLabel
      label="Description"
      :data="entity['http://www.w3.org/2000/01/rdf-schema#comment']"
      v-if="!!entity['http://www.w3.org/2000/01/rdf-schema#comment']"
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
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { isQuery, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import { Ref, watch, ref, onMounted } from "vue";
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import _ from "lodash-es";

interface Props {
  entity: any;
  showSelect?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits({
  locateInTree: (_payload: string) => true,
  navigateTo: (_payload: string) => true,
  addToList: (_payload: string) => true,
  viewHierarchy: (_payload: string) => true
});
const hasQueryDefinition: Ref<boolean> = ref(false);

onMounted(async () => {
  if (props.entity && isObjectHasKeys(props.entity, ["@id"])) hasQueryDefinition.value = await getHasQueryDefinition(props.entity["@id"]);
});

watch(
  () => _.cloneDeep(props.entity),
  async () => {
    if (props.entity && isObjectHasKeys(props.entity, ["@id"])) hasQueryDefinition.value = await getHasQueryDefinition(props.entity["@id"]);
  }
);

async function getHasQueryDefinition(entityIri: string) {
  const entity = await EntityService.getPartialEntity(entityIri, [RDF.TYPE, IM.DEFINITION]);
  const hasDefinition = isObjectHasKeys(entity, [RDF.TYPE, IM.DEFINITION]);
  const isQueryOrSet = isQuery(entity[RDF.TYPE]) || isValueSet(entity[RDF.TYPE]);
  return hasDefinition && isQueryOrSet;
}

function getIcon(entity: any) {
  if (entity["@id"] === IM.FAVOURITES) return ["fa-solid", "star"];
  return getFAIconFromType(entity[RDF.TYPE]);
}

function getColour(entity: any) {
  return "color: " + getColourFromType(entity[RDF.TYPE]);
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
  white-space: normal;
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
