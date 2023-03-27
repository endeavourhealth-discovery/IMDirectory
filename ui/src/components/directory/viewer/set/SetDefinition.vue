<template>
  <div class="set-definition-wrapper">
    <div class="details-container">
      <ArrayObjectNamesToStringWithLabel v-if="isContainedIn" label="Contained in" :data="isContainedIn" :show="true" />
      <ArrayObjectNamesToStringWithLabel v-if="subsetOf" label="Subset of" :data="subsetOf" :show="true" />
      <ArrayObjectNamesToStringWithLabel v-if="subclassOf" label="Subclass of" :data="subclassOf" :show="true" />
    </div>

    <Accordion multiple v-model:activeIndex="active">
      <AccordionTab header="Subsets">
        <div class="set-accordion-content" id="set-definition-container">
          <SubsetDisplay :conceptIri="props.conceptIri" />
        </div>
      </AccordionTab>
      <AccordionTab>
        <template #header>
          <div class="definition-header">
            <span>Definition</span>
            <Button
              icon="pi pi-copy"
              severity="secondary"
              class="p-button-outlined concept-button"
              v-tooltip.top="'Copy definition'"
              data-testid="copy-definition-button"
              @click="onCopy"
            />
          </div>
        </template>
        <div class="set-accordion-content" id="set-definition-container">
          <QuerySetDefinition :conceptIri="props.conceptIri" />
        </div>
      </AccordionTab>
      <AccordionTab header="Direct Members">
        <div class="set-accordion-content" id="members-container">
          <Members :conceptIri="props.conceptIri" />
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import Members from "./Members.vue";
import SubsetDisplay from "./SubsetDisplay.vue";
import { onMounted, ref } from "@vue/runtime-core";
import { EntityService } from "@/services";
import { IM, RDFS } from "@im-library/vocabulary";
import QuerySetDefinition from "@/components/shared/query/QuerySetDefinition.vue";
import ArrayObjectNamesToStringWithLabel from "@/components/shared/generics/ArrayObjectNamesToStringWithLabel.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@im-library/models";
import { ToastSeverity } from "@im-library/enums";

const props = defineProps({ conceptIri: { type: String, required: true } });
const toast = useToast();
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

async function onCopy(event: any) {
  event.stopPropagation();
  const entity = await EntityService.getPartialEntity(props.conceptIri, [IM.DEFINITION]);
  if (isObjectHasKeys(entity, [IM.DEFINITION])) {
    await navigator.clipboard.writeText(entity[IM.DEFINITION]);
    toast.add(new ToastOptions(ToastSeverity.SUCCESS, "Definition copied to clipboard"));
  }
}
</script>

<style scoped>
.details-container {
  padding-bottom: 1rem;
}
.set-accordion-content {
  height: 100%;
}

.set-definition-wrapper {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}

.definition-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
}

.concept-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
}
</style>
