<template>
  <div class="focus-concept-container" :id="id">
      <div v-if="focusConceptBuild && focusConceptBuild.length" class="focus-concept-children-container">
        <template v-for="child of focusConceptBuild" :key="child.id">
          <component
            :is="child.type"
            :value="child.value"
            :id="child.id"
            :position="child.position"
            :showButtons="child.showButtons"
            @updateClicked="updateChild"
          >
          </component>
        </template>
      </div>
      <AddDeleteButtons
        :show="showButtons"
        :position="position"
        :options="getButtonOptions()"
        @deleteClicked="deleteClicked"
        @addNextClicked="addNextClicked"
      />
    </div>
</template>

<script lang="ts">
export default defineComponent({
  components: { Expression, Constraint }
});
</script>

<script setup lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref, watch } from "vue";
import Expression from "./Expression.vue";
import Constraint from "./Constraint.vue";
import AddDeleteButtons from "../AddDeleteButtons.vue";
import { ECLComponent } from "@im-library/enums";
import { DataTypeCheckers, Sorters, EclSearchBuilderMethods } from "@im-library/helpers";
import { ECLComponentDetails } from "@im-library/interfaces";
const { isArrayHasLength, isObjectHasKeys } = DataTypeCheckers;
const { byPosition } = Sorters;
const { generateNewComponent } = EclSearchBuilderMethods;

const props = defineProps({
  id: { type: String, required: true },
  position: { type: Number, required: true },
  value: {
    type: Object as PropType<{
      children: ECLComponentDetails[];
    }>,
    required: false
  },
  showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
});

const emit = defineEmits({
  addNextOptionsClicked: (_payload: any) => true,
  deleteClicked: (_payload: ECLComponentDetails) => true,
  updateClicked: (_payload: ECLComponentDetails) => true,
  addClicked: (_payload: any) => true
});

const focusConceptBuild: Ref<ECLComponentDetails[]> = ref([]);

watch(focusConceptBuild, newValue => {
  newValue.sort(byPosition);
  emit("updateClicked", createFocusConcept());
});

onMounted(() => setStartBuild());

function deleteClicked(): void {
  emit("deleteClicked", createFocusConcept());
}

function updateChild(data: any): void {
  const index = focusConceptBuild.value.findIndex(item => item.position === data.position);
  focusConceptBuild.value[index] = data;
}

function createFocusConcept(): ECLComponentDetails {
  return {
    id: props.id,
    value: {
      children: focusConceptBuild.value
    },
    position: props.position,
    type: ECLComponent.FOCUS_CONCEPT,
    queryString: generateFocusConceptQueryString(),
    showButtons: props.showButtons
  };
}

function generateFocusConceptQueryString(): string {
  let queryString = "";
  if (focusConceptBuild.value.length && focusConceptBuild.value.every(item => typeof item.queryString === "string")) {
    const queryStrings = focusConceptBuild.value.map(item => item.queryString);
    queryString = queryStrings.join(" ").replace("/\n /g", "\n").trim();
  }
  return queryString;
}

function setStartBuild(): void {
  if (props.value && isObjectHasKeys(props.value, ["children"]) && isArrayHasLength(props.value.children)) {
    focusConceptBuild.value = [...props.value.children];
  } else {
    focusConceptBuild.value = [];
    focusConceptBuild.value.push(generateNewComponent(ECLComponent.CONSTRAINT, 0, null, { minus: false, plus: false }));
    focusConceptBuild.value.push(generateNewComponent(ECLComponent.EXPRESSION, 1, null, { minus: false, plus: false }));
  }
}

function addNextClicked(item: any): void {
  emit("addNextOptionsClicked", { position: props.position + 1, selectedType: item });
}

function getButtonOptions() {
  return [ECLComponent.LOGIC, ECLComponent.REFINEMENT_GROUP];
}
</script>

<style scoped>
.focus-concept-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.focus-concept-children-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
}

</style>
