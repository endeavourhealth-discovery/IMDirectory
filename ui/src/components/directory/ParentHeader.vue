<template>
  <div class="parent-header-container">
    <div class="title-buttons-container">
      <div class="title-container">
        <h4 class="title">
          <IMFontAwesomeIcon :icon="getIcon(entity)" :style="getColour(entity)" :key="entity['@id']" class="p-mx-1 type-icon" />
          <span>{{ entity["http://www.w3.org/2000/01/rdf-schema#label"] || "Favourites" }}</span>
        </h4>
      </div>
      <div class="entity-buttons-container">
        <ActionButtons
          :buttons="hasQueryDefinition ? ['runQuery', 'findInTree', 'view', 'edit', 'favourite'] : ['findInTree', 'view', 'edit', 'favourite']"
          :iri="entity['@id']"
          :type="'entityButton'"
          :locate-in-tree-function="locateInTree"
        />
      </div>
    </div>
    <TextWithLabel label="Iri" :data="entity['@id']" :show="entity['@id'] ? true : false" />
    <TextWithLabel label="Code" :data="entity['http://endhealth.info/im#code']" :show="entity['http://endhealth.info/im#code'] ? true : false" />
    <div class="flex flex-row justify-content-start">
      <ArrayObjectNameTagWithLabel
        label="Status"
        :data="entity['http://endhealth.info/im#status']"
        :show="entity['http://endhealth.info/im#status'] ? true : false"
      />
      <ArrayObjectNamesToStringWithLabel
        label="Types"
        :data="entity['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']"
        :show="entity['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] ? true : false"
      />
    </div>

    <TextHTMLWithLabel
      label="Description"
      :data="entity['http://www.w3.org/2000/01/rdf-schema#comment']"
      :show="entity['http://www.w3.org/2000/01/rdf-schema#comment'] ? true : false"
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
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useDirectoryStore } from "@/stores/directoryStore";
import _ from "lodash";

const directoryStore = useDirectoryStore();
interface Props {
  entity: any;
}
const props = defineProps<Props>();

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
  if (entity["@id"] === IM.NAMESPACE + "Favourites") return ["fa-solid", "star"];
  return getFAIconFromType(entity[RDF.TYPE]);
}

function getColour(entity: any) {
  return "color: " + getColourFromType(entity[RDF.TYPE]);
}

function locateInTree($event: any, iri: string) {
  directoryStore.updateFindInTreeIri(iri);
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
