<template>
  <div class="set-definition-wrapper">
    <div class="details-container">
      <ArrayObjectNamesToStringWithLabel v-if="isContainedIn" label="Contained in" :data="isContainedIn" show="true" />
      <ArrayObjectNamesToStringWithLabel v-if="subsetOf" label="Subset of" :data="subsetOf" show="true" />
      <ArrayObjectNamesToStringWithLabel v-if="subclassOf" label="Subclass of" :data="subclassOf" show="true" />
    </div>

    <Accordion multiple v-model:activeIndex="active">
      <AccordionTab header="Subsets">
        <div class="set-accordion-content" id="set-definition-container">
          <SubsetDisplay :conceptIri="props.conceptIri" />
        </div>
      </AccordionTab>
      <AccordionTab header="Direct Members">
        <div class="set-accordion-content" id="members-container">
          <Members :conceptIri="props.conceptIri" />
        </div>
      </AccordionTab>
      <AccordionTab header="Definition">
        <div class="set-accordion-content" id="set-definition-container">
          <QuerySetDefinition :conceptIri="props.conceptIri" />
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import Members from "./Members.vue";
import SubsetDisplay from "./SubsetDisplay.vue";
import { onMounted, ref } from "@vue/runtime-core";
import { EntityService } from "@/im_library/services";
import { IM, RDFS } from "@/im_library/vocabulary";
import QuerySetDefinition from "@/im_library/components/modules/query/QuerySetDefinition.vue"

const props = defineProps({ conceptIri: { type: String, required: true } });
const subsetOf = ref();
const isContainedIn = ref();
const subclassOf = ref();
const ttentity = ref();
const active = ref([] as number[]);

onMounted(async () => {
  active.value = [0, 1, 2];
  const entity = await EntityService.getPartialEntity(props.conceptIri, [IM.IS_SUBSET_OF, IM.IS_CONTAINED_IN, RDFS.SUBCLASS_OF]);
  ttentity.value = entity;
  if (entity[IM.IS_SUBSET_OF]) {
    subsetOf.value = entity[IM.IS_SUBSET_OF];
  }
  if (entity[IM.IS_CONTAINED_IN]) {
    isContainedIn.value = entity[IM.IS_CONTAINED_IN];
  }
  if (entity[RDFS.SUBCLASS_OF]) {
    subclassOf.value = entity[RDFS.SUBCLASS_OF];
  }
});
</script>

<style scoped>
.details-container {
  padding: 1rem;
}
.set-accordion-content {
  height: 100%;
}

.set-definition-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
</style>
