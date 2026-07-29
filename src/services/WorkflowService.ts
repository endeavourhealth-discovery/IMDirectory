import {
  type BugReport,
  BugReportSchema,
  type EntityApproval,
  EntityApprovalSchema,
  type NamespaceRequest,
  NamespaceRequestSchema,
  type RoleRequest,
  RoleRequestSchema,
  type Task,
  TaskSchema,
  type WorkflowResponse,
  WorkflowResponseSchema
} from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/workflow/private";

const WorkflowService = {
  async createBugReport(bugReport: BugReport): Promise<void> {
    bugReport.error = JSON.stringify(bugReport.error);
    return await api.post(API_URL + "/createBugReport", bugReport);
  },

  async getBugReport(id: string): Promise<BugReport> {
    const result = await api.get(API_URL + "/getBugReport", { params: { id: id } });
    return BugReportSchema.parse(result);
  },

  async updateBugReport(bugReport: BugReport): Promise<void> {
    return await api.post(API_URL + "/updateBugReport", bugReport);
  },

  async createRoleRequest(roleRequest: RoleRequest): Promise<void> {
    return await api.post(API_URL + "/createRoleRequest", roleRequest);
  },

  async getRoleRequest(id: string): Promise<RoleRequest> {
    const result = await api.get(API_URL + "/roleRequest", { params: { id: id } });
    return RoleRequestSchema.parse(result);
  },

  async updateRoleRequest(roleRequest: RoleRequest): Promise<void> {
    return await api.post(API_URL + "/updateRoleRequest", roleRequest);
  },

  async createNamespaceRequest(roleRequest: NamespaceRequest): Promise<void> {
    return await api.post(API_URL + "/createNamespaceRequest", roleRequest);
  },

  async getNamespaceRequest(id: string): Promise<NamespaceRequest> {
    const result = await api.get(API_URL + "/namespaceRequest", { params: { id: id } });
    return NamespaceRequestSchema.parse(result);
  },

  async updateNamespaceRequest(namespaceRequest: NamespaceRequest): Promise<void> {
    return await api.post(API_URL + "/updateNamespaceRequest", namespaceRequest);
  },

  async createEntityApproval(entityApproval: EntityApproval): Promise<void> {
    return await api.post(API_URL + "/createEntityApproval", entityApproval);
  },

  async getEntityApproval(id: string): Promise<EntityApproval> {
    const result = await api.get(API_URL + "/entityApproval", { params: { id: id } });
    return EntityApprovalSchema.parse(result);
  },

  async updateEntityApproval(entityApproval: EntityApproval): Promise<void> {
    return await api.post(API_URL + "/updateEntityApproval", entityApproval);
  },

  async getTasksByCreatedBy(page?: number, size?: number): Promise<WorkflowResponse> {
    const result = await api.get(API_URL + "/getTasksByCreatedBy", { params: { page: page, size: size } });
    return WorkflowResponseSchema.parse(result);
  },

  async getTasksByAssignedTo(page?: number, size?: number): Promise<WorkflowResponse> {
    const result = await api.get(API_URL + "/getTasksByAssignedTo", { params: { page: page, size: size } });
    return WorkflowResponseSchema.parse(result);
  },

  async getUnassignedTasks(page?: number, size?: number): Promise<WorkflowResponse> {
    const result = await api.get(API_URL + "/getUnassignedTasks", { params: { page: page, size: size } });
    return WorkflowResponseSchema.parse(result);
  },

  async deleteTask(id: string): Promise<void> {
    return await api.delete(API_URL + "/deleteTask", { params: { id: id } });
  },

  async updateTask(task: Task): Promise<void> {
    return await api.post(API_URL + "/updateTask", task);
  },

  async getTask(id: string): Promise<Task> {
    const result = await api.get(API_URL + "/getTask", { params: { id: id } });
    return TaskSchema.parse(result);
  },

  async approveRoleRequest(roleRequest: RoleRequest) {
    return await api.post(API_URL + "/approveRoleRequest", roleRequest);
  },

  async rejectRoleRequest(roleRequest: RoleRequest) {
    return await api.post(API_URL + "/rejectRoleRequest", roleRequest);
  },

  async approveNamespaceRequest(namespaceRequest: NamespaceRequest) {
    return await api.post(API_URL + "/approveNamespaceRequest", namespaceRequest);
  },

  async rejectNamespaceRequest(namespaceRequest: NamespaceRequest) {
    return await api.post(API_URL + "/rejectNamespaceRequest", namespaceRequest);
  },

  async approveEntityApproval(entityApproval: EntityApproval) {
    return await api.post(API_URL + "/approveEntityApproval", entityApproval);
  },

  async rejectEntityApproval(entityApproval: EntityApproval) {
    return await api.post(API_URL + "/rejectEntityApproval", entityApproval);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(WorkflowService);

export default WorkflowService;
