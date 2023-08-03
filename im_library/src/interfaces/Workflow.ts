export interface Workflow {
  id: string;
  createdBy: string;
  type: string;
  assignedTo: string;
  state: string;
  dateCreated: Date;
}
