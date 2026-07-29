<template>
  <div id="entity-approval-content">
    <h2>{{ props.id }}</h2>
    <Card class="entity-approval-card">
      <template #content>
        <div v-if="loading"><ProgressSpinner /></div>
        <div v-else class="entity-approval">
          <TaskViewer :id="id" :editMode="editMode" :submitRequested="submitRequested" @updateTask="updateTask" />
          <div class="field">
            <label for="approvalType">Approval type</label>
            <Select
              v-model="selectedApprovalType"
              :options="approvalTypeOptions"
              :class="{ 'p-invalid': approvalTypeErrorMessage }"
              :disabled="true"
              @blur="showErrorMessages.role = true"
            />
            <small v-if="showErrorMessages.role && approvalTypeErrorMessage" class="p-error">{{ approvalTypeErrorMessage }}</small>
          </div>
          <div class="flex gap-1">
            <Button v-if="selectedApprovalType === ApprovalType.EDIT" label="View original entity" @click="openOriginalEntityDialog" />
            <Button v-if="selectedApprovalType === ApprovalType.EDIT" label="View diff" @click="openDiffViewerDialog" />
            <Button label="View draft entity" @click="openDraftEntityDialog" />
          </div>
          <div class="flex gap-1">
            <Button v-if="canEdit && !editMode" label="Edit" @click="editMode = true" />
            <Button v-if="editMode" label="Cancel" @click="cancelEdit" severity="secondary" />
            <Button v-if="editMode" @click="updateEntityApproval" :loading="loading" label="Update" />
            <Button v-if="isAdmin || isAssignee" label="Reject" severity="danger" @click="rejectEntityApproval" />
            <Button v-if="isAdmin || isAssignee" label="Approve" @click="approveEntityApproval" severity="success" />
          </div>
        </div>
      </template>
    </Card>
    <EntityDiffDialog :draftEntity="draftEntity" :originalEntity="originalEntity" v-model="showDiffDialog" />
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, onMounted, ref, watch } from "vue";

import { ApprovalType } from "@endeavour/vue-library/enums";
import { type EntityApproval, EntityApprovalSchema, type Task } from "@endeavour/vue-library/models";
import { useUserStore } from "@endeavour/vue-library/stores";

import { useConfirm } from "primevue/useconfirm";

import { useEditorEntity } from "@/composables/useEditorEntity";
import { EditorMode } from "@/enums";
import WorkflowService from "@/services/WorkflowService";
import { useDialogStore } from "@/stores/dialogStore";

import AlertDialog from "../shared/dynamicDialogs/AlertDialog.vue";
import EntityDiffDialog from "./EntityDiffDialog.vue";
import TaskViewer from "./TaskViewer.vue";

interface Props {
  id: string;
}

const props = defineProps<Props>();

const dialogStore = useDialogStore();
const userStore = useUserStore();
const confirm = useConfirm();

const currentUser = computed(() => userStore.currentUser);
const canEdit = computed(() => currentUser.value?.username === entityApproval.value?.createdBy);
const isAdmin = computed(() => userStore.isAdmin);
const isValidEntityApproval = computed(() => !approvalTypeErrorMessage.value);
const isAssignee = computed(() => entityApproval.value?.assignedTo === currentUser.value?.username);

const entityApproval: Ref<EntityApproval | undefined> = ref();
const editMode = ref(false);
const submitRequested = ref(false);
const loading = ref(true);
const showErrorMessages = ref({ role: false });
const originalEntity = ref();
const draftEntity = ref();
const showDiffDialog = ref(false);
const showOriginalEntityDialog = ref(false);
const showDraftEntityDialog = ref(false);

onMounted(async () => {
  loading.value = true;
  entityApproval.value = await WorkflowService.getEntityApproval(props.id);
  if (entityApproval.value) setValuesFromEntityApproval(entityApproval.value);
  await setOptions();
  await getEntity();
  loading.value = false;
});

const selectedApprovalType: Ref<ApprovalType | undefined> = ref();
const approvalTypeErrorMessage = ref("");
const approvalTypeOptions: Ref<ApprovalType[]> = ref([]);
watch(selectedApprovalType, newValue => {
  if (!newValue) approvalTypeErrorMessage.value = "Required field";
  else approvalTypeErrorMessage.value = "";
});

async function setOptions() {
  approvalTypeOptions.value = [ApprovalType.CREATE, ApprovalType.EDIT];
}

async function getEntity() {
  if (entityApproval.value?.approvalType === ApprovalType.EDIT && entityApproval.value?.entityIri) {
    const { editorEntity } = useEditorEntity(EditorMode.EDIT, () => {});
    originalEntity.value = { ...editorEntity.value };
  }
}

function setValuesFromEntityApproval(entityApproval: EntityApproval) {
  if (entityApproval.approvalType) selectedApprovalType.value = entityApproval.approvalType;
}

function updateEntityApproval() {
  submitRequested.value = true;
}

async function updateTask(task: Task) {
  if (isValidEntityApproval.value) {
    confirm.require({
      message: "Are you sure you want to update this entity approval?",
      header: "Confirm update",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true
      },
      acceptProps: {
        label: "Update"
      },
      accept: async () => {
        const updatedEntityApproval = EntityApprovalSchema.parse({
          id: { iri: props.id },
          approvalType: selectedApprovalType.value,
          createdBy: task.createdBy,
          type: task.type,
          state: task.state,
          assignedTo: task.assignedTo,
          dateCreated: task.dateCreated,
          history: task.history,
          hostUrl: window.location.origin
        });
        await WorkflowService.updateEntityApproval(updatedEntityApproval).then(async () => {
          await dialogStore.open(AlertDialog, {
            props: { modal: true, style: { width: "30vw" } },
            data: {
              icon: "fa-regular fa-circle-check",
              title: "Success",
              text: "Entity approval successfully updated."
            }
          });
        });

        editMode.value = false;
      }
    });
    submitRequested.value = false;
  }
}

function cancelEdit() {
  if (entityApproval.value) setValuesFromEntityApproval(entityApproval.value);
  editMode.value = false;
}

async function approveEntityApproval() {
  if (entityApproval.value) await WorkflowService.approveEntityApproval(entityApproval.value);
}

async function rejectEntityApproval() {
  if (entityApproval.value) await WorkflowService.rejectEntityApproval(entityApproval.value);
}

function openDiffViewerDialog() {
  showDiffDialog.value = true;
}

function openOriginalEntityDialog() {
  showOriginalEntityDialog.value = true;
}

function openDraftEntityDialog() {
  showDraftEntityDialog.value = true;
}
</script>

<style scoped>
#entity-approval-content {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding: 1rem;
}

.topbar-content {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.entity-approval-card {
  width: 80%;
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
