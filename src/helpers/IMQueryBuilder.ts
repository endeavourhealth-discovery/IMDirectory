import { Match, Order, Query, QueryRequest, SearchBinding, TTIriRef, Where } from "@/interfaces/AutoGen";
import { IM, RDF, SHACL } from "@/vocabulary";
import { SearchOptions } from "@/interfaces";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export function buildIMQueryFromFilters(filterOptions: SearchOptions): QueryRequest {
  const imQuery: QueryRequest = { query: {} };
  if (isArrayHasLength(filterOptions.status)) addStatusFilterToIMQuery(filterOptions.status, imQuery);
  if (isArrayHasLength(filterOptions.types)) addTypeFilterToIMQuery(filterOptions.types, imQuery);
  if (isArrayHasLength(filterOptions.schemes)) addSchemeFilterToIMQuery(filterOptions.schemes, imQuery);
  if (isArrayHasLength(filterOptions.isA)) addIsaToIMQuery(filterOptions.isA!, imQuery);
  if (isArrayHasLength(filterOptions.binding)) addBindingsToIMQuery(filterOptions.binding!, imQuery);
  if (filterOptions.page) imQuery.page = filterOptions.page;
  if (filterOptions.textSearch) imQuery.textSearch = filterOptions.textSearch;
  return imQuery;
}

export function addStatusFilterToIMQuery(status: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const statusMatch: Match = { where: [{ iri: IM.HAS_STATUS, is: status }] };
  imQuery.query.match!.push(statusMatch);
}

export function addTypeFilterToIMQuery(types: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const typeMatch: Match = { where: [{ iri: RDF.TYPE, is: types }] };
  imQuery.query.match!.push(typeMatch);
}

export function addSchemeFilterToIMQuery(schemes: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const schemeMatch: Match = { where: [{ iri: IM.HAS_SCHEME, is: schemes }] };
  imQuery.query.match!.push(schemeMatch);
}

export function addIsaToIMQuery(isAs: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const isAMatch: Match = { where: [{ iri: IM.IS_A, is: isAs }] };
  imQuery.query.match!.push(isAMatch);
}

export function addSortingToIMQuery(sortingField: TTIriRef, sortDirection: TTIriRef, imQuery: QueryRequest) {
  if (!imQuery.query.orderBy) imQuery.query.orderBy = {};
  if (isObjectHasKeys(sortingField)) imQuery.query.orderBy.property = sortingField;
  else imQuery.query.orderBy.property = {};
  if (isObjectHasKeys(sortDirection)) imQuery.query.orderBy.property.direction = sortDirection.iri === IM.ASCENDING ? Order.ascending : Order.descending;
  else imQuery.query.orderBy.property.direction = Order.descending;
}

export function addMemberOfToIMQuery(memberOfs: TTIriRef[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];
  const memberOfMatch: Match = { where: [{ iri: IM.IS_MEMBER_OF, is: memberOfs }] };
  imQuery.query.match!.push(memberOfMatch);
}

export function addBindingsToIMQuery(searchBindings: SearchBinding[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.match)) imQuery.query.match = [];

  for (const searchBinding of searchBindings) {
    const match: Match = {
      where: [
        {
          iri: IM.BINDING,
          match: {
            where: [
              {
                iri: SHACL.PATH,
                is: [{ iri: searchBinding.path?.iri }]
              },
              {
                iri: SHACL.NODE,
                is: [{ iri: searchBinding.node?.iri }]
              }
            ]
          }
        }
      ]
    };
    imQuery.query.match!.push(match);
  }
}

export function deleteQueryPredicateIfExists(query: Query, predicateIri: string) {
  if (query.match) {
    for (const match of query.match) {
      deleteMatchPredicateIfExists(match, query.match, predicateIri, true);
    }
  }
}

function deleteMatchPredicateIfExists(match: Match, parent: Match[], predicateIri: string, topLevel: boolean): boolean {
  if (match.iri === predicateIri) {
    if (topLevel) {
      parent.splice(parent.indexOf(match), 1);
      return false;
    }
    return true;
  } else if (match.match) {
    let deleteRequired = false;
    for (const subMatch of match.match) {
      const isDeleteRequired = deleteMatchPredicateIfExists(subMatch, match.match, predicateIri, match.match.length > 1);
      if (isDeleteRequired) {
        if (match.match.length > 1) {
          match.match.splice(match.match.indexOf(subMatch), 1);
        } else if (topLevel) match.match.splice(parent.indexOf(subMatch), 1);
        else deleteRequired = true;
      }
    }
    return deleteRequired;
  } else if (match.where) {
    let deleteRequired = false;
    for (const where of match.where) {
      const isDeleteRequired = deleteWherePredicateIfExists(where, match.where, predicateIri);
      if (isDeleteRequired) {
        if (match.where.length > 1) {
          match.where.splice(
            match.where.findIndex(w => w.iri === where.iri),
            1
          );
        } else if (topLevel) {
          parent.splice(parent.indexOf(match), 1);
        } else deleteRequired = true;
      }
    }
    return deleteRequired;
  } else return false;
}

function deleteWherePredicateIfExists(where: Where, parent: Where[], predicateIri: string): boolean {
  return where.iri === predicateIri;
}
