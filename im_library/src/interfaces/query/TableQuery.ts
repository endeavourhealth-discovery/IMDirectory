export interface TableQuery {
  name: string;
  title: string;
  children: TableQuery[];
}
