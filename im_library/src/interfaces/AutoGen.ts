/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.36.1070 on 2023-05-24 10:47:29.

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
    scheme: TTIriRef;
    iri: string;
    property: PropertyShape[];
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
    property: PropertyShape[];
    datatype: TTIriRef;
    clazz: TTIriRef;
    validationErrorMessage: string;
    function: TTIriRef;
    valueIri: TTIriRef;
    expression: NodeShape;
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

export interface ContextMap {
    context: { [index: string]: string };
}

export interface Delete {
    where: Where;
    subject: Element;
    inverse: boolean;
    predicate: Element;
    object: Element;
    delete: Delete[];
}

export interface Element extends IriLD, Entailment {
    parameter: string;
    variable: string;
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

export interface IriLD {
    "@id": string;
    "@type": string;
    "@set": string;
    name: string;
}

export interface Match extends Node, Whereable {
    exclude: boolean;
    nodeRef: string;
    boolMatch: Bool;
    description: string;
    graph: Element;
    match: Match[];
    orderBy: OrderLimit[];
}

export interface Node extends Element {
    path: Path;
}

export interface OrderLimit extends Property {
    direction: Order;
    limit: number;
    id: string;
}

export interface Path extends Property {
    node: Node;
}

export interface PathDocument {
    match: Match[];
}

export interface PathQuery extends TTIriRef {
    source: IriLD;
    target: IriLD;
    depth: number;
}

export interface Property extends Element {
    inverse: boolean;
    nodeRef: string;
    valueVariable: string;
}

export interface Query extends TTIriRef {
    match: Match[];
    groupBy: Property[];
    orderBy: OrderLimit[];
    activeOnly: boolean;
    usePrefixes: boolean;
    query: Query[];
    return: Return[];
}

export interface QueryEntity extends Entity {
    definition: Query;
}

export interface QueryException extends Exception {
}

export interface QueryRequest extends ContextMap {
    "@context": { [index: string]: string };
    textSearch: string;
    argument: Argument[];
    referenceDate: string;
    query: Query;
    pathQuery: PathQuery;
    update: Update;
    name: string;
    page: Page;
}

export interface Range {
    from: Assignable;
    to: Assignable;
}

export interface Return {
    nodeRef: string;
    function: FunctionClause;
    property: ReturnProperty[];
    as: string;
}

export interface ReturnProperty {
    node: Return;
    "@id": string;
    name: string;
    function: FunctionClause;
    as: string;
    propertyRef: string;
    valueVariable: string;
    inverse: boolean;
    unit: string;
}

export interface Update extends TTIriRef {
    match: Match[];
    delete: Delete[];
}

export interface Value extends Assignable {
}

export interface Where extends Property, Assignable, Whereable {
    description: string;
    range: Range;
    in: Node[];
    notIn: Node[];
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

export interface Throwable extends Serializable {
    cause: Throwable;
    stackTrace: StackTraceElement[];
    message: string;
    suppressed: Throwable[];
    localizedMessage: string;
}

export interface StackTraceElement extends Serializable {
    classLoaderName: string;
    moduleName: string;
    moduleVersion: string;
    methodName: string;
    fileName: string;
    lineNumber: number;
    nativeMethod: boolean;
    className: string;
}

export interface Exception extends Throwable {
}

export interface TTValue extends Serializable {
    order: number;
}

export interface Serializable {
}

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

export type VarType = "NODE" | "PATH" | "LITERAL";
