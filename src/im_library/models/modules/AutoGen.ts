/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.36.1070 on 2022-10-25 09:47:11.

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
    valueList: string[];
}

export interface Binding {
    predicateBinding: { [index: string]: string };
    predicateObject: { [index: string]: Binding };
}

export interface Compare {
    alias: string;
    property: TTAlias;
    variable: string;
}

export interface Concept {
    name: string;
    description: string;
    code: string;
    scheme: TTIriRef;
    im1Id: string[];
    matchedFrom: Concept[];
    usage: number;
    "@id": string;
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

export interface Function extends TTIriRef {
    argument: Argument[];
    conceptMap: { [index: string]: string };
    defaultValue: TTIriRef;
}

export interface MapGroup {
    name: string;
    source: TTAlias;
    target: TTAlias;
    rule: MapRule[];
    extends: string;
}

export interface MapRule {
    source: MapRuleSource[];
    target: MapRuleTransform[];
}

export interface MapRuleSource {
    context: string;
    type: string;
    variable: string;
    min: number;
    max: number;
    where: Where;
    check: Where;
}

export interface MapRuleTransform {
    context: string;
    variable: string;
    function: Function;
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
    function: TTIriRef;
    validation: TTIriRef;
    search: TTIriRef;
    select: TTIriRef[];
    argument: Argument[];
    valueVariable: string;
    isIri: TTIriRef;
    isTextValue: string;
    isNumericValue: string;
    datatype: TTIriRef;
    clazz: TTIriRef;
    validationErrorMessage: string;
    builderChild: boolean;
    expression: NodeShape;
}

export interface Query extends TTIriRef {
    prefix: TTContext;
    description: string;
    from: TTAlias[];
    where: Where;
    select: Select[];
    subQuery: Query[];
    orderBy: TTAlias[];
    direction: string;
    limit: number;
    groupBy: TTAlias[];
    activeOnly: boolean;
    usePrefixes: boolean;
}

export interface QueryDocument {
    query: Query[];
}

export interface QueryRequest {
    name: string;
    page: Page;
    textSearch: string;
    argument: { [index: string]: any };
    query: Query;
    pathQuery: PathQuery;
    referenceDate: string;
}

export interface Range {
    from: Value;
    to: Value;
    relativeTo: Compare;
}

export interface Select {
    path: string;
    property: TTAlias;
    sum: boolean;
    average: boolean;
    argument: Argument[];
    function: Function;
    select: Select[];
    where: Where;
    orderBy: OrderBy[];
    limit: number;
    groupBy: TTAlias[];
    max: boolean;
}

export interface TransformMap extends TTIriRef {
    description: string;
    source: TTAlias[];
    sourceFormat: TTIriRef;
    target: TTAlias[];
    import: TTAlias[];
    group: MapGroup[];
}

export interface Value {
    comparison: string;
    value: string;
    relativeTo: Compare;
}

export interface Where {
    alias: string;
    from: TTAlias[];
    graph: string;
    path: string;
    notExist: Where;
    not: boolean;
    property: TTAlias;
    in: TTAlias[];
    range: Range;
    and: Where[];
    or: Where[];
    function: Function;
    argument: Argument[];
    value: Value;
    description: string;
    is: TTAlias;
    where: Where;
    orderBy: OrderBy[];
    limit: number;
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
    nameSpaces: TTPrefix[];
    prefixes: TTPrefix[];
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
