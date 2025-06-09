/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2025-06-09 15:55:47.

export interface ConceptContextMap {
    id?: string;
    node?: string;
    value?: string;
    regex?: string;
    property?: string;
    context?: Context[];
}

export interface DataModelProperty extends Serializable {
    property?: TTIriRef;
    type?: TTIriRef;
    minInclusive?: string;
    minExclusive?: string;
    maxInclusive?: string;
    maxExclusive?: string;
    pattern?: string;
    inheritedFrom?: TTIriRef;
    order?: number;
}

export interface DownloadEntityOptions {
    entityIri?: string;
    format?: string;
    includeHasSubtypes?: boolean;
    includeInferred?: boolean;
    includeProperties?: boolean;
    includeMembers?: boolean;
    expandMembers?: boolean;
    expandSubsets?: boolean;
    includeTerms?: boolean;
    includeIsChildOf?: boolean;
    includeHasChildren?: boolean;
    includeInactive?: boolean;
}

/**
 * Class representing an IRI
 */
export interface EntityReferenceNode extends TTIriRef, Serializable {
    parents?: EntityReferenceNode[];
    children?: EntityReferenceNode[];
    moduleId?: string;
    hasChildren?: boolean;
    hasGrandChildren?: boolean;
    type?: TTArray;
    orderNumber?: number;
}

export interface Pageable<T> {
    totalCount?: number;
    currentPage?: number;
    pageSize?: number;
    result?: T[];
}

export interface CodeGenDto {
    name?: string;
    extension?: string;
    collectionWrapper?: string;
    datatypeMap?: { [index: string]: string };
    template?: string;
    complexTypes?: boolean;
}

export interface EditRequest {
    entity?: TTEntity;
    hostUrl?: string;
}

export interface GithubAuthorDTO {
    login?: string;
}

export interface GithubDTO {
    tag_name?: string;
    name?: string;
    body?: string;
    created_at?: string;
    published_at?: string;
    author?: GithubAuthorDTO;
}

export interface GithubRelease {
    version?: string;
    title?: string;
    createdDate?: string;
    publishedDate?: string;
    releaseNotes?: string[];
    author?: string;
    url?: string;
}

export interface ArrayButtons {
    up?: boolean;
    down?: boolean;
    plus?: boolean;
    minus?: boolean;
    addOnlyIfLast?: boolean;
}

export interface Binding {
    predicateBinding?: { [index: string]: string };
    predicateObject?: { [index: string]: Binding };
}

export interface Concept extends Entity {
    subClassOf?: TTIriRef[];
    code?: string;
    im1Id?: string;
    matchedFrom?: Concept[];
    usage?: number;
    codeId?: string;
    alternativeCode?: string;
    subsumedBy?: TTIriRef[];
}

export interface ConceptSet extends Entity {
    definition?: Query;
    hasMember?: TTIriRef[];
    usedIn?: TTIriRef[];
}

export interface Entity {
    iri?: string;
    type?: TTIriRef[];
    status?: TTIriRef;
    scheme?: TTIriRef;
    isContainedIn?: TTEntity[];
    name?: string;
    description?: string;
}

export interface FormGenerator {
    iri?: string;
    status?: TTIriRef;
    label?: string;
    comment?: string;
    targetShape?: TTIriRef;
    type?: TTIriRef[];
    isContainedIn?: TTEntity[];
    subClassOf?: TTIriRef[];
    scheme?: TTIriRef;
    property?: PropertyShape[];
}

export interface FunctionRequest {
    functionIri?: string;
    arguments?: Argument[];
    page?: Page;
}

export interface FunctionTemplate extends Entity {
    function?: TTIriRef;
    parameterTemplate?: ParameterTemplate[];
}

/**
 * Class representing an IRI
 */
export interface MapFunction extends TTIriRef {
    argument?: Argument[];
    conceptMap?: { [index: string]: string };
    defaultValue?: TTIriRef;
}

export interface ModelDocument {
    context?: TTContext;
    query?: QueryEntity[];
    folder?: Entity[];
    conceptSet?: ConceptSet[];
    function?: MapFunction[];
}

/**
 * Class representing an IRI
 */
export interface NodeShape extends TTIriRef {
    property?: PropertyShape[];
    subType?: TTIriRef[];
}

export interface Page {
    pageNumber?: number;
    pageSize?: number;
}

export interface ParameterShape {
    label?: string;
    type?: TTIriRef;
    parameterSubType?: TTIriRef[];
}

export interface ParameterTemplate extends Entity {
    label?: string;
    order?: number;
    valueTemplate?: ValueTemplate[];
}

/**
 * Class representing an IRI
 */
export interface PropertyRange extends TTIriRef {
    pattern?: string;
    intervalUnit?: TTIriRef;
    qualifier?: PropertyRange[];
    type?: TTIriRef;
    units?: TTIriRef;
    operator?: TTIriRef;
    relativeValue?: boolean;
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
    datatype?: PropertyRange;
    node?: PropertyRange;
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
    group?: TTIriRef;
    property?: PropertyShape[];
    clazz?: PropertyRange;
    validationErrorMessage?: string;
    function?: TTIriRef;
    parameter?: ParameterShape[];
    valueIri?: TTIriRef;
    expression?: NodeShape;
    arrayButtons?: ArrayButtons;
    hasValue?: any;
    hasValueType?: TTIriRef;
    definition?: string;
    ascending?: string;
    descending?: string;
    orderable?: boolean;
}

export interface SetContent {
    name?: string;
    description?: string;
    status?: string;
    version?: number;
    setDefinition?: string;
    subsets?: string[];
    concepts?: Concept[];
}

export interface TransformRequest {
    transformMap?: TTIriRef;
    sourceFormat?: string;
    targetFormat?: string;
    source?: { [index: string]: any[] };
}

export interface ValueTemplate extends Entity {
    label?: string;
    parameter?: string;
    order?: number;
    valueType?: TTIriRef;
    defaultValue?: any;
    valueOption?: any[];
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
    valueLabel?: string;
    qualifier?: string;
    unit?: TTIriRef;
    operator?: Operator;
    valueParameter?: string;
}

export interface BoolGroup<T> {
    or?: T[];
    and?: T[];
    not?: T[];
}

export interface Case {
    when?: When[];
    else?: string;
}

export interface ContextMap {
    context?: { [index: string]: string };
}

export interface Delete {
    property?: Where;
    subject?: Element;
    inverse?: boolean;
    predicate?: Element;
    object?: Element;
    delete?: Delete[];
}

export interface ECLStatus {
    valid?: boolean;
    line?: number;
    offset?: number;
    message?: string;
}

export interface Element extends IriLD, Entailment {
    parameter?: string;
    variable?: string;
    ancestorsOrSelfOf?: boolean;
    childOrSelfOf?: boolean;
    childOf?: boolean;
    parentOrSelfOf?: boolean;
    parentOf?: boolean;
    nodeRef?: string;
}

export interface Entailment {
    memberOf?: boolean;
    descendantsOf?: boolean;
    ancestorsOf?: boolean;
    descendantsOrSelfOf?: boolean;
}

export interface FunctionClause extends Value {
    name?: Function;
    argument?: Argument[];
    range?: Range;
}

export interface GroupBy extends IriLD {
    nodeRef?: string;
    valueRef?: string;
    propertyRef?: string;
}

export interface Instance extends IriLD {
    entailment?: TTIriRef;
}

export interface IriLD {
    iri?: string;
    qualifier?: string;
    name?: string;
    description?: string;
    uuid?: string;
}

export interface Match extends IriLD, BoolGroup<Match> {
    ifTrue?: RuleAction;
    ifFalse?: RuleAction;
    nodeRef?: string;
    typeOf?: Node;
    instanceOf?: Node[];
    and?: Match[];
    or?: Match[];
    not?: Match[];
    where?: Where;
    graph?: Element;
    orderBy?: OrderLimit;
    optional?: boolean;
    aggregate?: FunctionClause;
    variable?: string;
    parameter?: string;
    path?: Path[];
    function?: FunctionClause;
    entailment?: Entail;
    baseRule?: boolean;
    hasLinked?: boolean;
    union?: boolean;
    ruleNumber?: number;
    inverse?: boolean;
    then?: Match;
    rule?: Match[];
    return?: Return;
    returx?: Return;
    isUnion?: boolean;
}

export interface Node extends Element {
    type?: string;
    exclude?: boolean;
    code?: string;
    inverse?: boolean;
}

export interface OrderDirection extends RelativeTo {
    direction?: Order;
}

export interface OrderLimit {
    property?: OrderDirection[];
    limit?: number;
    description?: string;
}

export interface Path extends Element {
    inverse?: boolean;
    optional?: boolean;
    typeOf?: Node;
    path?: Path[];
}

export interface PathDocument {
    match?: Match[];
}

/**
 * Class representing an IRI
 */
export interface PathQuery extends TTIriRef {
    source?: TTIriRef;
    target?: TTIriRef;
    depth?: number;
}

export interface Prefix {
    prefix?: string;
    namespace?: string;
}

export interface Query extends Match {
    activeOnly?: boolean;
    groupBy?: GroupBy[];
    dataSet?: Query[];
    prefixes?: Prefix[];
    imQuery?: boolean;
    parentResult?: any;
    persistentIri?: TTIriRef;
}

export interface QueryEntity extends Entity {
    definition?: Query;
}

export interface QueryException extends Exception {
}

export interface QueryRequest extends ContextMap {
    textSearch?: string;
    argument?: Argument[];
    referenceDate?: string;
    query: Query;
    pathQuery?: PathQuery;
    update?: Update;
    name?: string;
    page?: Page;
    askIri?: string;
    timings?: { [index: string]: string }[];
    cohort?: TTIriRef[];
    includeNames?: boolean;
    textSearchStyle?: TextSearchStyle;
}

export interface Range {
    from: Value;
    to: Value;
}

export interface RelativeTo extends Node {
    valueVariable?: string;
    propertyRef?: string;
}

export interface Return {
    nodeRef?: string;
    function?: FunctionClause;
    property?: ReturnProperty[];
    as?: string;
    valueRef?: string;
    propertyRef?: string;
}

export interface ReturnProperty {
    iri?: string;
    name?: string;
    function?: FunctionClause;
    as?: string;
    nodeRef?: string;
    propertyRef?: string;
    value?: string;
    valueRef?: string;
    inverse?: boolean;
    unit?: string;
    dataType?: TTIriRef;
    description?: string;
    match?: Match[];
    boolMatch?: Bool;
    case?: Case;
    return?: Return;
}

/**
 * Class representing an IRI
 */
export interface Update extends TTIriRef {
    match?: Match[];
    delete?: Delete[];
}

export interface Value extends Assignable {
}

export interface When {
    where?: Where;
    then?: string;
    exists?: boolean;
    case?: Case;
}

export interface Where extends Element, Assignable, BoolGroup<Where> {
    range?: Range;
    isNull?: boolean;
    relativeTo?: RelativeTo;
    anyRoleGroup?: boolean;
    typeOf?: Node;
    is?: Node[];
    notIs?: Node[];
    not?: Where[];
    isNotNull?: boolean;
    function?: FunctionClause;
    valueVariable?: string;
    inverse?: boolean;
    or?: Where[];
    and?: Where[];
}

export interface DownloadByQueryOptions {
    queryRequest?: QueryRequest;
    eclSearchRequest?: EclSearchRequest;
    totalCount?: number;
    format?: string;
    includeDefinition?: boolean;
    includeCore?: boolean;
    includeLegacy?: boolean;
    includeSubsets?: boolean;
    subsetsOnOwnRow?: boolean;
    im1id?: boolean;
}

export interface EntityDocument {
    id?: number;
    iri?: string;
    name?: string;
    length?: number;
    preferredName?: string;
    code?: string;
    alternativeCode?: string;
    scheme?: TTIriRef;
    type?: TTIriRef[];
    status?: TTIriRef;
    termCode?: SearchTermCode[];
    usageTotal?: number;
    match?: string;
    isA?: TTIriRef[];
    memberOf?: TTIriRef[];
    subsumptionCount?: number;
    binding?: string[];
    isDescendentOf?: TTIriRef[];
}

export interface Filter {
    field?: string;
    iriValue?: TTIriRef[];
    and?: Filter[];
    not?: boolean;
    textValue?: string[];
    startsWithTerm?: boolean;
}

export interface OrderBy {
    field?: string;
    direction?: Order;
    iriValue?: TTIriRef[];
    and?: OrderBy[];
    textValue?: string[];
    not?: boolean;
    startsWithTerm?: boolean;
}

export interface SearchBinding {
    path?: TTIriRef;
    node?: TTIriRef;
}

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
     * List of binding node and path IRI's
     */
    bindingFilter?: SearchBinding[];
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
    orderBy?: OrderBy[];
    filter?: Filter[];
    timings?: { [index: string]: string }[];
}

export interface SearchResponse {
    page?: number;
    count?: number;
    totalCount?: number;
    highestUsage?: number;
    term?: string;
    entities?: SearchResultSummary[];
}

export interface SearchResultSummary {
    name?: string;
    code?: string;
    description?: string;
    status: TTIriRef;
    scheme: TTIriRef;
    type: TTIriRef[];
    usageTotal?: number;
    bestMatch?: string;
    preferredName?: string;
    key?: string[];
    isA?: TTIriRef[];
    termCode?: SearchTermCode[];
    unit?: TTIriRef[];
    qualifier?: TTIriRef[];
    iri: string;
}

export interface SearchTermCode extends Comparable<SearchTermCode> {
    term?: string;
    code?: string;
    status?: TTIriRef;
    length?: number;
    keyTerm?: string;
}

export interface EclSearchRequest {
    eclQuery?: Query;
    includeLegacy?: boolean;
    limit?: number;
    statusFilter?: TTIriRef[];
    page?: number;
    size?: number;
    select?: string[];
}

export interface SetExportRequest {
    ownRow?: boolean;
    format?: string;
    options?: SetOptions;
}

export interface SetOptions {
    setIri?: string;
    schemes?: string[];
    includeIM1id?: boolean;
    subsumptions?: string[];
    includeDefinition?: boolean;
    includeCore?: boolean;
    includeLegacy?: boolean;
    includeSubsets?: boolean;
}

export interface TTDocument extends TTNode {
    graph?: TTIriRef;
    context?: TTContext;
    entities?: TTEntity[];
    crud?: TTIriRef;
    predicates?: { [index: string]: string };
    prefixes?: TTPrefix[];
}

export interface TTEntity extends TTNode, Serializable {
    context?: TTContext;
    crud?: TTIriRef;
    graph?: TTIriRef;
    name?: string;
    type?: TTArray;
    scheme?: TTIriRef;
    version?: number;
    description?: string;
    status?: TTIriRef;
    code?: string;
    prefixes?: TTPrefix[];
    types?: TTIriRef[];
}

export interface EntityValidationRequest {
    entity?: TTEntity;
    validationIri?: string;
}

export interface BugReport extends Task {
    product?: string;
    version?: string;
    module?: TaskModule;
    os?: OperatingSystem;
    osOther?: string;
    browser?: Browser;
    browserOther?: string;
    severity?: Severity;
    status?: Status;
    error?: string;
    description?: string;
    reproduceSteps?: string;
    expectedResult?: string;
    actualResult?: string;
}

export interface EntityApproval extends Task {
    entityIri?: TTIriRef;
    approvalType?: ApprovalType;
}

export interface RoleRequest extends Task {
    role?: UserRole;
}

export interface Task {
    id?: TTIriRef;
    createdBy?: string;
    type?: TaskType;
    state?: TaskState;
    assignedTo?: string;
    dateCreated?: Date;
    history?: TaskHistory[];
    hostUrl?: string;
}

/**
 * Structure containing search request parameters and filters
 */
export interface WorkflowRequest {
    page?: number;
    size?: number;
    userId?: string;
}

export interface WorkflowResponse {
    page?: number;
    count?: number;
    tasks?: Task[];
}

export interface TaskHistory {
    predicate?: string;
    originalObject?: string;
    newObject?: string;
    changeDate?: Date;
    modifiedBy?: string;
    dateTime?: Date;
}

export interface BNF {
}

export interface CODE_TEMPLATE {
}

export interface COMPONENT {
}

export interface CONFIG {
}

export interface EDITOR {
}

export interface FHIR {
}

export interface GRAPH {
}

export interface IM {
}

export interface IMQ {
}

export interface IM_FUNCTION {
}

export interface MAP {
}

export interface ODS {
}

export interface ORG {
}

export interface OWL {
}

export interface PRSB {
}

export interface QR {
}

export interface QUERY {
}

export interface RDF {
}

export interface RDFS {
}

export interface SHACL {
}

export interface SNOMED {
}

export interface USER {
}

export interface VALIDATION {
}

export interface WORKFLOW {
}

export interface XSD {
}

export interface Context {
    publisher?: string;
    system?: string;
    schema?: string;
    table?: string;
    field?: string;
}

/**
 * Class representing an IRI
 */
export interface TTIriRef extends TTValue, Serializable {
    name?: string;
    description?: string;
    iri: string;
}

export interface Serializable {
}

export interface TTArray extends Serializable {
    elements?: TTValue[];
    list?: boolean;
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
    className?: string;
    nativeMethod?: boolean;
}

export interface Exception extends Throwable {
}

export interface TTPrefix {
    iri?: string;
    prefix?: string;
    name?: string;
}

export interface TTNode extends TTValue, Serializable {
    iri?: string;
    predicateMap?: { [index: string]: TTArray };
}

export interface TTValue extends Serializable {
}

export interface Comparable<T> {
}

export const enum ListMode {
    ALL = "ALL",
    FIRST = "FIRST",
    REST = "REST",
}

export const enum TargetUpdateMode {
    REPLACE = "REPLACE",
    APPEND = "APPEND",
    ADDTOLIST = "ADDTOLIST",
}

export const enum Aggregate {
    SUM = "SUM",
    COUNT = "COUNT",
    AVERAGE = "AVERAGE",
    MIN = "MIN",
    MAX = "MAX",
}

export const enum Bool {
    and = "and",
    or = "or",
    not = "not",
    rule = "rule",
}

export const enum Comparison {
    eq = "eq",
    gte = "gte",
    gt = "gt",
    lte = "lte",
    lt = "lt",
}

export const enum DisplayMode {
    ORIGINAL = "ORIGINAL",
    RULES = "RULES",
    LOGICAL = "LOGICAL",
}

export const enum EclType {
    refined = "refined",
    compound = "compound",
    simple = "simple",
}

export const enum Entail {
    descendantsOrSelfOf = "descendantsOrSelfOf",
    memberOf = "memberOf",
    descendantsOf = "descendantsOf",
    ancestorsOf = "ancestorsOf",
    equal = "equal",
}

export const enum Function {
    sum = "sum",
    count = "count",
    average = "average",
    timeDifference = "timeDifference",
    concatenate = "concatenate",
}

export const enum Operator {
    eq = "=",
    gte = ">=",
    gt = ">",
    lte = "<=",
    lt = "<",
    start = "startsWith",
    contains = "contains",
}

export const enum Order {
    ascending = "ascending",
    descending = "descending",
}

export const enum OrderableDate {
    latest = "latest",
    earliest = "earliest",
}

export const enum OrderableNumber {
    highest = "highest",
    lowest = "lowest",
}

export const enum QueryType {
    POP = "POP",
    LIST = "LIST",
    AGGREGATE_REPORT = "AGGREGATE_REPORT",
}

export const enum RuleAction {
    SELECT = "SELECT",
    REJECT = "REJECT",
    NEXT = "NEXT",
}

export const enum TextSearchStyle {
    autocomplete = "autocomplete",
    fuzzy = "fuzzy",
    multiword = "multiword",
    ngram = "ngram",
    exact = "exact",
}

export const enum VarType {
    NODE = "NODE",
    PATH = "PATH",
    LITERAL = "LITERAL",
}

export const enum Browser {
    CHROME = "CHROME",
    FIREFOX = "FIREFOX",
    EDGE = "EDGE",
    IE = "IE",
    OTHER = "OTHER",
}

export const enum OperatingSystem {
    WINDOWS = "WINDOWS",
    MACOS = "MACOS",
    LINUX = "LINUX",
    OTHER = "OTHER",
}

export const enum Severity {
    CRITICAL = "CRITICAL",
    MAJOR = "MAJOR",
    MINOR = "MINOR",
    TRIVIAL = "TRIVIAL",
    ENHANCEMENT = "ENHANCEMENT",
    UNASSIGNED = "UNASSIGNED",
}

export const enum Status {
    NEW = "NEW",
    FIXED = "FIXED",
    ASSIGNED = "ASSIGNED",
    VERIFIED = "VERIFIED",
    REOPENED = "REOPENED",
    WONT_FIX = "WONT_FIX",
}

export const enum TaskModule {
    DIRECTORY = "DIRECTORY",
    QUERY = "QUERY",
    CREATOR = "CREATOR",
    EDITOR = "EDITOR",
    UPRN = "UPRN",
    AUTH = "AUTH",
}

export const enum ApprovalType {
    EDIT = "EDIT",
    CREATE = "CREATE",
}

export const enum UserRole {
    ADMIN = "ADMIN",
    DEVELOPER = "DEVELOPER",
    PUBLISHER = "PUBLISHER",
    CREATOR = "CREATOR",
    EDITOR = "EDITOR",
    TASK_MANAGER = "TASK_MANAGER",
    AUTHORISER = "AUTHORISER",
    APPROVER = "APPROVER",
}

export const enum TaskState {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    APPROVED = "APPROVED",
    COMPLETE = "COMPLETE",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    UNDER_REVIEW = "UNDER_REVIEW",
}

export const enum TaskType {
    BUG_REPORT = "BUG_REPORT",
    ROLE_REQUEST = "ROLE_REQUEST",
    ENTITY_APPROVAL = "ENTITY_APPROVAL",
}
