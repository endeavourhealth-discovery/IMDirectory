import { WorkflowEnums } from "../enums";

export interface Workflow {
  id: string;
  createdBy: string;
  type: WorkflowEnums.Type;
  assignedTo: string;
  state: WorkflowEnums.State;
  dateCreated: Date;
}
