/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.36.1070 on 2023-04-05 15:08:31.

/**
 * Structure containing search request parameters and filters
 */
export interface SearchRequest {
  /**
   * Plain text, space separated list of terms
   */
  termFilter: string;
  index: string;
  /**
   * List of entity status IRI's
   */
  statusFilter: string[];
  /**
   * List of entity type IRI's
   */
  typeFilter: string[];
  /**
   * List of code scheme IRI's
   */
  schemeFilter: string[];
  /**
   * Marks the results if they are descendants of any of these entities, but does not filter by them
   */
  markIfDescendentOf: string[];
  /**
   * List of IRIs that must be supertypes of the matches
   */
  isA: string[];
  /**
   * The search result page number to retrieve
   */
  page: number;
  /**
   * The number of results to retrieve per page
   */
  size: number;
  from: number;
  /**
   * list of fields or property paths from search result summary to return
   */
  select: string[];
  sortField: string;
  sortDirection: string;
}

export interface SearchResponse {
  page: number;
  count: number;
  entities: SearchResultSummary[];
}

export interface Binding {
  predicateBinding: { [index: string]: string };
  predicateObject: { [index: string]: Binding };
}

export interface Concept extends Entity {
  subClassOf: TTIriRef[];
  code: string;
  im1Id: string[];
  matchedFrom: Concept[];
  usage: number;
}

export interface ConceptSet extends Entity {
  definition: Query;
  hasMember: TTIriRef[];
  usedIn: TTIriRef[];
}

export interface Entity {
  "@id": string;
  type: TTIriRef[];
  status: TTIriRef;
  scheme: TTIriRef;
  isContainedIn: TTIriRef[];
  name: string;
  description: string;
}

export interface FormGenerator {
  "@id": string;
  status: TTIriRef;
  label: string;
  comment: string;
  targetShape: TTIriRef;
  type: TTIriRef[];
  isContainedIn: TTIriRef[];
  subClassOf: TTIriRef[];
  group: PropertyGroup[];
  scheme: TTIriRef;
  iri: string;
}

export interface FunctionRequest {
  functionIri: string;
  arguments: Argument[];
}

export interface MapFunction extends TTIriRef {
  argument: Argument[];
  conceptMap: { [index: string]: string };
  defaultValue: TTIriRef;
}

export interface ModelDocument {
  "@context": TTContext;
  query: QueryEntity[];
  folder: Entity[];
  conceptSet: ConceptSet[];
  function: MapFunction[];
}

export interface NodeShape extends TTIriRef {
  property: PropertyShape[];
}

export interface Page {
  pageNumber: number;
  pageSize: number;
}

export interface Path {
  source: TTTypedRef;
  items: TTTypedRef[];
  target: TTTypedRef;
}

export interface PropertyGroup {
  label: string;
  comment: string;
  name: string;
  order: number;
  minCount: number;
  maxCount: number;
  property: PropertyShape[];
  componentType: TTIriRef;
  subGroup: PropertyGroup[];
  path: TTIriRef;
  validation: TTIriRef;
  validationErrorMessage: string;
  function: TTIriRef;
  valueIri: TTIriRef;
  builderChild: boolean;
  argument: Argument[];
}

export interface PropertyShape {
  label: string;
  comment: string;
  name: string;
  order: number;
  minCount: number;
  maxCount: number;
  componentType: TTIriRef;
  path: TTIriRef;
  node: TTIriRef[];
  validation: TTIriRef;
  search: TTIriRef;
  select: TTIriRef[];
  argument: Argument[];
  valueVariable: string;
  isIri: TTIriRef;
  isTextValue: string;
  isNumericValue: string;
  forceIsValue: boolean;
  builderChild: boolean;
  datatype: TTIriRef;
  clazz: TTIriRef;
  validationErrorMessage: string;
  function: TTIriRef;
  expression: NodeShape;
  subProperty: PropertyShape[];
}

export interface TransformRequest {
  transformMap: TTIriRef;
  sourceFormat: string;
  targetFormat: string;
  source: { [index: string]: any[] };
}

export interface Argument {
  parameter: string;
  valueData: string;
  valueVariable: string;
  valueIri: TTIriRef;
  valueIriList: TTIriRef[];
  valueDataList: string[];
  valueObject: any;
}

export interface Assignable {
  value: string;
  operator: Operator;
  relativeTo: Property;
  unit: string;
}

export interface Case {
  range: Range;
  value: string;
  outputData: string;
  outputIri: TTIriRef;
}

export interface Delete {
  where: Where;
  subject: Element;
  inverse: boolean;
  predicate: Element;
  object: Element;
  delete: Delete[];
}

export interface Element extends Entailment {
  "@id": string;
  "@type": string;
  "@set": string;
  variable: string;
  name: string;
  parameter: string;
  inverse: boolean;
  iri: string;
}

export interface Entailment {
  descendantsOf: boolean;
  descendantsOrSelfOf: boolean;
  ancestorsOf: boolean;
}

export interface FunctionClause {
  function: Function;
  argument: Argument[];
}

export interface Match extends Element, Whereable {
  exclude: boolean;
  boolMatch: Bool;
  description: string;
  graph: Element;
  path: Element[];
  match: Match[];
  orderBy: OrderLimit[];
}

export interface OrderLimit extends Property {
  direction: Order;
  limit: number;
  property: string;
}

export interface PathDocument {
  match: Match[];
}

export interface PathQuery extends TTIriRef {
  source: TTIriRef;
  target: TTIriRef;
  depth: number;
}

export interface Property extends Element {
  node: string;
}

export interface Query extends TTIriRef {
  match: Match[];
  select: Select[];
  groupBy: Element[];
  orderBy: OrderLimit[];
  activeOnly: boolean;
  usePrefixes: boolean;
  query: Query[];
}

export interface QueryEntity extends Entity {
  definition: Query;
}

export interface QueryRequest {
  name: string;
  page: Page;
  context: TTContext;
  textSearch: string;
  argument: Argument[];
  query: Query;
  pathQuery: PathQuery;
  update: Update;
  referenceDate: string;
}

export interface Range {
  to: Assignable;
  from: Assignable;
}

export interface Select extends Property {
  case: Case[];
  select: Select[];
  function: FunctionClause;
}

export interface Update extends TTIriRef {
  match: Match;
  delete: Delete[];
}

export interface Value extends Assignable {}

export interface Where extends Property, Assignable, Whereable {
  description: string;
  range: Range;
  in: Element[];
  notIn: Element[];
  anyRoleGroup: boolean;
  valueLabel: string;
  null: boolean;
}

export interface Whereable {
  where: Where[];
  bool: Bool;
}

export interface EntityDocument {
  id: number;
  iri: string;
  name: string;
  length: number;
  preferredName: string;
  code: string;
  matchTerm: string[];
  key: string[];
  scheme: TTIriRef;
  entityType: TTIriRef[];
  status: TTIriRef;
  termCode: SearchTermCode[];
  weighting: number;
  match: string;
  isA: TTIriRef[];
  isDescendentOf: TTIriRef[];
}

export interface SearchResultSummary {
  name: string;
  iri: string;
  code: string;
  description: string;
  status: TTIriRef;
  scheme: TTIriRef;
  entityType: TTIriRef[];
  weighting: number;
  match: string;
  preferredName: string;
  key: string[];
  isA: TTIriRef[];
  termCode: SearchTermCode[];
}

export interface SearchTermCode {
  term: string;
  code: string;
  status: TTIriRef;
}

export interface TTIriRef extends TTValue, Serializable {
  name: string;
  description: string;
  "@id": string;
}

export interface TTContext extends Serializable {
  prefixes: TTPrefix[];
  nameSpaces: TTPrefix[];
}

export interface TTTypedRef extends TTIriRef {
  type: TTIriRef;
}

export interface TTValue extends Serializable {
  order: number;
}

export interface Serializable {}

export interface TTPrefix {
  iri: string;
  prefix: string;
  name: string;
}

export type ListMode = "ALL" | "FIRST" | "REST";

export type TargetUpdateMode = "REPLACE" | "APPEND" | "ADDTOLIST";

export type Aggregate = "SUM" | "COUNT" | "AVERAGE" | "MIN" | "MAX";

export type Bool = "and" | "or";

export type Comparison = "eq" | "gte" | "gt" | "lte" | "lt";

export type Function = "sum" | "count" | "average";

export type Operator = "=" | ">=" | ">" | "<=" | "startsWith" | "contains";

export type Order = "ascending" | "descending";
