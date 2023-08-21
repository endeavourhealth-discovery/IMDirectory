/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2023-08-21 16:35:50.

/**
 * Structure containing search request parameters and filters
 */
export interface SearchRequest {
  /**
   * Plain text, space separated list of terms
   */
  termFilter?: string;
  index?: string;
  /**
   * List of entity status IRI's
   */
  statusFilter?: string[];
  /**
   * List of entity type IRI's
   */
  typeFilter?: string[];
  /**
   * List of code scheme IRI's
   */
  schemeFilter?: string[];
  /**
   * Marks the results if they are descendants of any of these entities, but does not filter by them
   */
  markIfDescendentOf?: string[];
  /**
   * List of IRIs that must be supertypes of the matches
   */
  isA?: string[];
  /**
   * List of set IRIs that the match must be a member of
   */
  memberOf?: string[];
  /**
   * The search result page number to retrieve
   */
  page?: number;
  /**
   * The number of results to retrieve per page
   */
  size?: number;
  from?: number;
  /**
   * list of fields or property paths from search result summary to return
   */
  select?: string[];
  sortField?: string;
  sortDirection?: string;
}

export interface SearchResponse {
  page?: number;
  count?: number;
  entities?: SearchResultSummary[];
}

export interface Binding {
  predicateBinding?: { [index: string]: string };
  predicateObject?: { [index: string]: Binding };
}

export interface Concept extends Entity {
  subClassOf?: TTIriRef[];
  code?: string;
  im1Id?: string[];
  matchedFrom?: Concept[];
  usage?: number;
  codeId?: string;
}

export interface ConceptSet extends Entity {
  definition?: Query;
  hasMember?: TTIriRef[];
  usedIn?: TTIriRef[];
}

export interface Entity {
  "@id"?: string;
  status?: TTIriRef;
  scheme?: TTIriRef;
  isContainedIn?: TTIriRef[];
  entityType?: TTIriRef[];
  name?: string;
  description?: string;
}

export interface FormGenerator {
  "@id"?: string;
  status?: TTIriRef;
  label?: string;
  comment?: string;
  targetShape?: TTIriRef;
  type?: TTIriRef[];
  isContainedIn?: TTIriRef[];
  subClassOf?: TTIriRef[];
  scheme?: TTIriRef;
  iri?: string;
  property?: PropertyShape[];
}

export interface FunctionRequest {
  functionIri?: string;
  arguments?: Argument[];
}

export interface MapFunction extends TTIriRef {
  argument?: Argument[];
  conceptMap?: { [index: string]: string };
  defaultValue?: TTIriRef;
}

export interface ModelDocument {
  "@context"?: TTContext;
  query?: QueryEntity[];
  folder?: Entity[];
  conceptSet?: ConceptSet[];
  function?: MapFunction[];
}

export interface NodeShape extends TTIriRef {
  property?: PropertyShape[];
}

export interface Page {
  pageNumber?: number;
  pageSize?: number;
}

export interface PropertyShape {
  label?: string;
  comment?: string;
  name?: string;
  order: number;
  minCount?: number;
  maxCount?: number;
  componentType: TTIriRef;
  path: TTIriRef;
  node?: TTIriRef[];
  validation?: TTIriRef;
  search?: TTIriRef;
  select?: TTIriRef[];
  argument?: Argument[];
  valueVariable?: string;
  isIri?: TTIriRef;
  isTextValue?: string;
  isNumericValue?: string;
  forceIsValue?: boolean;
  builderChild?: boolean;
  showTitle?: boolean;
  property?: PropertyShape[];
  datatype?: TTIriRef;
  clazz?: TTIriRef;
  validationErrorMessage?: string;
  function?: TTIriRef;
  valueIri?: TTIriRef;
  expression?: NodeShape;
}

export interface TransformRequest {
  transformMap?: TTIriRef;
  sourceFormat?: string;
  targetFormat?: string;
  source?: { [index: string]: any[] };
}

export interface Argument {
  parameter?: string;
  valueData?: string;
  valueVariable?: string;
  valueIri?: TTIriRef;
  valueIriList?: TTIriRef[];
  valueDataList?: string[];
  valueObject?: any;
}

export interface Assignable {
  value?: string;
  unit?: string;
  dataType?: TTIriRef;
  operator?: Operator;
  relativeTo?: PropertyRef;
}

export interface Case {
  when?: When[];
  else?: ReturnProperty;
}

export interface ContextMap {
  context?: { [index: string]: string };
}

export interface Delete {
  where?: Property;
  subject?: Element;
  inverse?: boolean;
  predicate?: Element;
  object?: Element;
  delete?: Delete[];
}

export interface Element extends IriLD, Entailment {
  parameter?: string;
  variable?: string;
  ref?: string;
}

export interface Entailment {
  descendantsOrSelfOf?: boolean;
  ancestorsOf?: boolean;
  descendantsOf?: boolean;
}

export interface FunctionClause extends Value {
  function?: Function;
  argument?: Argument[];
  range?: Range;
}

export interface IriLD {
  "@id"?: string;
  name?: string;
}

export interface Match extends IriLD {
  exclude?: boolean;
  nodeRef?: string;
  description?: string;
  graph?: Element;
  match?: Match[];
  bool?: Bool;
  inSet?: Node[];
  property?: Property[];
  orderBy?: OrderLimit[];
  optional?: boolean;
  aggregate?: FunctionClause;
  instanceOf?: Node;
  typeOf?: Node;
  variable?: string;
}

export interface Node extends Element {}

export interface OrderLimit extends PropertyRef {
  direction?: Order;
  limit?: number;
  description?: string;
  partitionBy?: PropertyRef;
  id?: string;
}

export interface PathDocument {
  match?: Match[];
}

export interface PathQuery extends TTIriRef {
  source?: TTIriRef;
  target?: TTIriRef;
  depth?: number;
}

export interface Property extends PropertyRef, Assignable {
  description?: string;
  bool?: Bool;
  match?: Match;
  property?: Property[];
  range?: Range;
  isNot?: Node[];
  notInSet?: Node[];
  inSet?: Node[];
  anyRoleGroup?: boolean;
  is?: Node[];
  valueLabel?: string;
  null?: boolean;
}

export interface PropertyRef extends Element {
  inverse?: boolean;
  nodeRef?: string;
  valueVariable?: string;
}

export interface Query extends Match {
  activeOnly?: boolean;
  return?: Return[];
  query?: Query[];
  groupBy?: PropertyRef[];
}

export interface QueryEntity extends Entity {
  definition?: Query;
}

export interface QueryException extends Exception {}

export interface QueryRequest extends ContextMap {
  "@context"?: { [index: string]: string };
  textSearch?: string;
  argument?: Argument[];
  referenceDate?: string;
  query: Query;
  pathQuery?: PathQuery;
  update?: Update;
  name?: string;
  page?: Page;
}

export interface Range {
  from: Assignable;
  to: Assignable;
}

export interface Return {
  nodeRef?: string;
  function?: FunctionClause;
  property?: ReturnProperty[];
  as?: string;
  valueRef?: string[];
}

export interface ReturnProperty {
  "@id"?: string;
  function?: FunctionClause;
  as?: string;
  nodeRef?: string;
  propertyRef?: string;
  value?: string;
  valueRef?: string;
  inverse?: boolean;
  unit?: string;
  dataType?: TTIriRef;
  return?: Return;
  case?: Case;
}

export interface Update extends TTIriRef {
  match?: Match[];
  delete?: Delete[];
}

export interface Value extends Assignable {}

export interface When {
  property?: Property;
  then?: ReturnProperty;
}

export interface EntityDocument {
  id?: number;
  iri?: string;
  name?: string;
  length?: number;
  preferredName?: string;
  code?: string;
  matchTerm?: string[];
  key?: string[];
  scheme?: TTIriRef;
  entityType?: TTIriRef[];
  status?: TTIriRef;
  termCode?: SearchTermCode[];
  weighting?: number;
  match?: string;
  isA?: TTIriRef[];
  memberOf?: TTIriRef[];
  isDescendentOf?: TTIriRef[];
}

export interface SearchResultSummary {
  name?: string;
  iri?: string;
  code?: string;
  description?: string;
  status?: TTIriRef;
  scheme?: TTIriRef;
  entityType?: TTIriRef[];
  weighting?: number;
  match?: string;
  preferredName?: string;
  key?: string[];
  isA?: TTIriRef[];
  termCode?: SearchTermCode[];
}

export interface SearchTermCode {
  term?: string;
  code?: string;
  status?: TTIriRef;
}

export interface TTIriRef extends TTValue, Serializable {
  name?: string;
  description?: string;
  "@id": string;
}

export interface TTContext extends Serializable {
  nameSpaces?: TTPrefix[];
  prefixes?: TTPrefix[];
}

export interface Throwable extends Serializable {
  cause?: Throwable;
  stackTrace?: StackTraceElement[];
  message?: string;
  suppressed?: Throwable[];
  localizedMessage?: string;
}

export interface StackTraceElement extends Serializable {
  classLoaderName?: string;
  moduleName?: string;
  moduleVersion?: string;
  methodName?: string;
  fileName?: string;
  lineNumber?: number;
  nativeMethod?: boolean;
  className?: string;
}

export interface Exception extends Throwable {}

export interface TTValue extends Serializable {
  order?: number;
}

export interface Serializable {}

export interface TTPrefix {
  iri?: string;
  prefix?: string;
  name?: string;
}

export type ListMode = "ALL" | "FIRST" | "REST";

export type TargetUpdateMode = "REPLACE" | "APPEND" | "ADDTOLIST";

export type Aggregate = "SUM" | "COUNT" | "AVERAGE" | "MIN" | "MAX";

export type Bool = "and" | "or";

export type Comparison = "eq" | "gte" | "gt" | "lte" | "lt";

export type Function = "sum" | "count" | "average";

export type Operator = "=" | ">=" | ">" | "<=" | "startsWith" | "contains";

export type Order = "ascending" | "descending";

export type VarType = "NODE" | "PATH" | "LITERAL";
