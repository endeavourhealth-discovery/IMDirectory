export class IM {
  public static NAMESPACE = "http://endhealth.info/im#";
  public static PREFIX = "im";
  public static IRI = "@id";
  public static CONCEPT = IM.NAMESPACE + "Concept";
  public static CONCEPT_SET_GROUP = IM.NAMESPACE + "ConceptSetGroup";
  public static CODE = IM.NAMESPACE + "code";
  public static SCHEME = IM.NAMESPACE + "scheme";
  public static STATUS = IM.NAMESPACE + "Status";
  public static HAS_STATUS = IM.NAMESPACE + "status";
  public static IS_A = IM.NAMESPACE + "isA";
  public static ROLE_GROUP = IM.NAMESPACE + "roleGroup";
  public static IS_CONTAINED_IN = IM.NAMESPACE + "isContainedIn";
  public static PROPERTY_GROUP = IM.NAMESPACE + "propertyGroup";
  public static INHERITED_FROM = IM.NAMESPACE + "inheritedFrom";
  public static IS_CHILD_OF = IM.NAMESPACE + "isChildOf";
  public static HAS_CHILDREN = IM.NAMESPACE + "hasChildren";
  public static DEFINITION = IM.NAMESPACE + "definition";
  public static USAGE_STATS = IM.NAMESPACE + "usageStats";

  // mapping
  public static HAS_MAP = IM.NAMESPACE + "hasMap";
  public static ONE_OF = IM.NAMESPACE + "oneOf";
  public static MAP_ADVICE = IM.NAMESPACE + "mapAdvice";
  public static MATCHED_TO = IM.NAMESPACE + "matchedTo";
  public static MATCHED_FROM = IM.NAMESPACE + "matchedFrom";
  public static MAP_PRIORITY = IM.NAMESPACE + "mapPriority";
  public static ASSURANCE_LEVEL = IM.NAMESPACE + "assuranceLevel";
  public static COMBINATION_OF = IM.NAMESPACE + "combinationOf";
  public static SOME_OF = IM.NAMESPACE + "someOf";
  public static MAPPED_TO = IM.NAMESPACE + "mappedTo";
  public static MAPPED_FROM = IM.NAMESPACE + "mappedFrom";
  //maps assurance levels
  public static NATIONALLY_ASSURED_UK = IM.NAMESPACE + "NationallyAssuredUK";

  public static QUERY_SET = IM.NAMESPACE + "QuerySet";
  public static QUERY_TEMPLATE = IM.NAMESPACE + "QueryTemplate";
  public static CONCEPT_SET = IM.NAMESPACE + "ConceptSet";
  public static VALUE_SET = IM.NAMESPACE + "ValueSet";
  public static HAS_MEMBERS = IM.NAMESPACE + "hasMembers";
  public static SET = IM.NAMESPACE + "Set";
  public static RECORD_TYPE = IM.NAMESPACE + "RecordType";
  public static FOLDER = IM.NAMESPACE + "Folder";
  public static DATA_PROPERTY = IM.NAMESPACE + "DataProperty";
  public static ORGANISATION = IM.NAMESPACE + "Organisation";
  public static ADDRESS = IM.NAMESPACE + "address";
  public static MODELLING_ENTITY_TYPE = IM.NAMESPACE + "ModellingEntityType";

  // code schemes
  public static CODE_SCHEME = IM.NAMESPACE + "CodeScheme";
  public static CODE_SCHEME_SNOMED = IM.NAMESPACE + "SnomedCodeScheme";
  public static CODE_SCHEME_READ = IM.NAMESPACE + "Read2CodeScheme";
  public static CODE_SCHEME_ICD10 = IM.NAMESPACE + "ICD10CodeScheme";
  public static CODE_SCHEME_OPCS4 = IM.NAMESPACE + "OPSC49CodeScheme";
  public static CODE_SCHEME_EMIS = IM.NAMESPACE + "EMISCodeScheme";
  public static CODE_SCHEME_BARTS = IM.NAMESPACE + "BartsCernerCodeScheme";
  public static CODE_SCHEME_VISION = IM.NAMESPACE + "VisionCodeScheme";
  public static CODE_SCHEME_CTV3 = IM.NAMESPACE + "CTV3TPPCodeScheme";
  public static CODE_SCHEME_TERMS = IM.NAMESPACE + "TermOnlyCodeScheme";
  public static CODE_SCHEME_ODS = IM.NAMESPACE + "ODSCodeScheme";
  public static DISCOVERY_CODE = IM.NAMESPACE + "DiscoveryCodeScheme";

  public static STATS_REPORT_ENTRY = IM.NAMESPACE + "hasStatsReportEntry";

  public static MODULE_ONTOLOGY = IM.NAMESPACE + "DiscoveryOntology";
  public static MODULE_SETS = IM.NAMESPACE + "Sets";
  public static MODULE_DATA_MODEL = IM.NAMESPACE + "DiscoveryCommonDataModel";
  public static MODULE_CATALOGUE = IM.NAMESPACE + "Catalogue";
  public static MODULE_QUERIES = IM.NAMESPACE + "QT_QueryTemplates";
  public static MODULE_IM = IM.NAMESPACE + "InformationModel";

  // Stats reports
  public static CONCEPT_CATEGORY = IM.NAMESPACE + "ontologyOverview";
  public static CONCEPT_TYPES = IM.NAMESPACE + "ontologyConceptTypes";
  public static CONCEPT_SCHEMES = IM.NAMESPACE + "ontologyConceptSchemes";
  public static CONCEPT_STATUS = IM.NAMESPACE + "ontologyConceptStatus";
}
