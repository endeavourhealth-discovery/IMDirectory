import { BugReport, Task, WorkflowResponse } from "@/interfaces/AutoGen";
import Env from "./Env";
import axios from "axios";

const api = Env.API;

const WorkflowService = {
  async createBugReport(bugReport: BugReport): Promise<void> {
    bugReport.error = JSON.stringify(bugReport.error);
    return await axios.post(api + "api/workflow/createBugReport", bugReport);
  },

  async getBugReport(id: string): Promise<BugReport> {
    return await axios.get(api + "api/workflow/getBugReport", { params: { id: id } });
  },

  async updateBugReport(bugReport: BugReport): Promise<void> {
    return await axios.post(api + "api/workflow/updateBugReport", bugReport);
  },

  async getTasksByCreatedBy(page?: number, size?: number): Promise<WorkflowResponse> {
    return await axios.get(api + "api/workflow/getTasksByCreatedBy", { params: { page: page, size: size } });
  },

  async getTasksByAssignedTo(page?: number, size?: number): Promise<WorkflowResponse> {
    return await axios.get(api + "api/workflow/getTasksByAssignedTo", { params: { page: page, size: size } });
  },

  async getUnassignedTasks(page?: number, size?: number): Promise<WorkflowResponse> {
    return await axios.get(api + "api/workflow/getUnassignedTasks", { params: { page: page, size: size } });
  },

  async deleteTask(id: string): Promise<void> {
    return await axios.delete(api + "api/workflow/deleteTask", { params: { id: id } });
  },

  async updateTask(task: Task): Promise<void> {
    return await axios.post(api + "api/workflow/updateTask", task);
  },

  async getTask(id: string): Promise<Task> {
    return await axios.get(api + "api/workflow/getTask", { params: { id: id } });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(WorkflowService);

export default WorkflowService;
