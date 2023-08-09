import { WorkflowEnums } from "../enums";

export interface Workflow {
  id: string;
  createdBy: string;
  type: string;
  assignedTo: string;
  state: WorkflowEnums.State;
  dateCreated: Date;
}
