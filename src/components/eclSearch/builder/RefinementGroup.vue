<template>
  <div class="refinement-group-container" :id="id">
    <div class="refinement-group-children-next-container">
      <span class="float-text">Refinement group</span>
      <div class="refinement-group-children-container">
        <template v-for="item in refinementGroupBuild" :key="item.id">
          <component
            :is="item.type"
            :value="item.value"
            :id="item.id"
            :position="item.position"
            :showButtons="item.showButtons"
            @deleteClicked="deleteItem"
            @addClicked="addItemWrapper"
            @updateClicked="updateItemWrapper"
            @addNextOptionsClicked="addItem"
          >
          </component>
        </template>
      </div>
      <div class="switch-button-container">
        <div class="switch-container">
          <label for="switch">Group</label>
          <InputSwitch v-model="group" />
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
  </div>
</template>

<script lang="ts">
export default defineComponent({
  components: { Refinement, Logic }
});
</script>

<script setup lang="ts">
import { defineComponent, onMounted, PropType, Ref, ref, watch } from "vue";
import Refinement from "@/components/eclSearch/builder/Refinement.vue";
import Logic from "@/components/eclSearch/builder/Logic.vue";
import AddDeleteButtons from "@/components/eclSearch/AddDeleteButtons.vue";
import { Enums, Helpers } from "im-library";
import { ECLComponentDetails } from "im-library/dist/types/interfaces/Interfaces";
const { ECLComponent } = Enums;
const {
  DataTypeCheckers: { isArrayHasLength },
  Sorters: { byPosition },
  EclSearchBuilderMethods: { addItem, updateItem, updatePositions, generateNewComponent }
} = Helpers;

const props = defineProps({
  id: { type: String, required: true },
  position: { type: Number, required: true },
  value: {
    type: Object as PropType<{
      children: ECLComponentDetails[];
      group: boolean;
    }>,
    required: false
  },
  showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
});

const emit = defineEmits({
  addNextOptionsClicked: (_payload: any) => true,
  addClicked: (_payload: ECLComponentDetails) => true,
  deleteClicked: (_payload: ECLComponentDetails) => true,
  updateClicked: (_payload: ECLComponentDetails) => true
});

const refinementGroupBuild: Ref<ECLComponentDetails[]> = ref([]);
const group = ref(false);

watch(refinementGroupBuild, newValue => {
  newValue.sort(byPosition);
  emit("updateClicked", createRefinementGroup());
});

watch(group, () => emit("updateClicked", createRefinementGroup()));

onMounted(() => setStartBuild());

function onConfirm(): void {
  emit("addClicked", createRefinementGroup());
}

function deleteClicked(): void {
  emit("deleteClicked", createRefinementGroup());
}

function addNextClicked(item: any): void {
  emit("addNextOptionsClicked", {
    position: props.position + 1,
    selectedType: item
  });
}

function addItemWrapper(data: { selectedType: Enums.ECLComponent; position: number; value: any }): void {
  if (data.selectedType === ECLComponent.LOGIC) {
    data.value = { data: data.value, parentGroup: ECLComponent.REFINEMENT_GROUP };
  }
  addItem(data, refinementGroupBuild.value, { minus: true, plus: true });
}

function deleteItem(data: ECLComponentDetails): void {
  const index = refinementGroupBuild.value.findIndex(child => child.position === data.position);
  refinementGroupBuild.value.splice(index, 1);
  if (refinementGroupBuild.value.length === 0) {
    setStartBuild();
    return;
  }
  updatePositions(refinementGroupBuild.value);
}

function updateItemWrapper(data: ECLComponentDetails): void {
  updateItem(data, refinementGroupBuild.value);
}

function createRefinementGroup(): ECLComponentDetails {
  return {
    id: props.id,
    value: {
      children: refinementGroupBuild.value,
      group: group.value
    },
    position: props.position,
    type: ECLComponent.REFINEMENT_GROUP,
    queryString: generateRefinementGroupQueryString(),
    showButtons: props.showButtons
  };
}

function generateRefinementGroupQueryString(): string {
  let queryString = "";
  if (!isArrayHasLength(refinementGroupBuild.value)) return queryString;
  const queryStrings = refinementGroupBuild.value.map(item => {
    if (item.type === ECLComponent.LOGIC) {
      return item.queryString + "\n\t";
    } else {
      return item.queryString;
    }
  });
  queryString = queryStrings
    .join(" ")
    .trim()
    .replace(/\n\t +/, "\n\t");
  if (group.value) {
    return ":\n\t{" + queryString + "}";
  } else {
    return ":\n\t" + queryString;
  }
}

function setStartBuild(): void {
  if (props.value && props.value.children) {
    refinementGroupBuild.value = [...props.value.children];
  } else {
    refinementGroupBuild.value = [generateNewComponent(ECLComponent.REFINEMENT, 0, null, { minus: false, plus: true })];
  }
}

function getButtonOptions() {
  return [ECLComponent.LOGIC];
}
</script>

<style scoped>
.refinement-group-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
}

.add-refinement-button {
  border-style: dashed !important;
}

.switch-button-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;
  gap: 1rem;
}

.switch-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
}

.refinement-group-children-next-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  gap: 1rem;
}

.refinement-group-children-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  border: 1px solid #d499b9;
  border-radius: 3px;
  padding: 1rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
