export interface InstanceTreeItem {
  key: number;
  label: string;
  data?: any;
  type?: string;
  children: InstanceTreeItem[];
}
