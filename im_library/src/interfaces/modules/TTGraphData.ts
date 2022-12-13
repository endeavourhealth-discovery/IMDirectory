export default interface TTGraphData {
  name: string;
  iri: string;
  relToParent: string;
  children: TTGraphData[];
  _children: TTGraphData[];
}
