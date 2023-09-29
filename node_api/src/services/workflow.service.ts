import WorkflowRepository from "@/repositories/workflowRepository";
import { BugReport } from "@im-library/interfaces";

export default class WorkflowService {
  private workflowRepo: WorkflowRepository;

  constructor() {
    this.workflowRepo = new WorkflowRepository();
  }

  public async getBugReport(iri: string) {
    return this.workflowRepo.getBugReport(iri);
  }

  public async setBugReport(bugReport: BugReport) {
    await this.workflowRepo.setBugReport(bugReport);
  }

  public async generateId() {
    return this.workflowRepo.generateId();
  }

  public async getCreatedByWorkflows(id: string) {
    return this.workflowRepo.getWorkflowsByCreatedBy(id);
  }

  public async getAssignedToWorkflows(id: string) {
    return this.workflowRepo.getWorkflowsByAssignedTo(id);
  }
}
