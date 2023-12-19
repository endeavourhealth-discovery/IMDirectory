/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2023-12-19 13:16:20.

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
    im1Id?: string[];
    matchedFrom?: Concept[];
    usage?: number;
    codeId?: string;
    alternativeCode?: string;
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
    arrayButtons?: ArrayButtons;
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
    relativeTo?: PropertyRef;
    operator?: Operator;
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
    ancestorsOf?: boolean;
    descendantsOrSelfOf?: boolean;
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
    orderBy?: OrderLimit;
    optional?: boolean;
    aggregate?: FunctionClause;
    instanceOf?: Node;
    typeOf?: Node;
    variable?: string;
    then?: Match;
}

export interface Node extends Element {
}

export interface OrderDirection extends PropertyRef {
    direction?: Order;
}

export interface OrderLimit {
    property?: OrderDirection[];
    limit?: number;
    description?: string;
    partitionBy?: PropertyRef;
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
    isNull?: boolean;
    isNot?: Node[];
    notInSet?: Node[];
    inSet?: Node[];
    anyRoleGroup?: boolean;
    is?: Node[];
    valueLabel?: string;
    isNotNull?: boolean;
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

export interface QueryException extends Exception {
}

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
    askIri?: string;
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
    case?: Case;
    return?: Return;
}

export interface Update extends TTIriRef {
    match?: Match[];
    delete?: Delete[];
}

export interface Value extends Assignable {
}

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
    subsumptionCount?: number;
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
    orderBy?: OrderBy[];
    filter?: Filter[];
    timings?: { [index: string]: string }[];
}

export interface SearchResponse {
    page?: number;
    count?: number;
    entities?: SearchResultSummary[];
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

export interface Vocabulary {
    iri?: string;
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

export interface Exception extends Throwable {
}

export interface TTValue extends Serializable {
    order?: number;
}

export interface Serializable {
}

export interface TTPrefix {
    iri?: string;
    prefix?: string;
    name?: string;
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
}

export const enum Comparison {
    eq = "eq",
    gte = "gte",
    gt = "gt",
    lte = "lte",
    lt = "lt",
}

export const enum Function {
    sum = "sum",
    count = "count",
    average = "average",
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

export const enum VarType {
    NODE = "NODE",
    PATH = "PATH",
    LITERAL = "LITERAL",
}

export const enum CONFIG {
    NAMESPACE = "http://endhealth.info/config#",
    DOMAIN = "http://endhealth.info/",
    PREFIX = "cfg",
    DEFINITION = "http://endhealth.info/config#definition",
    SUMMARY = "http://endhealth.info/config#summary",
    FILTER_DEFAULTS = "http://endhealth.info/config#filterDefaults",
    INFERRED_PREDICATES = "http://endhealth.info/config#inferredPredicates",
    INFERRED_EXCLUDE_PREDICATES = "http://endhealth.info/config#inferredExcludePredicates",
    CONCEPT_DASHBOARD = "http://endhealth.info/config#conceptDashboard",
    DEFAULT_PREDICATE_NAMES = "http://endhealth.info/config#defaultPredicateNames",
    XML_SCHEMA_DATA_TYPES = "http://endhealth.info/config#xmlSchemaDataTypes",
    DEFAULT_PREFIXES = "http://endhealth.info/config#defaultPrefixes",
    GRAPH_EXCLUDE_PREDICATES = "http://endhealth.info/config#graphExcludePredicates",
    IM1_PUBLISH = "http://endhealth.info/config#im1Publish",
    IMDIRECTORY_LATEST_RELEASE = "http://endhealth.info/config#IMDirectoryLatestRelease",
    IMDIRECTORY_ALL_RELEASES = "http://endhealth.info/config#IMDirectoryAllReleases",
    IMPORT_DATA_LATEST_RELEASE = "http://endhealth.info/config#ImportDataLatestRelease",
    IMPORT_DATA_ALL_RELEASES = "http://endhealth.info/config#ImportDataAllReleases",
}

export const enum FHIR {
    DOMAIN = "http://hl7.org/fhir/",
    PREFIX = "fhir",
    DSTU2 = "http://hl7.org/2-0/fhir/StructureDefinition#",
    GRAPH_FHIR = "http://hl7.org/fhir/",
    VALUESET_FOLDER = "http://endhealth.info/im#VSET_FHIR",
}

export const enum IM {
    DOMAIN = "http://endhealth.info/",
    PREFIX = "im",
    NAMESPACE = "http://endhealth.info/im#",
    IRI = "@id",
    VALUE = "@value",
    TYPE = "@type",
    id = "http://endhealth.info/im#id",
    CODE = "http://endhealth.info/im#code",
    PREFERRED_NAME = "http://endhealth.info/im#preferredName",
    HAS_SCHEME = "http://endhealth.info/im#scheme",
    HAS_STATUS = "http://endhealth.info/im#status",
    STATUS = "http://endhealth.info/im#Status",
    CONTENT_TYPE = "http://endhealth.info/im#contentType",
    USAGE_STATS = "http://endhealth.info/im#usageStats",
    IN_TASK = "http://endhealth.info/im#inTask",
    DEFINITION = "http://endhealth.info/im#definition",
    RETURN_TYPE = "http://endhealth.info/im#returnType",
    UPDATE_PROCEDURE = "http://endhealth.info/im#updateProcedure",
    INVERSE_PATH = "http://endhealth.info/im#inversePath",
    CONCEPT = "http://endhealth.info/im#Concept",
    CONCEPT_SET = "http://endhealth.info/im#ConceptSet",
    FOLDER = "http://endhealth.info/im#Folder",
    VALUESET = "http://endhealth.info/im#ValueSet",
    TEXT_MAPS = "http://endhealth.info/im#TextMaps",
    CONFIG = "http://endhealth.info/im#Config",
    GRAPH = "http://endhealth.info/im#Graph",
    FUNCTION = "http://endhealth.info/im#FunctionClause",
    QUERY = "http://endhealth.info/im#Query",
    COHORT_QUERY = "http://endhealth.info/im#CohortQuery",
    DATASET_QUERY = "http://endhealth.info/im#DatasetQuery",
    DATA_UPDATE = "http://endhealth.info/im#DataUpdate",
    PATH_QUERY = "http://endhealth.info/im#PathQuery",
    PATH_TO = "http://endhealth.info/im#pathTo",
    OPENSEARCH_QUERY = "http://endhealth.info/im#OpenSearchQuery",
    DATAMODEL_PROPERTY = "http://endhealth.info/im#dataModelProperty",
    TASK = "http://endhealth.info/im#Task",
    FIELD_GROUP = "http://endhealth.info/im#FieldGroup",
    MATCH_CLAUSE = "http://endhealth.info/im#MatchClause",
    FORM_GENERATOR = "http://endhealth.info/im#FormGenerator",
    FUNCTION_PROPERTY = "http://endhealth.info/im#functionProperty",
    MAP_GRAPH = "http://endhealth.info/im#GraphMap",
    MAP_ENTITY = "http://endhealth.info/im#EntityMap",
    SET = "http://endhealth.info/im#Set",
    IS_CONTAINED_IN = "http://endhealth.info/im#isContainedIn",
    ONE_OF = "http://endhealth.info/im#oneOf",
    COMBINATION_OF = "http://endhealth.info/im#combinationOf",
    USE_PREDICATES = "http://endhealth.info/im#usePredicates",
    SOME_OF = "http://endhealth.info/im#someOf",
    HAS_CHILDREN = "http://endhealth.info/im#hasChildren",
    IS_A = "http://endhealth.info/im#isA",
    IS_CHILD_OF = "http://endhealth.info/im#isChildOf",
    SUBSUMED_BY = "http://endhealth.info/im#subsumedBy",
    USUALLY_SUBSUMED_BY = "http://endhealth.info/im#usuallySubsumedBy",
    APPROXIMATE_SUBSUMED_BY = "http://endhealth.info/im#approximateSubsumedBy",
    MULTIPLE_SUBSUMED_BY = "http://endhealth.info/im#multipleSubsumedBy",
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
    UPDATE_ALL = "http://endhealth.info/im#UpdateAll",
    ADD_QUADS = "http://endhealth.info/im#AddQuads",
    UPDATE_PREDICATES = "http://endhealth.info/im#UpdatePredicates",
    DELETE_ALL = "http://endhealth.info/im#DeleteAll",
    PROV_CREATION = "http://endhealth.info/im#2001000252109",
    PROV_UPDATE = "http://endhealth.info/im#1661000252106",
    USED_IN = "http://endhealth.info/im#usedIn",
    IN_RESULT_SET = "http://endhealth.info/im#inResultSet",
    HAS_PROFILE = "http://endhealth.info/im#inResultSet",
    GMS_PATIENT = "http://endhealth.info/im#2751000252106",
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
    PLABEL = "http://endhealth.info/im#pLabel",
    OLABEL = "http://endhealth.info/im#oLabel",
    EXAMPLE = "http://endhealth.info/im#example",
    IM1ID = "http://endhealth.info/im#im1Id",
    WEIGHTING = "http://endhealth.info/im#weighting",
    PRIVACY_LEVEL = "http://endhealth.info/im#privacyLevel",
    IM1SCHEME = "http://endhealth.info/im#im1Scheme",
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
    SYSTEM_NAMESPACE = "http://sys.endhealth.info/im#",
    ENTITY_TYPES = "http://endhealth.info/im#EntityTypes",
    ID = "http://endhealth.info/im#id",
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
    VALUE_SET = "http://endhealth.info/im#ValueSet",
    DATAMODEL_ENTITY = "http://endhealth.info/im#DataModelEntity",
    DATAMODEL_OBJECTPROPERTY = "http://endhealth.info/im#dataModelObjectProperty",
    DATAMODEL_DATAPROPERTY = "http://endhealth.info/im#dataModelDataProperty",
    DATAMODEL_FUNCTIONPROPERTY = "http://endhealth.info/im#functionProperty",
    MATCH = "http://endhealth.info/im#match",
    ENTITY_TYPE = "http://endhealth.info/im#entityType",
    VALUE_DATA = "http://endhealth.info/im#valueData",
    VALUE_OBJECT = "http://endhealth.info/im#valueObject",
    VALUE_IRI = "http://endhealth.info/im#valueIri",
    VALUE_IRI_LIST = "http://endhealth.info/im#valueIriList",
    VALUE_DATA_LIST = "http://endhealth.info/im#valueDataList",
    IM_1_ID = "http://endhealth.info/im#im1Id",
    IM_1_SCHEME = "http://endhealth.info/im#im1Scheme",
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
}

export const enum MAP {
    NAMESPACE = "http://endhealth.info/map#",
    DOMAIN = "http://endhealth.info/",
    PREFIX = "map",
}

export const enum ODS {
    BASE_NAMESPACE = "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-",
    ORGANISATION_ROLE_TYPE = "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-OrganizationRole-1#ODS_RoleType",
    ORGANISATION_RELATIONSHIP = "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-OrganizationRelationship-1#ODS_Relationship",
    ORGANISATION_RECORD_CLASS = "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-OrganizationRecordClass-1#ODS_RecordClass",
}

export const enum ORG {
    ORGANISATION_NAMESPACE = "http://org.endhealth.info/im#",
    LOCATION_NAMESPACE = "http://loc.endhealth.info/im#",
    ORGANISATION_RECORD_CLASS = "http://endhealth.info/im#organisationRecordClass",
    RELATED_ORGANISATION = "http://endhealth.info/im#organisationRelationship",
    TARGET = "http://endhealth.info/im#targetOrganisation",
    ROLE = "http://endhealth.info/im#organisationRole",
    ODS_CODE = "http://endhealth.info/im#odsCode",
}

export const enum OWL {
    NAMESPACE = "http://www.w3.org/2002/07/owl#",
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

export const enum PRSB {
    NAMESPACE = "http://prsb.info/rs#",
    PREFIX = "rs",
}

export const enum QR {
    NAMESPACE = "http://apiqcodes.org/qcodes#",
    DOMAIN = "http://apiqcodes.org/",
    PREFIX = "qc",
}

export const enum RDF {
    NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    PREFIX = "rdf",
    TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    PROPERTY = "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
    LIST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#List",
    PREDICATE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate",
    SUBJECT = "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject",
    OBJECT = "http://www.w3.org/1999/02/22-rdf-syntax-ns#object",
}

export const enum RDFS {
    NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#",
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
    NAMESPACE = "http://www.w3.org/ns/shacl#",
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
    FUNCTION = "http://www.w3.org/ns/shacl#FunctionClause",
    RETURN_TYPE = "http://www.w3.org/ns/shacl#returnType",
    GROUP = "http://www.w3.org/ns/shacl#group",
    NAME = "http://www.w3.org/ns/shacl#name",
    EXPRESSION = "http://www.w3.org/ns/shacl#expression",
    HAS_VALUE = "http://www.w3.org/ns/shacl#hasValue",
}

export const enum SNOMED {
    NAMESPACE = "http://snomed.info/sct#",
    PREFIX = "sn",
    GRAPH_SNOMED = "http://snomed.info/sct#",
}

export const enum USER {
    DOMAIN = "http://endhealth.info/",
    NAMESPACE = "http://endhealth.info/user#",
    PREFIX = "usr",
    USER_THEME = "http://endhealth.info/user#UserTheme",
    USER_MRU = "http://endhealth.info/user#UserMRU",
    USER_FAVOURITES = "http://endhealth.info/user#UserFavourites",
    ORGANISATIONS = "http://endhealth.info/user#Organisations",
}

export const enum WORKFLOW {
    DOMAIN = "http://endhealth.info/",
    NAMESPACE = "http://endhealth.info/workflow#",
    BUG_REPORT = "http://endhealth.info/workflow#bugReport",
    DATE_CREATED = "http://endhealth.info/workflow#dateCreated",
    CREATED_BY = "http://endhealth.info/workflow#createdBy",
    ASSIGNED_TO = "http://endhealth.info/workflow#assignedTo",
    STATE = "http://endhealth.info/workflow#state",
    RELATED_PRODUCT = "http://endhealth.info/workflow#relatedProduct",
    RELATED_MODULE = "http://endhealth.info/workflow#relatedModule",
    OPERATING_SYSTEM = "http://endhealth.info/workflow#operatingSystem",
    BROWSER = "http://endhealth.info/workflow#browser",
    SEVERITY = "http://endhealth.info/workflow#severity",
    ERROR = "http://endhealth.info/workflow#errorDetails",
    REPRODUCE_STEPS = "http://endhealth.info/workflow#reproduceSteps",
    EXPECTED_RESULT = "http://endhealth.info/workflow#expectedResult",
    ACTUAL_RESULT = "http://endhealth.info/workflow#actualResult",
    RELATED_VERSION = "http://endhealth.info/workflow#relatedVersion",
}

export const enum XSD {
    NAMESPACE = "http://www.w3.org/2001/XMLSchema#",
    PREFIX = "xsd",
    PATTERN = "http://www.w3.org/2001/XMLSchema#pattern",
    MININCLUSIVE = "http://www.w3.org/2001/XMLSchema#minInclusive",
    MINEXCLUSIVE = "http://www.w3.org/2001/XMLSchema#minExclusive",
    MAXINCLUSIVE = "http://www.w3.org/2001/XMLSchema#maxInclusive",
    MAXEXCLUSIVE = "http://www.w3.org/2001/XMLSchema#maxExclusive",
    INTEGER = "http://www.w3.org/2001/XMLSchema#integer",
    STRING = "http://www.w3.org/2001/XMLSchema#string",
    BOOLEAN = "http://www.w3.org/2001/XMLSchema#boolean",
    LONG = "http://www.w3.org/2001/XMLSchema#long",
    DOUBLE = "http://www.w3.org/2001/XMLSchema#double",
}

export const enum COMPONENT {
    NAMESPACE = "http://endhealth.info/im#Component_",
    TEXT_DISPLAY = "http://endhealth.info/im#Component_textDisplay",
    TEXT_INPUT = "http://endhealth.info/im#Component_textInput",
    HTML_INPUT = "http://endhealth.info/im#Component_htmlInput",
    ENTITY_MULTI_SEARCH = "http://endhealth.info/im#Component_entityMultiSearch",
    ENTITY_SEARCH = "http://endhealth.info/im#Component_entitySearch",
    ENTITY_COMBOBOX = "http://endhealth.info/im#Component_entityComboBox",
    ENTITY_DROPDOWN = "http://endhealth.info/im#Component_entityDropdown",
    STEPS_GROUP = "http://endhealth.info/im#Component_stepsGroup",
    ARRAY_BUILDER = "http://endhealth.info/im#Component_arrayBuilder",
    ENTITY_AUTO_COMPLETE = "http://endhealth.info/im#Component_entityAutoComplete",
    MEMBERS_BUILDER = "http://endhealth.info/im#Component_membersBuilder",
    COMPONENT_GROUP = "http://endhealth.info/im#Component_componentGroup",
    ARRAY_BUILDER_WITH_DROPDOWN = "http://endhealth.info/im#Component_arrayBuilderWithDropdown",
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
}

export const enum EDITOR {
    NAMESPACE = "http://endhealth.info/im#Editor_",
    CONCEPT_SHAPE = "http://endhealth.info/im#Editor_ConceptShape",
    CONCEPT_SET_SHAPE = "http://endhealth.info/im#Editor_ConceptSetShape",
    VALUE_SET_SHAPE = "http://endhealth.info/im#Editor_ValueSetShape",
    FOLDER_SHAPE = "http://endhealth.info/im#Editor_FolderShape",
    DATA_MODEL_SHAPE = "http://endhealth.info/im#Editor_DataModelShape",
    COHORT_QUERY_SHAPE = "http://endhealth.info/im#Editor_CohortQueryShape",
    PROPERTY_SHAPE = "http://endhealth.info/im#Editor_PropertyShape",
}

export const enum FUNCTION {
    NAMESPACE = "http://endhealth.info/im#Function_",
    SNOMED_CONCEPT_GENERATOR = "http://endhealth.info/im#Function_SnomedConceptGenerator",
    LOCAL_NAME_RETRIEVER = "http://endhealth.info/im#Function_LocalNameRetriever",
    GET_ADDITIONAL_ALLOWABLE_TYPES = "http://endhealth.info/im#Function_GetAdditionalAllowableTypes",
    GET_LOGIC_OPTIONS = "http://endhealth.info/im#Function_GetLogicOptions",
    GET_SET_EDITOR_IRI_SCHEMES = "http://endhealth.info/im#Function_GetSetEditorIriSchemes",
    IM1_SCHEME_OPTIONS = "http://endhealth.info/im#Function_IM1SchemeOptions",
    SCHEME_FROM_IRI = "http://endhealth.info/im#Function_SchemeFromIri",
    GET_USER_EDITABLE_SCHEMES = "http://endhealth.info/im#Function_GetUserEditableSchemes",
    GENERATE_IRI_CODE = "http://endhealth.info/im#Function_GenerateIriCode",
    IS_TYPE = "http://endhealth.info/im#Function_IsType",
    ALLOWABLE_PROPERTIES = "http://endhealth.info/im#Function_AllowableProperties",
    ALLOWABLE_RANGES = "http://endhealth.info/im#Function_AllowableRanges",
}

export const enum GRAPH {
    DISCOVERY = "http://endhealth.info/im#",
    ICD10 = "http://endhealth.info/icd10#",
    EMIS = "http://endhealth.info/emis#",
    EMIS_CORE = "http://endhealth.info/emisc",
    CPRD_MED = "http://endhealth.info/cprdm#",
    CPRD_PROD = "http://endhealth.info/cprdp#",
    OPCS4 = "http://endhealth.info/opcs4#",
    TPP = "http://endhealth.info/tpp#",
    ODS = "http://endhealth.info/ods#",
    PRSB = "http://endhealth.info/prsb#",
    KINGS_APEX = "http://endhealth.info/kpax#",
    KINGS_WINPATH = "http://endhealth.info/kwp#",
    VISION = "http://endhealth.info/vis#",
    READ2 = "http://endhealth.info/read2#",
    BARTS_CERNER = "http://endhealth.info/bc#",
    NHSDD_ETHNIC_2001 = "http://endhealth.info/nhsethnic2001#",
    IM1 = "http://endhealth.info/im1#",
    ENCOUNTERS = "http://endhealth.info/enc#",
    CONFIG = "http://endhealth.info/config#",
    CEG_QUERY = "http://endhealth.info/ceg/qry#",
    NHS_TFC = "http://endhealth.info/nhstfc#",
    STATS = "http://endhealth.info/stats#",
    DELTAS = "http://endhealth.info/deltas#",
    PROV = "http://endhealth.info/prov#",
    QUERY = "http://endhealth.info/query#",
    CEG16 = "http://endhealth.info/ceg16#",
    REPORTS = "http://endhealth.info/reports#",
    OPS_ROLES = "https://directory.spineservices.nhs.uk/STU3/CodeSystem/ODSAPI-OrganizationRole-1#",
    XMLS = "http://www.w3.org/2001/XMLSchema#",
}

export const enum QUERY {
    NAMESPACE = "http://endhealth.info/im#Query_",
    ALLOWABLE_RANGES = "http://endhealth.info/im#Query_AllowableRanges",
    GET_ISAS = "http://endhealth.info/im#Query_GetIsas",
    GET_DESCENDANTS = "http://endhealth.info/im#Query_GetDescendants",
    SEARCH_CONTAINED_IN = "http://endhealth.info/im#Query_SearchContainedIn",
    ALLOWABLE_CHILD_TYPES = "http://endhealth.info/im#Query_AllowableChildTypes",
    PROPERTY_RANGE = "http://endhealth.info/im#Query_PropertyRange",
    OBJECT_PROPERTY_RANGE_SUGGESTIONS = "http://endhealth.info/im#Query_ObjectPropertyRangeSuggestions",
    DATA_PROPERTY_RANGE_SUGGESTIONS = "http://endhealth.info/im#Query_DataPropertyRangeSuggestions",
    ALLOWABLE_PROPERTIES = "http://endhealth.info/im#Query_AllowableProperties",
    SEARCH_PROPERTIES = "http://endhealth.info/im#Query_SearchProperties",
    SEARCH_ENTITIES = "http://endhealth.info/im#Query_SearchEntities",
    SEARCH_FOLDERS = "http://endhealth.info/im#Query_SearchFolders",
    SEARCH_ALLOWABLE_CONTAINED_IN = "http://endhealth.info/im#Query_SearchAllowableContainedIn",
    SEARCH_MAIN_TYPES = "http://endhealth.info/im#Query_SearchmainTypes",
    DM_PROPERTY = "http://endhealth.info/im#Query_DataModelPropertyByShape",
    SEARCH_SUBCLASS = "http://endhealth.info/im#Query_SearchAllowableSubclass",
}

export const enum VALIDATION {
    NAMESPACE = "http://endhealth.info/im#Validation_",
    IS_DEFINITION = "http://endhealth.info/im#Validation_isDefinition",
    HAS_PARENT = "http://endhealth.info/im#Validation_hasParent",
    IS_IRI = "http://endhealth.info/im#Validation_isIri",
    IS_TERMCODE = "http://endhealth.info/im#Validation_isTermcode",
    IS_PROPERTY = "http://endhealth.info/im#Validation_isProperty",
    IS_SCHEME = "http://endhealth.info/im#Validation_isScheme",
    IS_STATUS = "http://endhealth.info/im#Validation_isStatus",
}
