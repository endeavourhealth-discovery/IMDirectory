import { BugReport } from "@im-library/interfaces";
import Env from "./Env";
import axios from "axios";

const api = Env.VITE_NODE_API;

const WorkflowService = {
  async createBugReport(bugReport: BugReport): Promise<any> {
    return axios.post(api + "node_api/workflow/createBugReport", bugReport);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(WorkflowService);

export default WorkflowService;
