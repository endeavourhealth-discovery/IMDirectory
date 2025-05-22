<template>
  <div class="task-viewer">
    <div class="field">
      <label for="createdBy">Created by</label>
      <InputText
        v-model="createdBy"
        :disabled="!editMode || !isAdmin"
        :class="{ 'p-invalid': createdByErrorMessage }"
        @blur="showErrorMessages.createdBy = true"
      ></InputText>
    </div>
    <div class="field">
      <label for="createdBy">Type</label>
      <Select
        v-model="taskType"
        :disabled="!editMode || !isAdmin"
        :options="taskTypeOptions"
        :class="{ 'p-invalid': taskTypeErrorMessage }"
        @blur="showErrorMessages.taskType = true"
      ></Select>
    </div>
    <div class="field">
      <label for="state">State</label>
      <Select
        v-model="state"
        :options="stateOptions"
        :disabled="!editMode || !isAdmin"
        :class="{ 'p-invalid': stateErrorMessage }"
        @blur="showErrorMessages.state = true"
      ></Select>
    </div>
    <div v-if="isAdmin" class="field">
      <label for="assignedTo">Assigned to</label>
      <Select
        v-model="assignedTo"
        :options="assignedToOptions"
        :disabled="!editMode || !isAdmin"
        :class="{ 'p-invalid': assignedToErrorMessage }"
        @blur="showErrorMessages.assignedTo = true"
      ></Select>
    </div>
    <div class="field">
      <label for="dateCreated">Date created</label>
      <DatePicker v-model="dateCreated" :disabled="!editMode || !isAdmin" dateFormat="dd/mm/yy" showTime hourFormat="24"> </DatePicker>
    </div>
    <div class="field">
      <label for="history">History</label>
      <div>
        <Button label="Show history" @click="showHistory = true" />
      </div>
      <TaskHistoryDialog v-model:show-dialog="showHistory" :task-history="history"></TaskHistoryDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Task, TaskHistory, TaskState, TaskType } from "@/interfaces/AutoGen";
import WorkflowService from "@/services/WorkflowService";
import { useUserStore } from "@/stores/userStore";
import { computed, onMounted, ref, Ref, watch } from "vue";
import TaskHistoryDialog from "@/components/workflow/TaskHistoryDialog.vue";
import AdminService from "@/services/AdminService";

interface Props {
  id: string;
  editMode?: boolean;
  submitRequested: boolean;
}

const props = withDefaults(defineProps<Props>(), { editMode: false });

watch(
  () => props.submitRequested,
  newValue => {
    if (newValue && isValidTask.value)
      emit("updatedTask", {
        id: { iri: props.id },
        createdBy: createdBy.value,
        type: taskType.value,
        state: state.value,
        assignedTo: assignedTo.value,
        dateCreated: dateCreated.value,
        history: history.value
      });
  }
);

const emit = defineEmits<{
  updatedTask: [payload: Task];
}>();

const isValidTask = computed(
  () =>
    !createdByErrorMessage.value && !taskTypeErrorMessage.value && !stateErrorMessage.value && !assignedToErrorMessage.value && !dateCreatedErrorMessage.value
);

const userStore = useUserStore();
const isAdmin = computed(() => userStore.isAdmin);

const task: Ref<Task | undefined> = ref();
const loading = ref(true);
const showHistory = ref(false);

const createdBy = ref("");
const createdByErrorMessage = ref("");
watch(createdBy, newValue => {
  if (!newValue) createdByErrorMessage.value = "Required field";
  else createdByErrorMessage.value = "";
});

const taskType: Ref<TaskType | undefined> = ref();
const taskTypeErrorMessage = ref("");
const taskTypeOptions: Ref<TaskType[]> = ref([]);
watch(taskType, newValue => {
  if (!newValue) taskTypeErrorMessage.value = "Required field";
  else taskTypeErrorMessage.value = "";
});

const state: Ref<TaskState | undefined> = ref();
const stateErrorMessage = ref("");
const stateOptions: Ref<TaskState[]> = ref([]);
watch(state, newValue => {
  if (!newValue) stateErrorMessage.value = "Required field";
  else stateErrorMessage.value = "";
});

const assignedTo = ref("");
const assignedToErrorMessage = ref("");
const assignedToOptions: Ref<string[]> = ref(["UNASSIGNED"]);
watch(assignedTo, newValue => {
  if (!newValue) assignedToErrorMessage.value = "Required field";
  else assignedToErrorMessage.value = "";
});

const dateCreated: Ref<Date | undefined> = ref();
const dateCreatedErrorMessage = ref("");
watch(dateCreated, newValue => {
  if (!newValue) dateCreatedErrorMessage.value = "Required field";
  else dateCreatedErrorMessage.value = "";
});

const history: Ref<TaskHistory[]> = ref([]);

const showErrorMessages = ref({ createdBy: false, taskType: false, state: false, assignedTo: false });

onMounted(async () => {
  loading.value = true;
  task.value = await WorkflowService.getTask(props.id);
  await setOptions();
  setValuesFromTask(task.value);
  loading.value = false;
});

async function setOptions() {
  taskTypeOptions.value = [TaskType.BUG_REPORT, TaskType.ENTITY_APPROVAL, TaskType.ROLE_REQUEST];
  stateOptions.value = [
    TaskState.APPROVED,
    TaskState.CANCELLED,
    TaskState.COMPLETE,
    TaskState.IN_PROGRESS,
    TaskState.REJECTED,
    TaskState.TODO,
    TaskState.UNDER_REVIEW
  ];
  assignedToOptions.value = await AdminService.getUsersInGroup("IMAdmin");
}

function setValuesFromTask(task: Task) {
  if (task.assignedTo) assignedTo.value = task.assignedTo;
  if (task.createdBy) createdBy.value = task.createdBy;
  if (task.dateCreated) dateCreated.value = new Date(task.dateCreated);
  if (task.history) history.value = task.history;
  if (task.state) state.value = task.state;
  if (task.type) taskType.value = task.type;
}
</script>

<style scoped>
.task-viewer {
  width: 100%;
  overflow: auto;
}

.field {
  display: flex;
  flex-flow: column nowrap;
}

.text-area {
  height: 5rem;
}
.title {
  font-size: 2rem;
}

.other-container {
  display: flex;
  flex-flow: column nowrap;
  margin-left: 2rem;
  padding-top: 0.25rem;
}

.error-indented {
  margin-left: 2rem;
}
</style>
