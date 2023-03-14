/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.36.1070 on 2023-03-14 09:29:42.

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

export interface FunctionClause extends TTIriRef {
    argument: Argument[];
    conceptMap: { [index: string]: string };
    defaultValue: TTIriRef;
}

export interface FunctionRequest {
    functionIri: string;
    arguments: Argument[];
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
    relativeTo: string;
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
    subject: TTAlias;
    inverse: boolean;
    predicate: TTAlias;
    object: TTAlias;
    delete: Delete[];
}

export interface From extends TTAlias {
    graph: TTAlias;
    from: From[];
    where: Where[];
    boolFrom: Bool;
    boolWhere: Bool;
}

export interface Having {
    aggregate: Aggregate;
    property: TTAlias;
    value: Value;
}

export interface OrderLimit extends TTAlias {
    direction: string;
}

export interface PathDocument {
    where: Where[];
}

export interface PathQuery extends TTIriRef {
    source: TTIriRef;
    target: TTIriRef;
    depth: number;
}

export interface Query extends TTAlias {
    from: From;
    select: Select[];
    groupBy: TTAlias[];
    orderBy: OrderLimit[];
    direction: string;
    limit: number;
    having: Having;
    activeOnly: boolean;
    usePrefixes: boolean;
    query: Query[];
    caze: Case[];
    case: Case[];
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
    from: Assignable;
    to: Assignable;
}

export interface Select extends TTAlias {
    case: Case[];
    where: Where;
    orderBy: OrderLimit[];
    groupBy: TTAlias[];
    having: Having;
    select: Select[];
    function: FunctionClause;
}

export interface Update extends TTAlias {
    from: From;
    delete: Delete[];
}

export interface Value extends Assignable {
}

export interface Where extends TTAlias, Assignable {
    bool: Bool;
    with: With;
    where: Where[];
    range: Range;
    in: TTAlias[];
    notIn: TTAlias[];
    anyRoleGroup: boolean;
    valueLabel: string;
}

export interface With extends Where {
    orderBy: TTAlias;
    direction: Order;
    count: number;
    then: Where;
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

export interface TTAlias extends TTIriRef {
    inverse: boolean;
    alias: string;
    "@type": string;
    "@set": string;
    variable: string;
    ancestorsOf: boolean;
    descendantsOrSelfOf: boolean;
    descendantsOf: boolean;
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

export type Bool = "and" | "or" | "not";

export type Comparison = "eq" | "gte" | "gt" | "lte" | "lt";

export type Operator = "=" | ">=" | ">" | "<=" | "startsWith" | "contains";

export type Order = "ascending" | "descending";
