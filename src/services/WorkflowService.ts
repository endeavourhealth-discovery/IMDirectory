import { BugReport, EntityApproval, RoleRequest, Task, WorkflowResponse } from "@/interfaces/AutoGen";
import Env from "./Env";
import axios from "axios";

const api = Env.API + "api/workflow";

const WorkflowService = {
  async createBugReport(bugReport: BugReport): Promise<void> {
    bugReport.error = JSON.stringify(bugReport.error);
    return await axios.post(api + "/createBugReport", bugReport);
  },

  async getBugReport(id: string): Promise<BugReport> {
    return await axios.get(api + "/getBugReport", { params: { id: id } });
  },

  async updateBugReport(bugReport: BugReport): Promise<void> {
    return axios.post(api + "/updateBugReport", bugReport);
  },

  async createRoleRequest(roleRequest: RoleRequest): Promise<void> {
    return axios.post(api + "/createRoleRequest", roleRequest);
  },

  async getRoleRequest(id: string): Promise<RoleRequest> {
    return axios.get(api + "/roleRequest", { params: { id: id } });
  },

  async updateRoleRequest(roleRequest: RoleRequest): Promise<void> {
    return axios.post(api + "/updateRoleRequest", roleRequest);
  },

  async createEntityApproval(entityApproval: EntityApproval): Promise<void> {
    return axios.post(api + "/createEntityApproval", entityApproval);
  },

  async getEntityApproval(id: string): Promise<EntityApproval> {
    return axios.get(api + "/entityApproval", { params: { id: id } });
  },

  async updateEntityApproval(entityApproval: EntityApproval): Promise<void> {
    return axios.post(api + "/updateEntityApproval", entityApproval);
  },

  async getTasksByCreatedBy(page?: number, size?: number): Promise<WorkflowResponse> {
    return await axios.get(api + "/getTasksByCreatedBy", { params: { page: page, size: size } });
  },

  async getTasksByAssignedTo(page?: number, size?: number): Promise<WorkflowResponse> {
    return await axios.get(api + "/getTasksByAssignedTo", { params: { page: page, size: size } });
  },

  async getUnassignedTasks(page?: number, size?: number): Promise<WorkflowResponse> {
    return await axios.get(api + "/getUnassignedTasks", { params: { page: page, size: size } });
  },

  async deleteTask(id: string): Promise<void> {
    return await axios.delete(api + "/deleteTask", { params: { id: id } });
  },

  async updateTask(task: Task): Promise<void> {
    return await axios.post(api + "/updateTask", task);
  },

  async getTask(id: string): Promise<Task> {
    return await axios.get(api + "/getTask", { params: { id: id } });
  },

  async approveRoleRequest(roleRequest: RoleRequest) {
    return await axios.post(api + "/approveRoleRequest", roleRequest);
  },

  async rejectRoleRequest(roleRequest: RoleRequest) {
    return await axios.post(api + "/rejectRoleRequest", roleRequest);
  },

  async approveEntityApproval(entityApproval: EntityApproval) {
    return await axios.post(api + "/approveEntityApproval", entityApproval);
  },

  async rejectEntityApproval(entityApproval: EntityApproval) {
    return await axios.post(api + "/rejectEntityApproval", entityApproval);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(WorkflowService);

export default WorkflowService;
