/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2025-08-15 08:49:38.

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
    hasValueSet?: TTIriRef;
    definingProperty?: boolean;
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

export interface ArgumentReference {
    parameter?: string;
    referenceIri?: TTIriRef;
    dataType?: TTIriRef;
}

export interface Assignable {
    value?: string;
    unit?: TTIriRef;
    valueLabel?: string;
    valueParameter?: string;
    qualifier?: string;
    operator?: Operator;
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

export interface ECLQueryRequest {
    ecl?: string;
    query?: Query;
    showNames?: boolean;
    status?: ECLStatus;
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
    invalid?: boolean;
}

export interface Entailment {
    memberOf?: boolean;
    ancestorsOf?: boolean;
    descendantsOf?: boolean;
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

export interface HasPaths {
    path?: Path[];
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

export interface Match extends IriLD, BoolGroup<Match>, HasPaths {
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
    optional?: boolean;
    aggregate?: FunctionClause;
    variable?: string;
    parameter?: string;
    function?: FunctionClause;
    entailment?: Entail;
    baseRule?: boolean;
    union?: boolean;
    ruleNumber?: number;
    inverse?: boolean;
    then?: Match;
    rule?: Match[];
    libraryItem?: string;
    invalid?: boolean;
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

export interface Path extends Element, HasPaths {
    inverse?: boolean;
    optional?: boolean;
    typeOf?: Node;
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
    subquery?: Query;
    bindAs?: string;
}

export interface QueryEntity extends Entity {
    definition?: Query;
}

export interface QueryException extends Exception {
}

export interface Range {
    from: Value;
    to: Value;
}

export interface RelativeTo extends Node {
    valueVariable?: string;
    propertyRef?: string;
}

export interface RequeueQueryRequest {
    queueId?: string;
    queryRequest?: QueryRequest;
}

export interface Return {
    nodeRef?: string;
    function?: FunctionClause;
    property?: ReturnProperty[];
    as?: string;
    valueRef?: string;
    propertyRef?: string;
    orderBy?: OrderLimit;
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
    roleGroup?: boolean;
    isNotNull?: boolean;
    function?: FunctionClause;
    valueVariable?: string;
    inverse?: boolean;
    or?: Where[];
    and?: Where[];
    shortLabel?: string;
}

export interface DBEntry {
    id?: string;
    queryIri?: string;
    queryName?: string;
    queryRequest?: QueryRequest;
    userId?: string;
    userName?: string;
    queuedAt?: Date;
    startedAt?: Date;
    pid?: number;
    finishedAt?: Date;
    killedAt?: Date;
    status?: QueryExecutorStatus;
    queryResult?: string;
    error?: string;
}

export interface CognitoGroupRequest {
    username?: string;
    groupName?: UserRole;
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

export interface EditRequest {
    entity?: TTEntity;
    hostUrl?: string;
    graph?: Graph;
    crud?: string;
}

export interface EntityValidationRequest {
    entity?: TTEntity;
    validationIri?: string;
    graph?: Graph;
}

export interface FileDocumentRequest {
    document?: TTDocument;
    insertGraph?: Graph;
}

export interface FunctionRequest {
    functionIri?: string;
    arguments?: Argument[];
    page?: Page;
    graph?: Graph;
}

export interface MatchDisplayRequest {
    match?: Match;
    graph?: Graph;
}

export interface QueryDisplayRequest {
    query?: Query;
    displayMode?: DisplayMode;
    graph?: TTIriRef;
}

export interface QueryRequest extends ContextMap {
    textSearch?: string;
    argument?: Argument[];
    query: Query;
    pathQuery?: PathQuery;
    update?: Update;
    name?: string;
    page?: Page;
    queryStringDefinition?: string;
    askIri?: string;
    timings?: { [index: string]: string }[];
    cohort?: TTIriRef[];
    includeNames?: boolean;
    textSearchStyle?: TextSearchStyle;
    language?: DatabaseOption;
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

export interface SetDistillationRequest {
    conceptList?: TTIriRef[];
    graph?: Graph;
}

export interface SetExportRequest {
    ownRow?: boolean;
    format?: string;
    options?: SetOptions;
}

export interface SuperiorPropertiesBoolFocusPagedRequest {
    ecl?: string;
    page?: number;
    size?: number;
    schemeFilters?: string[];
    inactive?: boolean;
}

export interface TransformRequest {
    transformMap?: TTIriRef;
    sourceFormat?: string;
    targetFormat?: string;
    source?: { [index: string]: any[] };
}

export interface ValidatedEntitiesRequest {
    snomedCodes?: string[];
}

/**
 * Structure containing search request parameters and filters
 */
export interface WorkflowRequest {
    page?: number;
    size?: number;
    userId?: string;
}

export interface EntityValidationResponse {
    valid?: boolean;
    message?: string;
}

export interface OdsResponse {
    Organisation?: Organisation;
    Roles?: OrgRole[];
}

export interface SearchResponse {
    page?: number;
    count?: number;
    totalCount?: number;
    highestUsage?: number;
    term?: string;
    entities?: SearchResultSummary[];
}

export interface WorkflowResponse {
    page?: number;
    count?: number;
    tasks?: Task[];
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
    context?: TTContext;
    entities?: TTEntity[];
    crud?: TTIriRef;
    predicates?: { [index: string]: string };
    prefixes?: TTPrefix[];
}

export interface TTEntity extends TTNode, Serializable {
    context?: TTContext;
    crud?: TTIriRef;
    type?: TTArray;
    name?: string;
    scheme?: TTIriRef;
    version?: number;
    description?: string;
    status?: TTIriRef;
    code?: string;
    types?: TTIriRef[];
    prefixes?: TTPrefix[];
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

export interface GraphRequest extends Task {
    graph?: Graph;
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

export interface TaskHistory {
    predicate?: string;
    originalObject?: string;
    newObject?: string;
    changeDate?: Date;
    modifiedBy?: string;
    dateTime?: Date;
}

export interface VocabEnum {
}

export interface VocabUtils {
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
    prefixes?: TTPrefix[];
    nameSpaces?: TTPrefix[];
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

export interface Organisation {
    Name?: string;
    OrgId?: OrgId;
    Status?: string;
    orgRecordClass?: string;
    GeoLoc?: OrgGeoLocation;
    Roles?: OrgRoles;
    Rels?: OrgRelationships;
}

export interface OrgRole {
    id?: string;
    Status?: string;
    code?: string;
    displayName?: string;
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

export interface OrgId {
    extension?: string;
}

export interface OrgGeoLocation {
    Location?: OrgLocation;
}

export interface OrgRoles {
    Role?: OrgRole[];
}

export interface OrgRelationships {
    Rel?: OrgRelationship[];
}

export interface Comparable<T> {
}

export interface OrgLocation {
    AddrLn1?: string;
    AddrLn2?: string;
    AddrLn3?: string;
    Town?: string;
    County?: string;
    PostCode?: string;
    Country?: string;
    UPRN?: string;
}

export interface OrgRelationship {
    Status?: string;
    Target?: OrgRelTarget;
    id?: string;
}

export interface OrgRelTarget {
    OrgId?: OrgId;
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

export const enum DatabaseOption {
    MYSQL = "MYSQL",
    POSTGRESQL = "POSTGRESQL",
    GRAPHDB = "GRAPHDB",
}

export const enum DisplayMode {
    ORIGINAL = "ORIGINAL",
    RULES = "RULES",
    LOGICAL = "LOGICAL",
}

export const enum ECLType {
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
    concatenate = "concatenate",
    max = "max",
    min = "min",
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

export const enum ValidationLevel {
    CONCEPT = "CONCEPT",
    ECL = "ECL",
}

export const enum VarType {
    NODE = "NODE",
    PATH = "PATH",
    LITERAL = "LITERAL",
}

export const enum QueryExecutorStatus {
    QUEUED = "QUEUED",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ERRORED = "ERRORED",
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
    GRAPH_REQUEST = "GRAPH_REQUEST",
    ENTITY_APPROVAL = "ENTITY_APPROVAL",
}

export const enum BNF {
    DOMAIN = "http://bnf.info/",
}

export const enum COMPONENT {
    DOMAIN = "http://endhealth.info/im#",
    TAB_LAYOUT = "http://endhealth.info/im#Component_TabLayout",
    TEXT_DISPLAY = "http://endhealth.info/im#Component_textDisplay",
    TEXT_INPUT = "http://endhealth.info/im#Component_textInput",
    HTML_INPUT = "http://endhealth.info/im#Component_htmlInput",
    ENTITY_MULTI_SEARCH = "http://endhealth.info/im#Component_entityMultiSearch",
    ENTITY_SEARCH = "http://endhealth.info/im#Component_entitySearch",
    ENTITY_COMBOBOX = "http://endhealth.info/im#Component_entityComboBox",
    ENTITY_DROPDOWN = "http://endhealth.info/im#Component_entityDropdown",
    ARRAY_BUILDER = "http://endhealth.info/im#Component_arrayBuilder",
    ENTITY_AUTO_COMPLETE = "http://endhealth.info/im#Component_entityAutoComplete",
    MEMBERS_BUILDER = "http://endhealth.info/im#Component_membersBuilder",
    COMPONENT_GROUP = "http://endhealth.info/im#Component_componentGroup",
    PROPERTY_BUILDER = "http://endhealth.info/im#Component_propertyBuilder",
    SET_DEFINITION_BUILDER = "http://endhealth.info/im#Component_SetDefinitionBuilder",
    QUERY_DEFINITION_BUILDER = "http://endhealth.info/im#Component_QueryDefinitionBuilder",
    TOGGLEABLE = "http://endhealth.info/im#Component_ToggleableComponent",
    HORIZONTAL_LAYOUT = "http://endhealth.info/im#Component_HorizontalLayout",
    VERTICAL_LAYOUT = "http://endhealth.info/im#Component_VerticalLayout",
    DROPDOWN_TEXT_INPUT_CONCATENATOR = "http://endhealth.info/im#Component_dropdownTextInputConcatenator",
    ROLE_GROUP_BUILDER = "http://endhealth.info/im#Component_roleGroupBuilder",
    TERM_CODE_EDITOR = "http://endhealth.info/im#Component_termCodeEditor",
    TEXT_DROPDOWN = "http://endhealth.info/im#Component_textDropdown",
    ENTITY_DISPLAY = "http://endhealth.info/im#Component_entityDisplay",
    IRI_BUILDER = "http://endhealth.info/im#Component_iriBuilder",
    AUTOCOMPLETE_SEARCH_BAR_WRAPPER = "http://endhealth.info/im#Component_autocompleteSearchBarWrapper",
    SUBSET_BUILDER = "http://endhealth.info/im#Component_subsetBuilder",
}

export const enum CONFIG {
    DOMAIN = "http://endhealth.info/",
    PREFIX = "cfg",
    LABEL = "http://www.w3.org/2000/01/rdf-schema#label",
    HAS_CONFIG = "http://endhealth.info/im#hasConfig",
    COMMENT = "http://www.w3.org/2000/01/rdf-schema#comment",
    IMDIRECTORY_LATEST_RELEASE = "http://endhealth.info/config#IMDirectoryLatestRelease",
    IMDIRECTORY_ALL_RELEASES = "http://endhealth.info/config#IMDirectoryAllReleases",
    MONITORING = "http://endhealth.info/config#monitoring",
}

export const enum CodeTemplate {
    DOMAIN = "http://endhealth.info/",
    PREFIX = "cTemp",
    WRAPPER = "http://endhealth.info/codeTemplate#wrapper",
    LABEL = "http://www.w3.org/2000/01/rdf-schema#label",
    DEFINITION = "http://endhealth.info/im#definition",
    TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    DATATYPE_MAP = "http://endhealth.info/codeTemplate#datatypeMap",
    EXTENSION = "http://endhealth.info/codeTemplate#extension",
    INCLUDE_COMPLEX_TYPES = "http://endhealth.info/codeTemplate#includeComplexTypes",
}

export const enum EDITOR {
    DOMAIN = "http://endhealth.info/im#",
    CONCEPT_SHAPE = "http://endhealth.info/im#Editor_ConceptShape",
    CONCEPT_SET_SHAPE = "http://endhealth.info/im#Editor_ConceptSetShape",
    VALUE_SET_SHAPE = "http://endhealth.info/im#Editor_ValueSetShape",
    FOLDER_SHAPE = "http://endhealth.info/im#Editor_FolderShape",
    DATA_MODEL_SHAPE = "http://endhealth.info/im#Editor_DataModelShape",
    COHORT_QUERY_SHAPE = "http://endhealth.info/im#Editor_CohortQueryShape",
    PROPERTY_SHAPE = "http://endhealth.info/im#Editor_PropertyShape",
}

export const enum EntityType {
    QUERY = "http://endhealth.info/im#Query",
    NODESHAPE = "http://www.w3.org/ns/shacl#NodeShape",
}

export const enum FHIR {
    PREFIX = "fhir",
    DSTU2 = "http://hl7.org/2-0/fhir/StructureDefinition#",
    VALUESET_FOLDER = "http://endhealth.info/im#VSET_FHIR",
}

export const enum Graph {
    IM = "http://endhealth.info/im#",
    PROV = "http://endhealth.info/prov#",
    USER = "http://endhealth.info/user#",
    WORKFLOW = "http://endhealth.info/workflow#",
    CONFIG = "http://endhealth.info/config#",
    SMARTLIFE = "http://smartlifehealth.info/smh#",
}

export const enum IM {
    DOMAIN = "http://endhealth.info/",
    PREFIX = "im",
    DISPLAY_LABEL = "http://endhealth.info/im#displayLabel",
    HAS_SUBTYPES = "http://endhealth.info/im#hasSubtypes",
    HAS_VALUESET = "http://endhealth.info/im#hasValueSet",
    VALUE_SET = "http://endhealth.info/im#ValueSet",
    DESCENDANTS_OR_SELF_OF = "http://endhealth.info/im#DescendantsOrSelfOf",
    DESCENDANTS_OF = "http://endhealth.info/im#DescendantsOf",
    IS_RELATIVE_VALUE = "http://endhealth.info/im#isRelativeValue",
    FULLY_SPECIFIED_NAME = "http://endhealth.info/im#fullySpecifiedName",
    ANCESTORS_OF = "http://endhealth.info/im#AncestorsOf",
    ENTAILED_MEMBER = "http://endhealth.info/im#entailedMember",
    ENTAILMENT = "http://endhealth.info/im#entailment",
    EXCLUDE = "http://endhealth.info/im#exclude",
    IRI = "iri",
    VALUE = "value",
    TYPE = "type",
    ID = "http://endhealth.info/im#id",
    RELATIONSHIP_TYPE = "http://endhealth.info/im#relationshipType",
    CODE = "http://endhealth.info/im#code",
    KEY_TERM = "http://endhealth.info/im#keyTerm",
    PREFERRED_NAME = "http://endhealth.info/im#preferredName",
    HAS_SCHEME = "http://endhealth.info/im#scheme",
    BINDING = "http://endhealth.info/im#binding",
    HAS_STATUS = "http://endhealth.info/im#status",
    STATUS = "http://endhealth.info/im#Status",
    CONTENT_TYPE = "http://endhealth.info/im#contentType",
    USAGE_STATS = "http://endhealth.info/im#usageStats",
    IN_TASK = "http://endhealth.info/im#inTask",
    DEFINITION = "http://endhealth.info/im#definition",
    INSTANCE_OF = "http://endhealth.info/im#instanceOf",
    RETURN_TYPE = "http://endhealth.info/im#returnType",
    UPDATE_PROCEDURE = "http://endhealth.info/im#updateProcedure",
    INVERSE_PATH = "http://endhealth.info/im#inversePath",
    CONCEPT = "http://endhealth.info/im#Concept",
    CONCEPT_PROPERTY = "http://endhealth.info/im#concept",
    CONCEPT_SET = "http://endhealth.info/im#ConceptSet",
    FOLDER = "http://endhealth.info/im#Folder",
    VALUESET = "http://endhealth.info/im#ValueSet",
    TEXT_MAPS = "http://endhealth.info/im#TextMaps",
    CONFIG = "http://endhealth.info/im#Config",
    NAMESPACE = "http://endhealth.info/im#Namespace",
    FUNCTION = "http://endhealth.info/im#FunctionClause",
    QUERY = "http://endhealth.info/im#Query",
    COHORT_QUERY = "http://endhealth.info/im#CohortQuery",
    DEFAULT_COHORTS = "http://endhealth.info/im#Q_DefaultCohorts",
    DATASET_QUERY = "http://endhealth.info/im#DatasetQuery",
    DATA_UPDATE = "http://endhealth.info/im#DataUpdate",
    PATH_QUERY = "http://endhealth.info/im#PathQuery",
    PATH_TO = "http://endhealth.info/im#pathTo",
    OPENSEARCH_QUERY = "http://endhealth.info/im#OpenSearchQuery",
    DATAMODEL_PROPERTY = "http://endhealth.info/im#dataModelProperty",
    ONTOLOGY_PARENT_FOLDER = "http://endhealth.info/im#HealthModelOntology",
    CONCEPT_SET_PARENT_FOLDER = "http://endhealth.info/im#QueryConceptSets",
    PROPERTIES_FOLDER = "http://endhealth.info/im#Properties",
    TASK = "http://endhealth.info/im#Task",
    FIELD_GROUP = "http://endhealth.info/im#FieldGroup",
    MATCH_CLAUSE = "http://endhealth.info/im#MatchClause",
    FORM_GENERATOR = "http://endhealth.info/im#FormGenerator",
    FUNCTION_PROPERTY = "http://endhealth.info/im#functionProperty",
    MAP_GRAPH = "http://endhealth.info/im#GraphMap",
    MAP_ENTITY = "http://endhealth.info/im#EntityMap",
    SET = "http://endhealth.info/im#Set",
    IS_CONTAINED_IN = "http://endhealth.info/im#isContainedIn",
    HAS_MEMBER_PARENT = "http://endhealth.info/im#hasMemberParent",
    FUNCTION_TEMPLATE = "http://endhealth.info/im#functionTemplate",
    ONE_OF = "http://endhealth.info/im#oneOf",
    COMBINATION_OF = "http://endhealth.info/im#combinationOf",
    USE_PREDICATES = "http://endhealth.info/im#usePredicates",
    SOME_OF = "http://endhealth.info/im#someOf",
    HAS_CHILDREN = "http://endhealth.info/im#hasChildren",
    IS_A = "http://endhealth.info/im#isA",
    CONTEXT_ORDER = "http://endhealth.info/im#contextOrder",
    CONTEXT = "http://endhealth.info/im#context",
    IS_CHILD_OF = "http://endhealth.info/im#isChildOf",
    PREVIOUS_ENTITY_OF = "http://endhealth.info/im#previousEntityOf",
    SUBSUMED_BY = "http://endhealth.info/im#subsumedBy",
    MAY_BE_SUBSUMED_BY = "http://endhealth.info/im#mayBeSubsumedBy",
    APPROXIMATE_SUBSUMED_BY = "http://endhealth.info/im#approximateSubsumedBy",
    LOCAL_SUBCLASS_OF = "http://endhealth.info/im#localSubClassOf",
    HAS_CONFIG = "http://endhealth.info/im#hasConfig",
    PROPERTY_GROUP = "http://endhealth.info/im#propertyGroup",
    INHERITED_FROM = "http://endhealth.info/im#inheritedFrom",
    GROUP_NUMBER = "http://endhealth.info/im#groupNumber",
    ROLE_GROUP = "http://endhealth.info/im#roleGroup",
    ROLE = "http://endhealth.info/im#role",
    HAS_INHERITED_PROPERTIES = "http://endhealth.info/im#hasInheritedProperties",
    DRAFT = "http://endhealth.info/im#Draft",
    ACTIVE = "http://endhealth.info/im#Active",
    INACTIVE = "http://endhealth.info/im#Inactive",
    DEFINITIONAL_STATUS = "http://endhealth.info/im#definitionalStatus",
    SUFFICIENTLY_DEFINED = "http://endhealth.info/im#1251000252106",
    NECESSARY_NOT_SUFFICIENT = "http://endhealth.info/im#2771000252102",
    UNASSIGNED = "http://endhealth.info/im#Unassigned",
    HAS_MAP = "http://endhealth.info/im#hasMap",
    ENTITY_MAP = "http://endhealth.info/im#entityMap",
    MAPPED_TO = "http://endhealth.info/im#mappedTo",
    HAS_NUMERIC = "http://endhealth.info/im#hasNumericValue",
    SOURCE_TEXT = "http://endhealth.info/im#sourceText",
    TARGET_TEXT = "http://endhealth.info/im#targetText",
    HAS_TERM_CODE = "http://endhealth.info/im#hasTermCode",
    ALTERNATIVE_CODE = "http://endhealth.info/im#alternativeCode",
    DESCRIPTION_ID = "http://endhealth.info/im#descriptionId",
    CODE_ID = "http://endhealth.info/im#codeId",
    MATCHED_TO = "http://endhealth.info/im#matchedTo",
    MAP_PRIORITY = "http://endhealth.info/im#mapPriority",
    ASSURANCE_LEVEL = "http://endhealth.info/im#assuranceLevel",
    MAP_ADVICE = "http://endhealth.info/im#mapAdvice",
    NATIONALLY_ASSURED = "http://endhealth.info/im#NationallyAssuredUK",
    SUPPLIER_ASSURED = "http://endhealth.info/im#SupplierAssured",
    HAS_MEMBER = "http://endhealth.info/im#hasMember",
    IS_MEMBER_OF = "http://endhealth.info/im#isMemberOf",
    IS_SUBSET_OF = "http://endhealth.info/im#isSubsetOf",
    HAS_SUBSET = "http://endhealth.info/im#hasSubset",
    SOURCE_CONTEXT = "http://endhealth.info/im#sourceContext",
    SOURCE_CONTEXT_TYPE = "http://endhealth.info/im#SourceContext",
    SOURCE_PUBLISHER = "http://endhealth.info/im#sourcePublisher",
    SOURCE_SYSTEM = "http://endhealth.info/im#sourceSystem",
    SOURCE_SCHEMA = "http://endhealth.info/im#sourceSchema",
    SOURCE_TABLE = "http://endhealth.info/im#sourceTable",
    SOURCE_FIELD = "http://endhealth.info/im#sourceField",
    SOURCE_CODE_SCHEME = "http://endhealth.info/im#sourceCodeScheme",
    SOURCE_VALUE = "http://endhealth.info/im#sourceValue",
    SOURCE_REGEX = "http://endhealth.info/im#sourceRegex",
    SOURCE_HEADING = "http://endhealth.info/im#sourceHeading",
    TARGET_PROPERTY = "http://endhealth.info/im#targetProperty",
    CONTEXT_NODE = "http://endhealth.info/im#contextNode",
    REPLACE_ALL_PREDICATES = "http://endhealth.info/im#ReplaceAllPredicates",
    ADD_QUADS = "http://endhealth.info/im#AddQuads",
    UPDATE_PREDICATES = "http://endhealth.info/im#UpdatePredicates",
    DELETE_ALL = "http://endhealth.info/im#DeleteAll",
    PROV_CREATION = "http://endhealth.info/im#2001000252109",
    PROV_UPDATE = "http://endhealth.info/im#1661000252106",
    USED_IN = "http://endhealth.info/im#usedIn",
    IN_RESULT_SET = "http://endhealth.info/im#inResultSet",
    HAS_PROFILE = "http://endhealth.info/im#inResultSet",
    PROVENANCE_ACTIVITY = "http://endhealth.info/im#ProvenanceActivity",
    PROVENANCE_TARGET = "http://endhealth.info/im#provenanceTarget",
    PROVENANCE_ACTIVITY_TYPE = "http://endhealth.info/im#provenanceActivityType",
    PROVENANCE_AGENT = "http://endhealth.info/im#provenanceAgent",
    START_TIME = "http://endhealth.info/im#startTime",
    EFFECTIVE_DATE = "http://endhealth.info/im#effectiveDate",
    END_DATE = "http://endhealth.info/im#endDate",
    PROVENANCE_USED = "http://endhealth.info/im#usedEntity",
    AUTHOR_ROLE = "http://endhealth.info/im#1001911000252102",
    VERSION = "http://endhealth.info/im#version",
    HAS_ROLE_IN = "http://endhealth.info/im#hasRoleInOrganisation",
    IS_PERSON = "http://endhealth.info/im#isPerson",
    HAS_CONTEXT = "http://endhealth.info/im#hasContext",
    DISPLAY_ORDER = "http://endhealth.info/im#displayOrder",
    USAGE_TOTAL = "http://endhealth.info/im#usageTotal",
    DESCENDING = "http://endhealth.info/im#Descending",
    ASCENDING = "http://endhealth.info/im#Ascending",
    PLABEL = "http://endhealth.info/im#pLabel",
    OLABEL = "http://endhealth.info/im#oLabel",
    EXAMPLE = "http://endhealth.info/im#example",
    PRIVACY_LEVEL = "http://endhealth.info/im#privacyLevel",
    VALUE_SELECT = "http://endhealth.info/im#valueSelect",
    VALUE_VARIABLE = "http://endhealth.info/im#valueVariable",
    PLACEHOLDER = "http://endhealth.info/im#placeHolder",
    FUNCTION_DEFINITION = "http://endhealth.info/im#function",
    ADDRESS_CLASS = "http://endhealth.info/im#Address",
    ADDRESS = "http://endhealth.info/im#address",
    ADDRESS_LINE_1 = "http://endhealth.info/im#addressLine1",
    ADDRESS_LINE_2 = "http://endhealth.info/im#addressLine2",
    ADDRESS_LINE_3 = "http://endhealth.info/im#addressLine3",
    LOCALITY = "http://endhealth.info/im#locality",
    REGION = "http://endhealth.info/im#region",
    POST_CODE = "http://endhealth.info/im#postCode",
    COUNTRY = "http://endhealth.info/im#country",
    UPRN = "http://endhealth.info/im#uprn",
    ENTITY_TYPES = "http://endhealth.info/im#EntityTypes",
    CONCEPT_SET_GROUP = "http://endhealth.info/im#ConceptSetGroup",
    OLD_CODE = "http://endhealth.info/im#oldCode",
    ORDER = "http://endhealth.info/im#order",
    MAPPING_TASK = "http://endhealth.info/im#MappingTask",
    UPDATE_TASK = "http://endhealth.info/im#UpdateTask",
    MATCHED_FROM = "http://endhealth.info/im#matchedFrom",
    MAPPED_FROM = "http://endhealth.info/im#mappedFrom",
    SELECT = "http://endhealth.info/im#select",
    NATIONALLY_ASSURED_UK = "http://endhealth.info/im#NationallyAssuredUK",
    ENTITY = "http://endhealth.info/im#Entity",
    QUERY_SET = "http://endhealth.info/im#QuerySet",
    QUERY_TEMPLATE = "http://endhealth.info/im#QueryTemplate",
    RECORD_TYPE = "http://endhealth.info/im#RecordType",
    FEATURE = "http://endhealth.info/im#MatchClause",
    DATA_PROPERTY = "http://endhealth.info/im#DataProperty",
    ORGANISATION = "http://endhealth.info/im#Organisation",
    MODELLING_ENTITY_TYPE = "http://endhealth.info/im#ModellingEntityType",
    PROFILE = "http://endhealth.info/im#Profile",
    STATS_REPORT_ENTRY = "http://endhealth.info/im#hasStatsReportEntry",
    FAVOURITES = "http://endhealth.info/im#Favourites",
    MODULE_ONTOLOGY = "http://endhealth.info/im#DiscoveryOntology",
    MODULE_SETS = "http://endhealth.info/im#Sets",
    MODULE_DATA_MODEL = "http://endhealth.info/im#DiscoveryCommonDataModel",
    MODULE_CATALOGUE = "http://endhealth.info/im#Catalogue",
    MODULE_QUERIES = "http://endhealth.info/im#Q_Queries",
    MODULE_IM = "http://endhealth.info/im#InformationModel",
    MODULE_TASKS = "http://endhealth.info/im#Tasks",
    MODULE_FEATURES = "http://endhealth.info/im#M_MatchClauses",
    CONCEPT_CATEGORY = "http://endhealth.info/im#ontologyOverview",
    CONCEPT_TYPES = "http://endhealth.info/im#ontologyConceptTypes",
    CONCEPT_SCHEMES = "http://endhealth.info/im#ontologyConceptSchemes",
    CONCEPT_STATUS = "http://endhealth.info/im#ontologyConceptStatus",
    HAS_VALUE = "http://endhealth.info/im#hasValue",
    DATAMODEL_ENTITY = "http://endhealth.info/im#DataModelEntity",
    DATAMODEL_OBJECTPROPERTY = "http://endhealth.info/im#dataModelObjectProperty",
    DATAMODEL_DATAPROPERTY = "http://endhealth.info/im#dataModelDataProperty",
    DATAMODEL_FUNCTIONPROPERTY = "http://endhealth.info/im#functionProperty",
    BEST_MATCH = "http://endhealth.info/im#bestMatch",
    ENTITY_TYPE = "http://endhealth.info/im#entityType",
    VALUE_DATA = "http://endhealth.info/im#valueData",
    VALUE_OBJECT = "http://endhealth.info/im#valueObject",
    PREPOSITION = "http://endhealth.info/im#preposition",
    VALUE_IRI = "http://endhealth.info/im#valueIri",
    VALUE_IRI_LIST = "http://endhealth.info/im#valueIriList",
    VALUE_DATA_LIST = "http://endhealth.info/im#valueDataList",
    IM_1_ID = "http://endhealth.info/im#im1Id",
    PROV_ACTIVITY_TYPE = "http://endhealth.info/im#provenanceActivityType",
    FOLDER_VALUESETS = "http://endhealth.info/im#ValueSets",
    FOLDER_SETS = "http://endhealth.info/im#Sets",
    FOLDER_QUERY_CONCEPT_SETS = "http://endhealth.info/im#QueryConceptSets",
    DATE_OF_ENTRY = "http://endhealth.info/im#dateOfEntry",
    PARTICIPATION_TYPE = "http://endhealth.info/im#participationType",
    PERSON_IN_ROLE = "http://endhealth.info/im#personInRole",
    PROVENANCE_SOURCE_ENTITY = "http://endhealth.info/im#ProvenanceSourceEntity",
    DERIVATION_TYPE = "http://endhealth.info/im#derivationType",
    ENTITY_IDENTIFIER = "http://endhealth.info/im#entityIdentifier",
    CODE_TEMPLATE = "http://endhealth.info/im#codeTemplate",
    DATAMODEL_CLASSES = "http://endhealth.info/im#DataModelClasses",
    DATE_TIME = "http://endhealth.info/im#DateTime",
    TEMPLATE_NUMERIC_EVENT_ORDER = "http://endhealth.info/im#TEMPLATE_NumericEventOrder",
    ORDER_BY = "http://endhealth.info/im#OrderBy",
    PARAMETER_TEMPLATE = "http://endhealth.info/im#parameterTemplate",
    VALUE_TEMPLATE = "http://endhealth.info/im#valueTemplate",
    DEFAULT_VALUE = "http://endhealth.info/im#defaultValue",
    LOAD_MORE = "http://endhealth.info/im#loadMore",
    DATA_MODEL_PROPERTY_CONCEPT = "http://endhealth.info/im#concept",
    NUMERIC_VALUE = "http://endhealth.info/im#NumericValue",
    HEALTH_RECORDS = "http://endhealth.info/im#HealthRecords",
    HAS_INCREMENTAL_FROM = "http://endhealth.info/im#hasIncrementalFrom",
    CORE_SCHEMES = "http://endhealth.info/im#coreSchemes",
    INFERRED_PREDICATES = "http://endhealth.info/im#inferredPredicates",
    INFERRED_EXCLUDE_PREDICATES = "http://endhealth.info/im#inferredExcludePredicates",
    GRAPH_EXCLUDE_PREDICATES = "http://endhealth.info/im#graphExcludePredicates",
    AGE = "http://endhealth.info/im#Age",
    DATE = "http://endhealth.info/im#Date",
    TIME = "http://endhealth.info/im#Time",
    INTERVAL_UNIT = "http://endhealth.info/im#intervalUnit",
    PARAMETER = "http://endhealth.info/im#parameter",
    YEARS = "http://endhealth.info/im#Years",
    MONTHS = "http://endhealth.info/im#Months",
    DAYS = "http://endhealth.info/im#Days",
    HOURS = "http://endhealth.info/im#Hours",
    MINUTES = "http://endhealth.info/im#Minutes",
    SECONDS = "http://endhealth.info/im#Seconds",
    DATATYPE_QUALIFIER = "http://endhealth.info/im#datatypeQualifier",
    TYPE_FILTER_OPTIONS = "http://endhealth.info/im#TypeFilterOptions",
    SORT_FIELD_FILTER_OPTIONS = "http://endhealth.info/im#SortFieldFilterOptions",
    SORT_DIRECTION_FILTER_OPTIONS = "http://endhealth.info/im#SortDirectionFilterOptions",
    SCHEME_FILTER_DEFAULTS = "http://endhealth.info/im#SchemeFilterDefaultOptions",
    STATUS_FILTER_DEFAULTS = "http://endhealth.info/im#StatusFilterDefaultOptions",
    TYPE_FILTER_DEFAULTS = "http://endhealth.info/im#TypeFilterDefaultOptions",
    SORT_FIELD_FILTER_DEFAULTS = "http://endhealth.info/im#SortFieldFilterDefaultOptions",
    SORT_DIRECTION_FILTER_DEFAULTS = "http://endhealth.info/im#SortDirectionFilterDefaultOptions",
}

export const enum IMQ {
}

export const enum IM_FUNCTION {
    DOMAIN = "http://endhealth.info/",
    SNOMED_CONCEPT_GENERATOR = "http://endhealth.info/im#Function_SnomedConceptGenerator",
    LOCAL_NAME_RETRIEVER = "http://endhealth.info/im#Function_LocalNameRetriever",
    GET_ADDITIONAL_ALLOWABLE_TYPES = "http://endhealth.info/im#Function_GetAdditionalAllowableTypes",
    GET_LOGIC_OPTIONS = "http://endhealth.info/im#Function_GetLogicOptions",
    GET_SET_EDITOR_IRI_SCHEMES = "http://endhealth.info/im#Function_GetSetEditorIriSchemes",
    IM1_SCHEME_OPTIONS = "http://endhealth.info/im#Function_IM1SchemeOptions",
    SCHEME_FROM_IRI = "http://endhealth.info/im#Function_SchemeFromIri",
    GET_USER_EDITABLE_SCHEMES = "http://endhealth.info/im#Function_GetUserEditableSchemes",
    IS_TYPE = "http://endhealth.info/im#Function_IsType",
    ALLOWABLE_PROPERTIES = "http://endhealth.info/im#Function_AllowableProperties",
    ALLOWABLE_RANGES = "http://endhealth.info/im#Function_AllowableRanges",
    ALLOWABLE_PROPERTY_VALUES = "http://endhealth.info/im#Function_AllowablePropertyValues",
}

export const enum ImportType {
    SNOMED = "snomed",
    SKIP_TCT = "tct",
    SKIP_SEARCH = "search",
    FHIR = "fhir",
    SMARTLIFE = "smartlifequery",
    QOF = "qof",
    CORE = "core",
    SINGLE_FILE = "singlefile",
    BNF = "bnf",
    ICD10 = "icd10",
    EMIS = "emis",
    CPRD_MED = "cprd",
    OPCS4 = "opcs4",
    TPP = "tpp",
    ODS = "ods",
    PRSB = "prsb",
    KINGS_APEX = "kingsapex",
    KINGS_WINPATH = "kingswinpath",
    VISION = "vision",
    BARTS_CERNER = "barts",
    IM1 = "imv1",
    ENCOUNTERS = "encounters",
    CONFIG = "config",
    CEG = "ceg",
    NHS_TFC = "nhstfc",
    DELTAS = "deltas",
    QUERY = "corequery",
    QR = "qcodegroups",
}

export const enum MAP {
    DOMAIN = "http://endhealth.info/",
    PREFIX = "map",
}

export const enum Namespace {
    LNWH_SY = "http://endhealth.info/lnwhsy#",
    LNWH_SL = "http://endhealth.info/lnwhsl#",
    THH_SL = "http://endhealth.info/thhsl#",
    KINGS_PIMS = "http://endhealth.info/kingsp#",
    IMPERIAL = "http://endhealth.info/impc#",
    CWH = "http://endhealth.info/cwhcc#",
    BHRUT = "http://endhealth.info/bhrutm#",
    ODS = "http://endhealth.info/ods#",
    CEG = "http://endhealth.info/ceg#",
    QOF = "http://endhealth.info/qof#",
    SMARTLIFE = "http://smartlifehealth.info/smh#",
    CONFIG = "http://endhealth.info/config#",
    IMQ = "http://endhealth.info/imq#",
    IM = "http://endhealth.info/im#",
    IM1 = "http://endhealth.info/im1#",
    EMIS = "http://endhealth.info/emis#",
    FUNCTION = "http://endhealth.info/im#Function_",
    MAP = "http://endhealth.info/map#",
    OWL = "http://www.w3.org/2002/07/owl#",
    PRSB = "http://prsb.info/rs#",
    BNF = "http://bnf.info/bnf#",
    QR = "http://apiqcodes.org/qcodes#",
    RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    RDFS = "http://www.w3.org/2000/01/rdf-schema#",
    SHACL = "http://www.w3.org/ns/shacl#",
    SNOMED = "http://snomed.info/sct#",
    USER = "http://endhealth.info/user#",
    WORKFLOW = "http://endhealth.info/workflow#",
    XSD = "http://www.w3.org/2001/XMLSchema#",
    IM_COMPONENT = "http://endhealth.info/im#Component_",
    IM_EDITOR = "http://endhealth.info/im#Editor_",
    IM_QUERY = "http://endhealth.info/im#Query_",
    IM_VALIDATION = "http://endhealth.info/im#Validation_",
    IM_CODE_TEMPLATE = "http://endhealth.info/codeTemplate#",
    TPP = "http://endhealth.info/tpp#",
    ENCOUNTERS = "http://endhealth.info/enc#",
    ICD10 = "http://endhealth.info/icd10#",
    VISION = "http://endhealth.info/vis#",
    OPCS4 = "http://endhealth.info/opcs4#",
    BARTS_CERNER = "http://endhealth.info/bc#",
    ORGANISATION = "http://org.endhealth.info/im#",
    LOCATION = "http://loc.endhealth.info/im#",
    FHIR = "http://hl7.org/fhir/",
    SYSTEM = "http://sys.endhealth.info/im#",
    KINGS_APEX = "http://endhealth.info/kpax#",
    NHSDD_ETHNIC_2001 = "http://endhealth.info/nhsethnic2001#",
    CPRD_MED = "http://endhealth.info/cprdm#",
    CPRD_PROD = "http://endhealth.info/cprdp#",
    NHS_TFC = "http://endhealth.info/nhstfc#",
    KINGS_WINPATH = "http://endhealth.info/kwp#",
}

export const enum ODS {
    BASE_NAMESPACE = "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-",
    ORGANISATION_ROLE_TYPE = "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-OrganizationRole-1#ODS_RoleType",
    ORGANISATION_RELATIONSHIP = "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-OrganizationRelationship-1#ODS_Relationship",
    ORGANISATION_RECORD_CLASS = "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-OrganizationRecordClass-1#ODS_RecordClass",
}

export const enum ORG {
    ORGANISATION_RECORD_CLASS = "http://endhealth.info/im#organisationRecordClass",
    RELATED_ORGANISATION = "http://endhealth.info/im#organisationRelationship",
    TARGET = "http://endhealth.info/im#targetOrganisation",
    ROLE = "http://endhealth.info/im#organisationRole",
    ODS_CODE = "http://endhealth.info/im#odsCode",
}

export const enum OWL {
    PREFIX = "owl",
    THING = "http://www.w3.org/2002/07/owl#Thing",
    CLASS = "http://www.w3.org/2002/07/owl#Class",
    EQUIVALENT_CLASS = "http://www.w3.org/2002/07/owl#equivalentClass",
    INTERSECTION_OF = "http://www.w3.org/2002/07/owl#intersectionOf",
    UNION_OF = "http://www.w3.org/2002/07/owl#unionOf",
    RESTRICTION = "http://www.w3.org/2002/07/owl#Restriction",
    ON_PROPERTY = "http://www.w3.org/2002/07/owl#onProperty",
    ON_CLASS = "http://www.w3.org/2002/07/owl#onClass",
    SOME_VALUES_FROM = "http://www.w3.org/2002/07/owl#someValuesFrom",
    ALL_VALUES_FROM = "http://www.w3.org/2002/07/owl#allValuesFrom",
    OBJECT_PROPERTY = "http://www.w3.org/2002/07/owl#ObjectProperty",
    DATATYPE_PROPERTY = "http://www.w3.org/2002/07/owl#DatatypeProperty",
    ANNOTATION_PROPERTY = "http://www.w3.org/2002/07/owl#AnnotationProperty",
    INVERSE_OF = "http://www.w3.org/2002/07/owl#inverseOf",
    INVERSE_OBJECT_PROPERTY = "http://www.w3.org/2002/07/owl#inverseOf",
    PROPERTY_CHAIN = "http://www.w3.org/2002/07/owl#propertyChainAxiom",
    TRANSITIVE = "http://www.w3.org/2002/07/owl#TransitiveProperty",
    FUNCTIONAL = "http://www.w3.org/2002/07/owl#FunctionalProperty",
    SYMMETRIC = "http://www.w3.org/2002/07/owl#SymmetricProperty",
    REFLEXIVE = "http://www.w3.org/2002/07/owl#ReflexiveProperty",
    ON_DATATYPE = "http://www.w3.org/2002/07/owl#onDatatype",
    WITH_RESTRICTIONS = "http://www.w3.org/2002/07/owl#withRestrictions",
    MAX_CARDINALITY = "http://www.w3.org/2002/07/owl#maxCardinality",
    MIN_CARDINALITY = "http://www.w3.org/2002/07/owl#minCardinality",
    ON_DATA_RANGE = "http://www.w3.org/2002/07/owl#onDataRange",
    HAS_VALUE = "http://www.w3.org/2002/07/owl#hasValue",
    COMPLEMENT_OF = "http://www.w3.org/2002/07/owl#complementOf",
    ONE_OF = "http://www.w3.org/2002/07/owl#oneOf",
    NAMED_INDIVIDUAL = "http://www.w3.org/2002/07/owl#NamedIndividual",
}

export const enum OpenSearch {
    NAME = "http://www.w3.org/2000/01/rdf-schema#label",
    DESCRIPTION = "http://www.w3.org/2000/01/rdf-schema#comment",
    CODE = "http://endhealth.info/im#code",
    STATUS = "http://endhealth.info/im#status",
    ALTERNATIVE_CODE = "http://endhealth.info/im#alternativeCode",
    SCHEME = "http://endhealth.info/im#scheme",
    TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    USAGE_TOTAL = "http://endhealth.info/im#usageTotal",
    BINDING = "http://endhealth.info/im#binding",
    TERM_CODE = "http://endhealth.info/im#hasTermCode",
    DOMAIN = "http://www.w3.org/2000/01/rdf-schema#domain",
}

export const enum PRSB {
    PREFIX = "rs",
}

export const enum QR {
    DOMAIN = "http://apiqcodes.org/",
    PREFIX = "qc",
}

export const enum QUERY {
    DOMAIN = "http://endhealth.info/im#",
    IS_ALLOWABLE_RANGE = "http://endhealth.info/im#Query_IsAllowableRange",
    ALLOWABLE_RANGE_SUGGESTIONS = "http://endhealth.info/im#Query_AllowableRangeSuggestions",
    GET_SUBCLASSES = "http://endhealth.info/im#Query_GetSubClasses",
    GET_ANCESTORS = "http://endhealth.info/im#Query_GetAncestors",
    SEARCH_CONTAINED_IN = "http://endhealth.info/im#Query_SearchContainedIn",
    ALLOWABLE_CHILD_TYPES = "http://endhealth.info/im#Query_AllowableChildTypes",
    PROPERTY_RANGE = "http://endhealth.info/im#Query_PropertyRange",
    OBJECT_PROPERTY_RANGE_SUGGESTIONS = "http://endhealth.info/im#Query_ObjectPropertyRangeSuggestions",
    DATA_PROPERTY_RANGE_SUGGESTIONS = "http://endhealth.info/im#Query_DataPropertyRangeSuggestions",
    ALLOWABLE_PROPERTIES = "http://endhealth.info/im#Query_AllowableProperties",
    ALLOWABLE_PROPERTY_ANCESTORS = "http://endhealth.info/im#Query_AllowablePropertyAncestors",
    IS_VALID_PROPERTY = "http://endhealth.info/im#Query_IsValidProperty",
    SEARCH_PROPERTIES = "http://endhealth.info/im#Query_SearchProperties",
    SEARCH_ENTITIES = "http://endhealth.info/im#Query_SearchEntities",
    SEARCH_FOLDERS = "http://endhealth.info/im#Query_SearchFolders",
    SEARCH_ALLOWABLE_CONTAINED_IN = "http://endhealth.info/im#Query_SearchAllowableContainedIn",
    SEARCH_MAIN_TYPES = "http://endhealth.info/im#Query_SearchmainTypes",
    DM_PROPERTY = "http://endhealth.info/im#Query_DataModelPropertyByShape",
    SEARCH_ALLOWABLE_SUBCLASS = "http://endhealth.info/im#Query_SearchAllowableSubclass",
    GET_VALUES_FROM_PROPERTY_RANGE = "http://endhealth.info/im#Query_GetValuesFromPropertyRange",
    GET_SUBSETS = "http://endhealth.info/im#Query_GetSubsets",
}

export const enum RDF {
    PREFIX = "rdf",
    TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    PROPERTY = "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
    LIST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#List",
    PREDICATE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate",
    SUBJECT = "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
    OBJECT = "http://www.w3.org/1999/02/22-rdf-syntax-ns#object",
}

export const enum RDFS {
    PREFIX = "rdfs",
    LABEL = "http://www.w3.org/2000/01/rdf-schema#label",
    COMMENT = "http://www.w3.org/2000/01/rdf-schema#comment",
    SUBCLASS_OF = "http://www.w3.org/2000/01/rdf-schema#subClassOf",
    SUB_PROPERTY_OF = "http://www.w3.org/2000/01/rdf-schema#subPropertyOf",
    DOMAIN = "http://www.w3.org/2000/01/rdf-schema#domain",
    RANGE = "http://www.w3.org/2000/01/rdf-schema#range",
    RESOURCE = "http://www.w3.org/2000/01/rdf-schema#Resource",
    CLASS = "http://www.w3.org/2000/01/rdf-schema#Class",
    DATATYPE = "http://www.w3.org/2000/01/rdf-schema#Datatype",
    IS_DEFINED_BY = "http://www.w3.org/2000/01/rdf-schema#isDefinedBy",
}

export const enum SHACL {
    PREFIX = "sh",
    PATH = "http://www.w3.org/ns/shacl#path",
    MININCLUSIVE = "http://www.w3.org/ns/shacl#minInclusive",
    MINEXCLUSIVE = "http://www.w3.org/ns/shacl#minExclusive",
    MAXINCLUSIVE = "http://www.w3.org/ns/shacl#maxInclusive",
    MAXEXCLUSIVE = "http://www.w3.org/ns/shacl#maxExclusive",
    PROPERTY = "http://www.w3.org/ns/shacl#property",
    PROPERTY_GROUP = "http://www.w3.org/ns/shacl#PropertyGroup",
    MINCOUNT = "http://www.w3.org/ns/shacl#minCount",
    MAXCOUNT = "http://www.w3.org/ns/shacl#maxCount",
    VALUE = "http://www.w3.org/ns/shacl#value",
    PATTERN = "http://www.w3.org/ns/shacl#pattern",
    INVERSEPATH = "http://www.w3.org/ns/shacl#inversePath",
    CLASS = "http://www.w3.org/ns/shacl#class",
    DATATYPE = "http://www.w3.org/ns/shacl#datatype",
    SPARQL = "http://www.w3.org/ns/shacl#sparql",
    SELECT = "http://www.w3.org/ns/shacl#select",
    PARAMETER = "http://www.w3.org/ns/shacl#parameter",
    IRI = "http://www.w3.org/ns/shacl#IRI",
    OPTIONAL = "http://www.w3.org/ns/shacl#optional",
    NODESHAPE = "http://www.w3.org/ns/shacl#NodeShape",
    TARGETCLASS = "http://www.w3.org/ns/shacl#targetClass",
    NODE = "http://www.w3.org/ns/shacl#node",
    ORDER = "http://www.w3.org/ns/shacl#order",
    OR = "http://www.w3.org/ns/shacl#or",
    NOT = "http://www.w3.org/ns/shacl#not",
    NODE_KIND = "http://www.w3.org/ns/shacl#nodeKind",
    PROPERTYSHAPE = "http://www.w3.org/ns/shacl#PropertyShape",
    AND = "http://www.w3.org/ns/shacl#and",
    NODES = "http://www.w3.org/ns/shacl#nodes",
    TARGET_TYPE = "http://www.w3.org/ns/shacl#targetType",
    TARGET = "http://www.w3.org/ns/shacl#target",
    SPARQL_TARGET = "http://www.w3.org/ns/shacl#SPARQLTarget",
    FUNCTION = "http://www.w3.org/ns/shacl#Function",
    RETURN_TYPE = "http://www.w3.org/ns/shacl#returnType",
    GROUP = "http://www.w3.org/ns/shacl#group",
    NAME = "http://www.w3.org/ns/shacl#name",
    EXPRESSION = "http://www.w3.org/ns/shacl#expression",
    HAS_VALUE = "http://www.w3.org/ns/shacl#hasValue",
}

export const enum SNOMED {
    DOMAIN = "http://snomed.info/",
    PREFIX = "sn",
    ATTRIBUTE = "http://snomed.info/sct#246061005",
    ANY = "http://snomed.info/sct#*",
}

export const enum TransformFunction {
    CONCATENATE = "http://endhealth.info/im#Concatenate",
    STRING_JOIN = "http://endhealth.info/im#StringJoin",
    SNOMED_CODE_CONCEPT_MAP = "http://endhealth.info/im#SchemedCodeConceptMap",
}

export const enum USER {
    DOMAIN = "http://endhealth.info/",
    PREFIX = "usr",
    USER_PRESET = "http://endhealth.info/UserPreset",
    USER_PRIMARY_COLOR = "http://endhealth.info/UserPrimaryColor",
    USER_SURFACE_COLOR = "http://endhealth.info/UserSurfaceColor",
    USER_DARK_MODE = "http://endhealth.info/UserDarkMode",
    USER_SCALE = "http://endhealth.info/UserScale",
    USER_MRU = "http://endhealth.info/UserMRU",
    USER_FAVOURITES = "http://endhealth.info/UserFavourites",
    ORGANISATIONS = "http://endhealth.info/ORGANISATIONS",
    GRAPHS = "http://endhealth.info/GRAPHS",
}

export const enum VALIDATION {
    DOMAIN = "http://endhealth.info/im#",
    IS_DEFINITION = "http://endhealth.info/im#Validation_isDefinition",
    HAS_PARENT = "http://endhealth.info/im#Validation_hasParent",
    IS_IRI = "http://endhealth.info/im#Validation_isIri",
    IS_TERMCODE = "http://endhealth.info/im#Validation_isTermcode",
    IS_PROPERTY = "http://endhealth.info/im#Validation_isProperty",
    IS_SCHEME = "http://endhealth.info/im#Validation_isScheme",
    IS_STATUS = "http://endhealth.info/im#Validation_isStatus",
    IS_ROLE_GROUP = "http://endhealth.info/im#Validation_isRoleGroup",
}

export const enum WORKFLOW {
    DOMAIN = "http://endhealth.info/",
    BUG_REPORT = "http://endhealth.info/workflow#bugReport",
    DATE_CREATED = "http://endhealth.info/workflow#dateCreated",
    CREATED_BY = "http://endhealth.info/workflow#createdBy",
    ASSIGNED_TO = "http://endhealth.info/workflow#assignedTo",
    STATE = "http://endhealth.info/workflow#state",
    HOST_URL = "http://endhealth.info/workflow#hostUrl",
    RELATED_PRODUCT = "http://endhealth.info/workflow#relatedProduct",
    RELATED_MODULE = "http://endhealth.info/workflow#relatedModule",
    OPERATING_SYSTEM = "http://endhealth.info/workflow#operatingSystem",
    OPERATING_SYSTEM_OTHER = "http://endhealth.info/workflow#operatingSystemOther",
    BROWSER = "http://endhealth.info/workflow#browser",
    BROWSER_OTHER = "http://endhealth.info/workflow#browserOther",
    SEVERITY = "http://endhealth.info/workflow#severity",
    ERROR = "http://endhealth.info/workflow#errorDetails",
    REPRODUCE_STEPS = "http://endhealth.info/workflow#reproduceSteps",
    EXPECTED_RESULT = "http://endhealth.info/workflow#expectedResult",
    ACTUAL_RESULT = "http://endhealth.info/workflow#actualResult",
    RELATED_VERSION = "http://endhealth.info/workflow#relatedVersion",
    REQUESTED_ROLE = "http://endhealth.info/workflow#requestedRole",
    REQUESTED_GRAPH = "http://endhealth.info/workflow#requestedGraph",
    APPROVAL_TYPE = "http://endhealth.info/workflow#approvalType",
    HISTORY = "http://endhealth.info/workflow#history",
    HISTORY_PREDICATE = "http://endhealth.info/workflow#historyPredicate",
    HISTORY_ORIGINAL_OBJECT = "http://endhealth.info/workflow#historyOriginalObject",
    HISTORY_NEW_OBJECT = "http://endhealth.info/workflow#historyNewObject",
    HISTORY_CHANGE_DATE = "http://endhealth.info/workflow#historyChangeDate",
    MODIFIED_BY = "http://endhealth.info/workflow#modifiedBy",
}

export const enum XSD {
    PREFIX = "xsd",
    PATTERN = "http://www.w3.org/2001/XMLSchema#pattern",
    MIN_INCLUSIVE = "http://www.w3.org/2001/XMLSchema#minInclusive",
    MIN_EXCLUSIVE = "http://www.w3.org/2001/XMLSchema#minExclusive",
    MAX_INCLUSIVE = "http://www.w3.org/2001/XMLSchema#maxInclusive",
    MAX_EXCLUSIVE = "http://www.w3.org/2001/XMLSchema#maxExclusive",
    INTEGER = "http://www.w3.org/2001/XMLSchema#integer",
    STRING = "http://www.w3.org/2001/XMLSchema#string",
    BOOLEAN = "http://www.w3.org/2001/XMLSchema#boolean",
    LONG = "http://www.w3.org/2001/XMLSchema#long",
    DOUBLE = "http://www.w3.org/2001/XMLSchema#double",
    DATE_TIME = "http://www.w3.org/2001/XMLSchema#dateTime",
    NUMBER = "http://www.w3.org/2001/XMLSchema#number",
    DECIMAL = "http://www.w3.org/2001/XMLSchema#decimal",
}
