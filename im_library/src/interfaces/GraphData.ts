export default interface GraphData {
  name: string;
  iri: string;
  propertyType: string;
  valueTypeIri: string;
  valueTypeName: string;
  inheritedFromIri: string;
  inheritedFromName: string;
  children: GraphData[];
}
