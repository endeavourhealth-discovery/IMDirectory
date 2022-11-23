export default interface TangledTreeData {
  id: string;
  parents?: TangledTreeData[];
  name: string;
  type: string;
  cardinality?: string
}