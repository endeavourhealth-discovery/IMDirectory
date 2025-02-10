import { BugReport, Task, WorkflowResponse } from "@/interfaces/AutoGen";
import Env from "./Env";
import axios from "axios";

const api = Env.API;

const WorkflowService = {
  async createBugReport(bugReport: BugReport): Promise<any> {
    bugReport.error = JSON.stringify(bugReport.error);
    return axios.post(api + "api/workflow/createBugReport", bugReport);
  },

  async getBugReport(id: string): Promise<BugReport> {
    return axios.get(api + "api/workflow/getBugReport", { params: { id: id } });
  },

  async getTasksByCreatedBy(page?: number, size?: number): Promise<WorkflowResponse> {
    return axios.get(api + "api/workflow/getTasksByCreatedBy", { params: { page: page, size: size } });
  },

  async getTasksByAssignedTo(page?: number, size?: number): Promise<WorkflowResponse> {
    return axios.get(api + "api/workflow/getTasksByAssignedTo", { params: { page: page, size: size } });
  },

  async getUnassignedTasks(page?: number, size?: number): Promise<WorkflowResponse> {
    return axios.get(api + "api/workflow/getUnassignedTasks", { params: { page: page, size: size } });
  },

  async deleteTask(id: string): Promise<void> {
    return axios.delete(api + "api/workflow/deleteTask", { params: { id: id } });
  },

  async updateTask(task: Task): Promise<void> {
    return axios.post(api + "api/workflow/updateTask", task);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(WorkflowService);

export default WorkflowService;
