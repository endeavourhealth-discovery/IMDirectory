import { Match, Order, QueryRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { isArrayHasLength } from "./DataTypeCheckers";
import { IM, RDF } from "@im-library/vocabulary";

export function addStatusFilterToIMQuery(status: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const statusMatch: Match = { where: [{ "@id": IM.HAS_STATUS, is: status }] };
  imQuery.query.match?.push(statusMatch);
}

export function addTypeFilterToIMQuery(types: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const typeMatch: Match = { where: [{ "@id": RDF.TYPE, is: types }] };
  imQuery.query.match?.push(typeMatch);
}

export function addSchemeFilterToIMQuery(schemes: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const schemeMatch: Match = { where: [{ "@id": IM.HAS_SCHEME, is: schemes }] };
  imQuery.query.match?.push(schemeMatch);
}

export function addIsaToIMQuery(isAs: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const isAMatch: Match = { where: [{ "@id": IM.IS_A, is: isAs }] };
  imQuery.query.match?.push(isAMatch);
}

export function addSortingToIMQuery(sortingField: TTIriRef, sortDirection: TTIriRef, imQuery: QueryRequest) {
  if (!imQuery.query.orderBy) imQuery.query.orderBy = {};
  imQuery.query.orderBy.property = sortingField;
  imQuery.query.orderBy.property.direction = sortDirection["@id"] === IM.ASCENDING ? Order.ascending : Order.descending;
}

export function addBindingToIMQuery(sortingField: TTIriRef, sortDirection: TTIriRef, imQuery: QueryRequest) {}
