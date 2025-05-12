import { Match, OrderDirection, Node, Query, QueryRequest, SearchBinding, TTIriRef, Where, Element } from "@/interfaces/AutoGen";
import { IM, RDF, SHACL } from "@/vocabulary";
import { SearchOptions } from "@/interfaces";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export function buildIMQueryFromFilters(filterOptions: SearchOptions): QueryRequest {
  const imQuery: QueryRequest = { query: {} };
  if (isArrayHasLength(filterOptions.status)) addFilterToIMQuery(IM.STATUS, filterOptions.status, imQuery);
  if (isArrayHasLength(filterOptions.types)) addFilterToIMQuery(RDF.TYPE, filterOptions.types, imQuery);
  if (isArrayHasLength(filterOptions.schemes)) addFilterToIMQuery(IM.HAS_SCHEME, filterOptions.schemes, imQuery);
  if (isArrayHasLength(filterOptions.isA)) addFilterToIMQuery(IM.IS_A, filterOptions.isA!, imQuery);
  if (isArrayHasLength(filterOptions.binding)) addBindingsToIMQuery(filterOptions.binding!, imQuery);
  if (filterOptions.page) imQuery.page = filterOptions.page;
  if (filterOptions.textSearch) imQuery.textSearch = filterOptions.textSearch;
  return imQuery;
}

function addFilterToIMQuery(predicate: string, values: any[], query: Query) {
  if (!query.where) query.where = {};
  if (!query.where.and) query.where.and = [];
  const where: Where = {
    "@id": predicate,
    is: values.map(item => item as Node)
  };
  query.where.and.push(where);
}

export const booleanWhereOptions = [
  {
    label: "Or",
    value: "or",
    tooltip: "At least on of this group must be true"
  },
  {
    label: "And",
    value: "and",
    tooltip: "All of this group must be true"
  }
];

export const booleanMatchOptions = [
  {
    label: "Or",
    value: "or",
    tooltip: "At least on of this group must be true"
  },
  {
    label: "And",
    value: "and",
    tooltip: "All of this group must be true"
  },
  {
    label: "Minus",
    value: "not",
    tooltip: "Exclude this item or  group "
  }
];

export const constraintOperatorOptions = [
  {
    label: "--",
    value: "",
    tooltip: "This concept only"
  },
  {
    label: "<<",
    value: "<<",
    tooltip: "This concept and all descendants"
  },
  {
    label: "<",
    value: "<",
    tooltip: "Descendants of this concept but not this concept"
  },
  {
    label: "^",
    value: "^",
    tooltip: "Member of this value set"
  },
  {
    label: ">>!",
    value: ">>!",
    tooltip: "This concept and all ancestors"
  }
];
export function getOperatorToggle(operator: string): string {
  return "Change to " + (operator === "and" ? '"or"' : '"and"') + " (" + (operator === "and" ? getOperatorText("or") : getOperatorText("and")) + ")";
}
export function getOperatorText(operator: string): string {
  if (operator === "or") {
    return "At least one of the following";
  } else if (operator === "and") {
    return "All of the following";
  } else if (operator === "not") {
    return "Exclude if any of the following";
  } else {
    return "whats this operator ";
  }
}

export function getConstraintOperator(constrainer: Element) {
  if (constrainer.descendantsOrSelfOf) return "<<";
  if (constrainer.descendantsOf) return "<";
  if (constrainer.memberOf) return "^";
  if (constrainer.ancestorsOrSelfOf) return ">>!";
  return "";
}

export function setConstraintOperator(constrainer: Element, valueConstraintOperator: string) {
  switch (valueConstraintOperator) {
    case "<<":
      constrainer.descendantsOrSelfOf = true;
      constrainer.descendantsOf = false;
      constrainer.memberOf = false;
      constrainer.ancestorsOrSelfOf = false;
      break;
    case "<":
      constrainer.descendantsOf = true;
      constrainer.descendantsOrSelfOf = false;
      constrainer.memberOf = false;
      constrainer.ancestorsOrSelfOf = false;
      break;
    case "^":
      constrainer.memberOf = true;
      constrainer.descendantsOrSelfOf = false;
      constrainer.descendantsOf = false;
      constrainer.ancestorsOrSelfOf = false;
      break;
    case ">>!":
      constrainer.ancestorsOrSelfOf = true;
      constrainer.descendantsOrSelfOf = false;
      constrainer.descendantsOf = false;
      constrainer.memberOf = false;
      break;
    default:
      constrainer.ancestorsOrSelfOf = false;
      constrainer.descendantsOrSelfOf = false;
      constrainer.descendantsOf = false;
      constrainer.memberOf = false;
  }
}

export function addSortingToIMQuery(sortingField: TTIriRef, sortDirection: TTIriRef, imQuery: QueryRequest) {
  if (!imQuery.query.orderBy) {
    imQuery.query.orderBy = {};
    imQuery.query.orderBy.property = [];
  }
  const orderDirection = {
    "@id": sortingField["@id"],
    name: sortingField.name ? sortingField.name : "",
    direction: sortDirection["@id"] === IM.ASCENDING ? "ascending" : "descending"
  } as OrderDirection;
  imQuery.query.orderBy.property?.push(orderDirection);
}

export function addBindingsToIMQuery(searchBindings: SearchBinding[], imQuery: QueryRequest) {
  if (!isArrayHasLength(imQuery.query.and)) imQuery.query.and = [];
  for (const searchBinding of searchBindings) {
    const match: Match = {
      path: [
        {
          "@id": IM.BINDING
        }
      ],
      where: {
        and: [
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
    };
    imQuery.query.and!.push(match);
  }
}

function deleteWherePredicateIfExists(where: Where, parent: Where[], predicateIri: string): boolean {
  return where["@id"] === predicateIri;
}
