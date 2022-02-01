export interface ChartTableNode {
  key: string;
  type: string;
  data: any;
}

export interface ChartMapNode {
  key: string;
  type: string;
  data: { label: string };
  children: any[];
}
