// This file is autogenerated. Any edits made will be lost. To make changes go to imapi/api/vocab.json and re-run gradle task staticConstGenerator

export class IM {
  public static readonly DOMAIN = "http://endhealth.info/";
  public static readonly PREFIX = "im";
  public static readonly NAMESPACE = IM.DOMAIN + IM.PREFIX + "#";
  public static readonly IRI = "@id";
  public static readonly VALUE = "@value";
  public static readonly TYPE = "@type";
  public static readonly id = IM.NAMESPACE + "id";
  public static readonly CODE = IM.NAMESPACE + "code";
  public static readonly PREFERRED_NAME = IM.NAMESPACE + "preferredName";
  public static readonly HAS_SCHEME = IM.NAMESPACE + "scheme";
  public static readonly BINDING = IM.NAMESPACE+"binding";
  public static readonly HAS_STATUS = IM.NAMESPACE + "status";
  public static readonly STATUS = IM.NAMESPACE + "Status";
  public static readonly CONTENT_TYPE = IM.NAMESPACE + "contentType";
  public static readonly USAGE_STATS = IM.NAMESPACE + "usageStats";
  public static readonly IN_TASK = IM.NAMESPACE + "inTask";
  public static readonly DEFINITION = IM.NAMESPACE + "definition";
  public static readonly RETURN_TYPE = IM.NAMESPACE + "returnType";
  public static readonly UPDATE_PROCEDURE = IM.NAMESPACE + "updateProcedure";
  public static readonly INVERSE_PATH = IM.NAMESPACE + "inversePath";
  public static readonly CONCEPT = IM.NAMESPACE + "Concept";
  public static readonly CONCEPT_SET = IM.NAMESPACE + "ConceptSet";
  public static readonly FOLDER = IM.NAMESPACE + "Folder";
  public static readonly VALUESET = IM.NAMESPACE + "ValueSet";
  public static readonly TEXT_MAPS = IM.NAMESPACE + "TextMaps";
  public static readonly CONFIG = IM.NAMESPACE + "Config";
  public static readonly GRAPH = IM.NAMESPACE + "Graph";
  public static readonly FUNCTION = IM.NAMESPACE + "FunctionClause";
  public static readonly QUERY = IM.NAMESPACE + "Query";
  public static readonly COHORT_QUERY = IM.NAMESPACE + "CohortQuery";
  public static readonly DATASET_QUERY = IM.NAMESPACE + "DatasetQuery";
  public static readonly DATA_UPDATE = IM.NAMESPACE + "DataUpdate";
  public static readonly PATH_QUERY = IM.NAMESPACE + "PathQuery";
  public static readonly PATH_TO = IM.NAMESPACE + "pathTo";
  public static readonly OPENSEARCH_QUERY = IM.NAMESPACE + "OpenSearchQuery";
  public static readonly DATAMODEL_PROPERTY = IM.NAMESPACE + "dataModelProperty";
  public static readonly ONTOLOGY_PARENT_FOLDER = IM.NAMESPACE + "HealthModelOntology";
  public static readonly PROPERTIES_FOLDER = IM.NAMESPACE + "Properties";
  public static readonly TASK = IM.NAMESPACE + "Task";
  public static readonly FIELD_GROUP = IM.NAMESPACE + "FieldGroup";
  public static readonly MATCH_CLAUSE = IM.NAMESPACE + "MatchClause";
  public static readonly FORM_GENERATOR = IM.NAMESPACE + "FormGenerator";
  public static readonly FUNCTION_PROPERTY = IM.NAMESPACE + "functionProperty";
  public static readonly MAP_GRAPH = IM.NAMESPACE + "GraphMap";
  public static readonly MAP_ENTITY = IM.NAMESPACE + "EntityMap";
  public static readonly SET = IM.NAMESPACE + "Set";
  public static readonly IS_CONTAINED_IN = IM.NAMESPACE + "isContainedIn";
  public static readonly HAS_MEMBER_PARENT = IM.NAMESPACE + "hasMemberParent";
  public static readonly FUNCTION_TEMPLATE = IM.NAMESPACE + "functionTemplate";
  public static readonly ONE_OF = IM.NAMESPACE + "oneOf";
  public static readonly COMBINATION_OF = IM.NAMESPACE + "combinationOf";
  public static readonly USE_PREDICATES = IM.NAMESPACE + "usePredicates";
  public static readonly SOME_OF = IM.NAMESPACE + "someOf";
  public static readonly HAS_CHILDREN = IM.NAMESPACE + "hasChildren";
  public static readonly IS_A = IM.NAMESPACE + "isA";
  public static readonly IS_CHILD_OF = IM.NAMESPACE + "isChildOf";
  public static readonly PREVIOUS_ENTITY_OF = IM.NAMESPACE + "previousEntityOf";
  public static readonly SUBSUMED_BY = IM.NAMESPACE + "subsumedBy";
  public static readonly USUALLY_SUBSUMED_BY = IM.NAMESPACE + "usuallySubsumedBy";
  public static readonly APPROXIMATE_SUBSUMED_BY = IM.NAMESPACE + "approximateSubsumedBy";
  public static readonly MULTIPLE_SUBSUMED_BY = IM.NAMESPACE + "multipleSubsumedBy";
  public static readonly LOCAL_SUBCLASS_OF = IM.NAMESPACE + "localSubClassOf";
  public static readonly HAS_CONFIG = IM.NAMESPACE + "hasConfig";
  public static readonly PROPERTY_GROUP = IM.NAMESPACE + "propertyGroup";
  public static readonly INHERITED_FROM = IM.NAMESPACE + "inheritedFrom";
  public static readonly GROUP_NUMBER = IM.NAMESPACE + "groupNumber";
  public static readonly ROLE_GROUP = IM.NAMESPACE + "roleGroup";
  public static readonly ROLE = IM.NAMESPACE + "role";
  public static readonly HAS_INHERITED_PROPERTIES = IM.NAMESPACE + "hasInheritedProperties";
  public static readonly DRAFT = IM.NAMESPACE + "Draft";
  public static readonly ACTIVE = IM.NAMESPACE + "Active";
  public static readonly INACTIVE = IM.NAMESPACE + "Inactive";
  public static readonly DEFINITIONAL_STATUS = IM.NAMESPACE + "definitionalStatus";
  public static readonly SUFFICIENTLY_DEFINED = IM.NAMESPACE + "1251000252106";
  public static readonly NECESSARY_NOT_SUFFICIENT = IM.NAMESPACE + "2771000252102";
  public static readonly UNASSIGNED = IM.NAMESPACE + "Unassigned";
  public static readonly HAS_MAP = IM.NAMESPACE + "hasMap";
  public static readonly ENTITY_MAP = IM.NAMESPACE + "entityMap";
  public static readonly MAPPED_TO = IM.NAMESPACE + "mappedTo";
  public static readonly HAS_NUMERIC = IM.NAMESPACE + "hasNumericValue";
  public static readonly SOURCE_TEXT = IM.NAMESPACE + "sourceText";
  public static readonly TARGET_TEXT = IM.NAMESPACE + "targetText";
  public static readonly HAS_TERM_CODE = IM.NAMESPACE + "hasTermCode";
  public static readonly ALTERNATIVE_CODE = IM.NAMESPACE + "alternativeCode";
  public static readonly DESCRIPTION_ID = IM.NAMESPACE + "descriptionId";
  public static readonly CODE_ID = IM.NAMESPACE + "codeId";
  public static readonly MATCHED_TO = IM.NAMESPACE + "matchedTo";
  public static readonly MAP_PRIORITY = IM.NAMESPACE + "mapPriority";
  public static readonly ASSURANCE_LEVEL = IM.NAMESPACE + "assuranceLevel";
  public static readonly MAP_ADVICE = IM.NAMESPACE + "mapAdvice";
  public static readonly NATIONALLY_ASSURED = IM.NAMESPACE + "NationallyAssuredUK";
  public static readonly SUPPLIER_ASSURED = IM.NAMESPACE + "SupplierAssured";
  public static readonly HAS_MEMBER = IM.NAMESPACE + "hasMember";
  public static readonly IS_MEMBER_OF = IM.NAMESPACE + "isMemberOf";
  public static readonly IS_SUBSET_OF = IM.NAMESPACE + "isSubsetOf";
  public static readonly HAS_SUBSET = IM.NAMESPACE + "hasSubset";
  public static readonly SOURCE_CONTEXT = IM.NAMESPACE + "sourceContext";
  public static readonly SOURCE_CONTEXT_TYPE = IM.NAMESPACE + "SourceContext";
  public static readonly SOURCE_PUBLISHER = IM.NAMESPACE + "sourcePublisher";
  public static readonly SOURCE_SYSTEM = IM.NAMESPACE + "sourceSystem";
  public static readonly SOURCE_SCHEMA = IM.NAMESPACE + "sourceSchema";
  public static readonly SOURCE_TABLE = IM.NAMESPACE + "sourceTable";
  public static readonly SOURCE_FIELD = IM.NAMESPACE + "sourceField";
  public static readonly SOURCE_CODE_SCHEME = IM.NAMESPACE + "sourceCodeScheme";
  public static readonly SOURCE_VALUE = IM.NAMESPACE + "sourceValue";
  public static readonly SOURCE_REGEX = IM.NAMESPACE + "sourceRegex";
  public static readonly SOURCE_HEADING = IM.NAMESPACE + "sourceHeading";
  public static readonly TARGET_PROPERTY = IM.NAMESPACE + "targetProperty";
  public static readonly CONTEXT_NODE = IM.NAMESPACE + "contextNode";
  public static readonly UPDATE_ALL = IM.NAMESPACE + "UpdateAll";
  public static readonly ADD_QUADS = IM.NAMESPACE + "AddQuads";
  public static readonly UPDATE_PREDICATES = IM.NAMESPACE + "UpdatePredicates";
  public static readonly DELETE_ALL = IM.NAMESPACE + "DeleteAll";
  public static readonly PROV_CREATION = IM.NAMESPACE + "2001000252109";
  public static readonly PROV_UPDATE = IM.NAMESPACE + "1661000252106";
  public static readonly USED_IN = IM.NAMESPACE + "usedIn";
  public static readonly IN_RESULT_SET = IM.NAMESPACE + "inResultSet";
  public static readonly HAS_PROFILE = IM.NAMESPACE + "inResultSet";
  public static readonly GMS_PATIENT = IM.NAMESPACE + "2751000252106";
  public static readonly PROVENANCE_ACTIVITY = IM.NAMESPACE + "ProvenanceActivity";
  public static readonly PROVENANCE_TARGET = IM.NAMESPACE + "provenanceTarget";
  public static readonly PROVENANCE_ACTIVITY_TYPE = IM.NAMESPACE + "provenanceActivityType";
  public static readonly PROVENANCE_AGENT = IM.NAMESPACE + "provenanceAgent";
  public static readonly START_TIME = IM.NAMESPACE + "startTime";
  public static readonly EFFECTIVE_DATE = IM.NAMESPACE + "effectiveDate";
  public static readonly END_DATE = IM.NAMESPACE + "endDate";
  public static readonly PROVENANCE_USED = IM.NAMESPACE + "usedEntity";
  public static readonly AUTHOR_ROLE = IM.NAMESPACE + "1001911000252102";
  public static readonly VERSION = IM.NAMESPACE + "version";
  public static readonly HAS_ROLE_IN = IM.NAMESPACE + "hasRoleInOrganisation";
  public static readonly IS_PERSON = IM.NAMESPACE + "isPerson";
  public static readonly HAS_CONTEXT = IM.NAMESPACE + "hasContext";
  public static readonly DISPLAY_ORDER = IM.NAMESPACE + "displayOrder";
  public static readonly USAGE_TOTAL = IM.NAMESPACE + "usageTotal";
  public static readonly DESCENDING = IM.NAMESPACE + "Descending";
  public static readonly ASCENDING = IM.NAMESPACE + "Ascending";
  public static readonly PLABEL = IM.NAMESPACE + "pLabel";
  public static readonly OLABEL = IM.NAMESPACE + "oLabel";
  public static readonly EXAMPLE = IM.NAMESPACE + "example";
  public static readonly IM1ID = IM.NAMESPACE + "im1Id";
  public static readonly PRIVACY_LEVEL = IM.NAMESPACE + "privacyLevel";
  public static readonly IM1SCHEME = IM.NAMESPACE + "im1Scheme";
  public static readonly VALUE_SELECT = IM.NAMESPACE + "valueSelect";
  public static readonly VALUE_VARIABLE = IM.NAMESPACE + "valueVariable";
  public static readonly PLACEHOLDER = IM.NAMESPACE + "placeHolder";
  public static readonly FUNCTION_DEFINITION = IM.NAMESPACE + "function";
  public static readonly ADDRESS_CLASS = IM.NAMESPACE + "Address";
  public static readonly ADDRESS = IM.NAMESPACE + "address";
  public static readonly ADDRESS_LINE_1 = IM.NAMESPACE + "addressLine1";
  public static readonly ADDRESS_LINE_2 = IM.NAMESPACE + "addressLine2";
  public static readonly ADDRESS_LINE_3 = IM.NAMESPACE + "addressLine3";
  public static readonly LOCALITY = IM.NAMESPACE + "locality";
  public static readonly REGION = IM.NAMESPACE + "region";
  public static readonly POST_CODE = IM.NAMESPACE + "postCode";
  public static readonly COUNTRY = IM.NAMESPACE + "country";
  public static readonly UPRN = IM.NAMESPACE + "uprn";
  public static readonly SYSTEM_NAMESPACE = "http://sys.endhealth.info/im#";
  public static readonly ENTITY_TYPES = IM.NAMESPACE + "EntityTypes";
  public static readonly ID = IM.NAMESPACE + "id";
  public static readonly CONCEPT_SET_GROUP = IM.NAMESPACE + "ConceptSetGroup";
  public static readonly OLD_CODE = IM.NAMESPACE + "oldCode";
  public static readonly ORDER = IM.NAMESPACE + "order";
  public static readonly MAPPING_TASK = IM.NAMESPACE + "MappingTask";
  public static readonly UPDATE_TASK = IM.NAMESPACE + "UpdateTask";
  public static readonly MATCHED_FROM = IM.NAMESPACE + "matchedFrom";
  public static readonly MAPPED_FROM = IM.NAMESPACE + "mappedFrom";
  public static readonly SELECT = IM.NAMESPACE + "select";
  public static readonly NATIONALLY_ASSURED_UK = IM.NAMESPACE + "NationallyAssuredUK";
  public static readonly ENTITY = IM.NAMESPACE + "Entity";
  public static readonly QUERY_SET = IM.NAMESPACE + "QuerySet";
  public static readonly QUERY_TEMPLATE = IM.NAMESPACE + "QueryTemplate";
  public static readonly RECORD_TYPE = IM.NAMESPACE + "RecordType";
  public static readonly FEATURE = IM.NAMESPACE + "MatchClause";
  public static readonly DATA_PROPERTY = IM.NAMESPACE + "DataProperty";
  public static readonly ORGANISATION = IM.NAMESPACE + "Organisation";
  public static readonly MODELLING_ENTITY_TYPE = IM.NAMESPACE + "ModellingEntityType";
  public static readonly PROFILE = IM.NAMESPACE + "Profile";
  public static readonly STATS_REPORT_ENTRY = IM.NAMESPACE + "hasStatsReportEntry";
  public static readonly FAVOURITES = IM.NAMESPACE + "Favourites";
  public static readonly MODULE_ONTOLOGY = IM.NAMESPACE + "DiscoveryOntology";
  public static readonly MODULE_SETS = IM.NAMESPACE + "Sets";
  public static readonly MODULE_DATA_MODEL = IM.NAMESPACE + "DiscoveryCommonDataModel";
  public static readonly MODULE_CATALOGUE = IM.NAMESPACE + "Catalogue";
  public static readonly MODULE_QUERIES = IM.NAMESPACE + "Q_Queries";
  public static readonly MODULE_IM = IM.NAMESPACE + "InformationModel";
  public static readonly MODULE_TASKS = IM.NAMESPACE + "Tasks";
  public static readonly MODULE_FEATURES = IM.NAMESPACE + "M_MatchClauses";
  public static readonly CONCEPT_CATEGORY = IM.NAMESPACE + "ontologyOverview";
  public static readonly CONCEPT_TYPES = IM.NAMESPACE + "ontologyConceptTypes";
  public static readonly CONCEPT_SCHEMES = IM.NAMESPACE + "ontologyConceptSchemes";
  public static readonly CONCEPT_STATUS = IM.NAMESPACE + "ontologyConceptStatus";
  public static readonly HAS_VALUE = IM.NAMESPACE + "hasValue";
  public static readonly VALUE_SET = IM.NAMESPACE + "ValueSet";
  public static readonly DATAMODEL_ENTITY = IM.NAMESPACE + "DataModelEntity";
  public static readonly DATAMODEL_OBJECTPROPERTY = IM.NAMESPACE + "dataModelObjectProperty";
  public static readonly DATAMODEL_DATAPROPERTY = IM.NAMESPACE + "dataModelDataProperty";
  public static readonly DATAMODEL_FUNCTIONPROPERTY = IM.NAMESPACE + "functionProperty";
  public static readonly MATCH = IM.NAMESPACE + "match";
  public static readonly ENTITY_TYPE = IM.NAMESPACE + "entityType";
  public static readonly VALUE_DATA = IM.NAMESPACE + "valueData";
  public static readonly VALUE_OBJECT = IM.NAMESPACE + "valueObject";
  public static readonly VALUE_IRI = IM.NAMESPACE + "valueIri";
  public static readonly VALUE_IRI_LIST = IM.NAMESPACE + "valueIriList";
  public static readonly VALUE_DATA_LIST = IM.NAMESPACE + "valueDataList";
  public static readonly IM_1_ID = IM.NAMESPACE + "im1Id";
  public static readonly IM_1_SCHEME = IM.NAMESPACE + "im1Scheme";
  public static readonly PROV_ACTIVITY_TYPE = IM.NAMESPACE + "provenanceActivityType";
  public static readonly FOLDER_VALUESETS = IM.NAMESPACE + "ValueSets";
  public static readonly FOLDER_SETS = IM.NAMESPACE + "Sets";
  public static readonly FOLDER_QUERY_CONCEPT_SETS = IM.NAMESPACE + "QueryConceptSets";
  public static readonly DATE_OF_ENTRY = IM.NAMESPACE + "dateOfEntry";
  public static readonly PARTICIPATION_TYPE = IM.NAMESPACE + "participationType";
  public static readonly PERSON_IN_ROLE = IM.NAMESPACE + "personInRole";
  public static readonly PROVENANCE_SOURCE_ENTITY = IM.NAMESPACE + "ProvenanceSourceEntity";
  public static readonly DERIVATION_TYPE = IM.NAMESPACE + "derivationType";
  public static readonly ENTITY_IDENTIFIER = IM.NAMESPACE + "entityIdentifier";
  public static readonly CODE_TEMPLATE = IM.NAMESPACE + "codeTemplate";
  public static readonly DATAMODEL_CLASSES = IM.NAMESPACE + "DataModelClasses";
  public static readonly DATE_TIME = IM.NAMESPACE + "DateTime";
  public static readonly TEMPLATE_NUMERIC_EVENT_ORDER = IM.NAMESPACE + "TEMPLATE_NumericEventOrder";
  public static readonly ORDER_BY = IM.NAMESPACE + "OrderBy";
  public static readonly PARAMETER_TEMPLATE = IM.NAMESPACE + "parameterTemplate";
  public static readonly VALUE_TEMPLATE = IM.NAMESPACE + "valueTemplate";
  public static readonly DEFAULT_VALUE = IM.NAMESPACE + "defaultValue";
  public static readonly LOAD_MORE = IM.NAMESPACE + "loadMore";
  public static readonly DATA_MODEL_CONCEPT = IM.NAMESPACE + "concept";
  public static readonly NUMERIC_VALUE = IM.NAMESPACE + "NumericValue";
  public static readonly HEALTH_RECORDS = IM.NAMESPACE + "HealthRecords";
}
