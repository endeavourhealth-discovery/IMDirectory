export interface DisplayQuery {
  key: string;
  label: string;
  data: any;
  type?: string;
  children: DisplayQuery[];
}
