import { IM, RDF, RDFS } from "../../vocabulary";

const GRAPH_EXCLUDE_PREDICATES = [
  RDF.TYPE,
  RDFS.COMMENT,
  RDFS.LABEL,
  IM.STATUS,
  IM.HAS_STATUS,
  IM.MATCHED_TO,
  IM.QUERY,
  IM.SELECT,
  IM.IS_CHILD_OF,
  IM.HAS_CHILDREN,
  IM.DEFINITION,
  IM.USAGE_STATS,
  IM.IS_A
];

export default [...GRAPH_EXCLUDE_PREDICATES];
