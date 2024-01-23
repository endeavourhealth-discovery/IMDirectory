import { BugReport, Task } from "@im-library/interfaces/AutoGen";
import Env from "./Env";
import axios from "axios";

const api = Env.API;

const WorkflowService = {
  async createBugReport(bugReport: BugReport): Promise<any> {
    return axios.post(api + "api/workflow/createBugReport", bugReport);
  },

  async getBugReport(id: string): Promise<BugReport> {
    return axios.get(api + "api/workflow/getBugReport", { params: { id: id } });
  },

  async getWorkflowByCreatedBy(): Promise<Task[]> {
    return axios.get(api + "api/workflow/createdByWorkflows");
  },

  async getWorkflowByAssignedTo(): Promise<Task[]> {
    return axios.get(api + "api/workflow/assignedToWorkflows");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(WorkflowService);

export default WorkflowService;
