<template>
  <div class="refinement-container" :id="id">
    <div class="switch-button-container"></div>
    <div class="refinement-children-next-container">
      <span class="float-text">Refinement</span>
      <div v-if="refinementBuild && refinementBuild.length" class="refinement-children-container">
        <template v-for="child in refinementBuild" :key="child.id">
          <component
            :is="child.type"
            :value="child.value"
            :id="child.id"
            :position="child.position"
            :showButtons="child.showButtons"
            @updateClicked="updateChild"
          />
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
  </div>
</template>

<script lang="ts">
export default defineComponent({
  components: { Expression, Constraint, Operator }
});
</script>

<script setup lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref, watch } from "vue";
import Expression from "@/components/eclSearch/builder/Expression.vue";
import Constraint from "@/components/eclSearch/builder/Constraint.vue";
import Operator from "@/components/eclSearch/builder/Operator.vue";
import AddDeleteButtons from "@/components/eclSearch/AddDeleteButtons.vue";
import { ECLComponentDetails } from "@/im_library/interfaces";
import { ECLComponent } from "@/im_library/enums";
import { DataTypeCheckers, Sorters, EclSearchBuilderMethods } from "@/im_library/helpers";
const { isArrayHasLength, isObjectHasKeys } = DataTypeCheckers;
const { byPosition } = Sorters;
const { addItem, updateItem, updatePositions, generateNewComponent } = EclSearchBuilderMethods;

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
  updateClicked: (_payload: ECLComponentDetails) => true
});

const refinementBuild: Ref<ECLComponentDetails[]> = ref([]);

watch(refinementBuild, () => {
  refinementBuild.value.sort(byPosition);
  emit("updateClicked", createRefinement());
});

onMounted(() => setStartBuild());

function deleteClicked(): void {
  emit("deleteClicked", createRefinement());
}

function updateChild(data: ECLComponentDetails): void {
  updateItem(data, refinementBuild.value);
}

function addNextClicked(item: any): void {
  emit("addNextOptionsClicked", {
    position: props.position + 1,
    selectedType: item
  });
}

function createRefinement(): ECLComponentDetails {
  return {
    id: props.id,
    value: {
      children: refinementBuild.value
    },
    position: props.position,
    type: ECLComponent.REFINEMENT,
    queryString: generateRefinementQueryString(),
    showButtons: props.showButtons
  };
}

function generateRefinementQueryString(): string {
  let queryString = "";
  if (isArrayHasLength(refinementBuild.value) && refinementBuild.value.every(item => typeof item.queryString === "string")) {
    const queryStrings = refinementBuild.value.map(item => item.queryString);
    queryString = queryStrings.join(" ").replace("/\n /g", "\n").replace("/  /g", " ").trim();
  }
  return queryString;
}

function setStartBuild(): void {
  if (props.value && isObjectHasKeys(props.value, ["children"]) && isArrayHasLength(props.value.children)) {
    refinementBuild.value = [...props.value.children];
  } else {
    refinementBuild.value = [
      generateNewComponent(ECLComponent.CONSTRAINT, 0, null, { minus: false, plus: false }),
      generateNewComponent(ECLComponent.EXPRESSION, 1, null, { minus: false, plus: false }),
      generateNewComponent(ECLComponent.OPERATOR, 2, null, { minus: false, plus: false }),
      generateNewComponent(ECLComponent.CONSTRAINT, 3, null, { minus: false, plus: false }),
      generateNewComponent(ECLComponent.EXPRESSION, 4, null, { minus: false, plus: false })
    ];
  }
}

function getButtonOptions() {
  return [ECLComponent.LOGIC];
}
</script>

<style scoped>
.refinement-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}

.add-refinement-button {
  border-style: dashed !important;
}

.switch-button-container {
  order: 2;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.switch-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
}

.refinement-children-next-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  gap: 1rem;
}

.refinement-children-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid #56a902;
  border-radius: 3px;
  padding: 1rem;
  gap: 1rem;
}

.buttons-container {
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  gap: 0.5rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
