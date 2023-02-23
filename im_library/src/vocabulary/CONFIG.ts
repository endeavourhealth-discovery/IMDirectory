export class CONFIG {
    public static DOMAIN = "http://endhealth.info/";
    public static NAMESPACE = CONFIG.DOMAIN + "config#";
    public static PREFIX = "cfg";

    // Config entries
    public static DEFINITION = CONFIG.NAMESPACE + "definition";
    public static SUMMARY = CONFIG.NAMESPACE + "summary";
    public static FILTER_DEFAULTS = CONFIG.NAMESPACE + "filterDefaults";
    public static INFERRED_PREDICATES = CONFIG.NAMESPACE + "inferredPredicates";
    public static INFERRED_EXCLUDE_PREDICATES = CONFIG.NAMESPACE + "inferredExcludePredicates";
    public static CONCEPT_DASHBOARD = CONFIG.NAMESPACE + "conceptDashboard";
    public static DEFAULT_PREDICATE_NAMES = CONFIG.NAMESPACE + "defaultPredicateNames";
    public static XML_SCHEMA_DATATYPES = CONFIG.NAMESPACE + "xmlSchemaDataTypes";
    public static DEFAULT_PREFIXES = CONFIG.NAMESPACE + "defaultPrefixes";
    public static GRAPH_EXCLUDE_PREDICATES = CONFIG.NAMESPACE + "graphExcludePredicates";
    public static IM1_PUBLISH = CONFIG.NAMESPACE + "im1Publish";
}