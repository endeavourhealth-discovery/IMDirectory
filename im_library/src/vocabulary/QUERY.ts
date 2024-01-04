export class QUERY {
	public static readonly DOMAIN = "http://endhealth.info/im#";
	public static readonly NAMESPACE = QUERY.DOMAIN + "Query_";
	public static readonly ALLOWABLE_RANGES = QUERY.NAMESPACE + "AllowableRanges";
	public static readonly GET_ISAS = QUERY.NAMESPACE + "GetIsas";
	public static readonly GET_DESCENDANTS = QUERY.NAMESPACE + "GetDescendants";
	public static readonly SEARCH_CONTAINED_IN = QUERY.NAMESPACE + "SearchContainedIn";
	public static readonly ALLOWABLE_CHILD_TYPES = QUERY.NAMESPACE + "AllowableChildTypes";
	public static readonly PROPERTY_RANGE = QUERY.NAMESPACE + "PropertyRange";
	public static readonly OBJECT_PROPERTY_RANGE_SUGGESTIONS = QUERY.NAMESPACE + "ObjectPropertyRangeSuggestions";
	public static readonly DATA_PROPERTY_RANGE_SUGGESTIONS = QUERY.NAMESPACE + "DataPropertyRangeSuggestions";
	public static readonly ALLOWABLE_PROPERTIES = QUERY.NAMESPACE + "AllowableProperties";
	public static readonly SEARCH_PROPERTIES = QUERY.NAMESPACE + "SearchProperties";
	public static readonly SEARCH_ENTITIES = QUERY.NAMESPACE + "SearchEntities";
	public static readonly SEARCH_FOLDERS = QUERY.NAMESPACE + "SearchFolders";
	public static readonly SEARCH_ALLOWABLE_CONTAINED_IN = QUERY.NAMESPACE + "SearchAllowableContainedIn";
	public static readonly SEARCH_MAIN_TYPES = QUERY.NAMESPACE + "SearchmainTypes";
	public static readonly DM_PROPERTY = QUERY.NAMESPACE + "DataModelPropertyByShape";
	public static readonly SEARCH_SUBCLASS = QUERY.NAMESPACE + "SearchAllowableSubclass";
}
