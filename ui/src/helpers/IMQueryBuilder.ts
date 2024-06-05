import { Match, Order, QueryRequest, SearchBinding, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDF, SHACL } from "@im-library/vocabulary";
import { SearchOptions } from "@im-library/interfaces";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

export function buildIMQueryFromFilters(filterOptions: SearchOptions): QueryRequest {
  const imQuery: QueryRequest = { query: {} };
  if (isArrayHasLength(filterOptions.status)) addStatusFilterToIMQuery(filterOptions.status, imQuery);
  if (isArrayHasLength(filterOptions.types)) addTypeFilterToIMQuery(filterOptions.types, imQuery);
  if (isArrayHasLength(filterOptions.schemes)) addSchemeFilterToIMQuery(filterOptions.schemes, imQuery);
  if (isArrayHasLength(filterOptions.sortDirections) || isArrayHasLength(filterOptions.sortFields))
    addSortingToIMQuery(filterOptions.sortFields?.[0], filterOptions.sortDirections?.[0], imQuery);
  if (isArrayHasLength(filterOptions.isA)) addIsaToIMQuery(filterOptions.isA!, imQuery);
  if (isArrayHasLength(filterOptions.binding)) addBindingsToIMQuery(filterOptions.binding!, imQuery);
  if (filterOptions.page) imQuery.page = filterOptions.page;
  if (filterOptions.textSearch) imQuery.textSearch = filterOptions.textSearch;
  return imQuery;
}

export function addStatusFilterToIMQuery(status: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const statusMatch: Match = { where: [{ "@id": IM.HAS_STATUS, is: status }] };
  imQuery.query.match!.push(statusMatch);
}

export function addTypeFilterToIMQuery(types: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const typeMatch: Match = { where: [{ "@id": RDF.TYPE, is: types }] };
  imQuery.query.match!.push(typeMatch);
}

export function addSchemeFilterToIMQuery(schemes: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const schemeMatch: Match = { where: [{ "@id": IM.HAS_SCHEME, is: schemes }] };
  imQuery.query.match!.push(schemeMatch);
}

export function addIsaToIMQuery(isAs: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const isAMatch: Match = { where: [{ "@id": IM.IS_A, is: isAs }] };
  imQuery.query.match!.push(isAMatch);
}

export function addSortingToIMQuery(sortingField: TTIriRef, sortDirection: TTIriRef, imQuery: QueryRequest) {
  if (!imQuery.query.orderBy) imQuery.query.orderBy = {};
  if (isObjectHasKeys(sortingField)) imQuery.query.orderBy.property = sortingField;
  else imQuery.query.orderBy.property = {};
  if (isObjectHasKeys(sortDirection)) imQuery.query.orderBy.property.direction = sortDirection["@id"] === IM.ASCENDING ? Order.ascending : Order.descending;
  else imQuery.query.orderBy.property.direction = Order.descending;
}

export function addMemberOfToIMQuery(memberOfs: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const memberOfMatch: Match = { where: [{ "@id": IM.IS_MEMBER_OF, is: memberOfs }] };
  imQuery.query.match!.push(memberOfMatch);
}

export function addBindingsToIMQuery(searchBindings: SearchBinding[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];

  for (const searchBinding of searchBindings) {
    const match: Match = {
      where: [
        {
          "@id": IM.BINDING,
          match: {
            where: [
              {
                "@id": SHACL.PATH,
                is: [{ "@id": searchBinding.path?.["@id"] }]
              },
              {
                "@id": SHACL.NODE,
                is: [{ "@id": searchBinding.node?.["@id"] }]
              }
            ]
          }
        }
      ]
    };
    imQuery.query.match!.push(match);
  }
}