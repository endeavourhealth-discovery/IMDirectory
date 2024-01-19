import { BugReport } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";
import { Workflow } from "@im-library/interfaces";

const api = Env.VITE_NODE_API;

const WorkflowService = {
  async createBugReport(bugReport: BugReport): Promise<any> {
    return axios.post(api + "node_api/workflow/createBugReport", bugReport);
  },

  async getWorkflowByCreatedBy(): Promise<Workflow[]> {
    return axios.get(api + "node_api/workflow/createdByWorkflows");
  },

  async getWorkflowByAssignedTo(): Promise<Workflow[]> {
    return axios.get(api + "node_api/workflow/assignedToWorkflows");
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(WorkflowService);

export default WorkflowService;
