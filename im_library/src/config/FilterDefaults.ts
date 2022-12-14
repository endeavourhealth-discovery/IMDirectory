import { SortDirection } from "../enums";
import { IM, RDF, RDFS, SHACL } from "../vocabulary";

const FILTER_DEFAULTS = {
  schemeOptions: [IM.NAMESPACE, "http://snomed.info/sct#"],
  statusOptions: [IM.ACTIVE, IM.DRAFT],
  typeOptions: [IM.CONCEPT, IM.VALUE_SET, IM.CONCEPT_SET, SHACL.NODESHAPE, IM.DATAMODEL_PROPERTY, IM.QUERY, RDFS.CLASS, RDF.PROPERTY, IM.FOLDER],
  sortField: "weighting",
  sortDirection: SortDirection.DESC
};

export default { ...FILTER_DEFAULTS };
