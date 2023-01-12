/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.36.1070 on 2023-01-12 09:49:22.

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

export interface Argument {
    parameter: string;
    valueData: string;
    valueVariable: string;
    valueFrom: Compare;
    valueIri: TTIriRef;
    valueProperty: TTIriRef;
    valueIriList: TTIriRef[];
    valueDataList: string[];
    valueObject: any;
}

export interface Binding {
    predicateBinding: { [index: string]: string };
    predicateObject: { [index: string]: Binding };
}

export interface Case {
    range: Range;
    value: string;
    outputData: string;
    outputIri: TTIriRef;
}

export interface Compare {
    variable: string;
    alias: string;
    property: TTIriRef;
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
    type: TTIriRef;
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

export interface FunctionClause extends TTIriRef {
    argument: Argument[];
    conceptMap: { [index: string]: string };
    defaultValue: TTIriRef;
}

export interface FunctionRequest {
    functionIri: string;
    arguments: Argument[];
}

export interface Having {
    aggregate: Aggregate;
    property: TTAlias;
    value: Value;
}

export interface ModelDocument {
    "@context": TTContext;
    query: QueryEntity[];
    folder: Entity[];
    conceptSet: ConceptSet[];
    function: FunctionClause[];
}

export interface NodeShape extends TTIriRef {
    property: PropertyShape[];
}

export interface OrderBy extends TTAlias {
    direction: string;
}

export interface Page {
    pageNumber: number;
    pageSize: number;
}

export interface Path {
    items: TTTypedRef[];
}

export interface PathDocument {
    source: TTTypedRef;
    paths: Path[];
    target: TTTypedRef;
}

export interface PathQuery extends TTIriRef {
    source: TTIriRef;
    target: TTIriRef;
    depth: number;
}

export interface Property {
    path: string;
    name: string;
    inverse: boolean;
    alias: string;
    iri: string;
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
}

export interface Query extends Entity {
    "@context": TTContext;
    from: TTAlias[];
    where: Where;
    select: Select[];
    subQuery: Query[];
    groupBy: TTAlias[];
    orderBy: TTAlias[];
    direction: string;
    limit: number;
    having: Having;
    activeOnly: boolean;
    usePrefixes: boolean;
}

export interface QueryEntity extends Entity {
    definition: Query;
}

export interface QueryRequest {
    name: string;
    page: Page;
    textSearch: string;
    argument: Argument[];
    query: Query;
    pathQuery: PathQuery;
    referenceDate: string;
}

export interface QueryTemplate {
}

export interface Range {
    from: Value;
    to: Value;
}

export interface Select {
    alias: string;
    path: string;
    property: TTAlias;
    case: Case[];
    aggregate: Aggregate;
    select: Select[];
    where: Where;
    orderBy: OrderBy[];
    direction: string;
    limit: number;
    groupBy: TTAlias[];
    having: Having;
    variable: string;
    argument: Argument[];
    functionClause: FunctionClause;
    function: FunctionClause;
}

export interface TransformRequest {
    transformMap: TTIriRef;
    sourceFormat: string;
    targetFormat: string;
    source: { [index: string]: any[] };
}

export interface Value {
    comparison: string;
    value: string;
    valueOf: Compare;
    unitOfTime: string;
}

export interface Where {
    alias: string;
    pathTo: string;
    with: Select;
    graph: string;
    notExist: Where;
    not: boolean;
    property: TTAlias;
    propertyIn: TTAlias[];
    in: TTAlias[];
    range: Range;
    and: Where[];
    or: Where[];
    within: Within;
    value: Value;
    where: Where;
    minus: TTAlias[];
    description: string;
    from: TTAlias[];
    is: TTAlias;
    function: FunctionClause;
}

export interface Within {
    value: Value;
    range: Range;
    of: Compare;
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
    key: string[];
    isA: TTIriRef[];
    termCode: SearchTermCode[];
}

export interface TTIriRef extends TTValue, Serializable {
    name: string;
    description: string;
    "@id": string;
}

export interface TTAlias extends TTIriRef {
    inverse: boolean;
    alias: string;
    variable: string;
    includeSupertypes: boolean;
    includeSubtypes: boolean;
    includeMembers: boolean;
    excludeSelf: boolean;
    isSet: boolean;
    type: boolean;
    isType: boolean;
}

export interface TTContext extends Serializable {
    prefixes: TTPrefix[];
    nameSpaces: TTPrefix[];
}

export interface TTTypedRef extends TTIriRef {
    type: TTIriRef;
}

export interface SearchTermCode {
    term: string;
    code: string;
    status: TTIriRef;
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

export type Aggregate = "SUM" | "COUNT" | "AVERAGE" | "MIN" | "MAX";

export type ListMode = "ALL" | "FIRST" | "REST";

export type TargetUpdateMode = "REPLACE" | "APPEND" | "ADDTOLIST";
