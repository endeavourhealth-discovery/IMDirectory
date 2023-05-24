import { IM } from "../IM";

export class QUERY {
  public static NAMESPACE = IM.NAMESPACE + "Query_";

  public static ALLOWABLE_RANGES = QUERY.NAMESPACE + "AllowableRanges";
  public static GET_ISAS = QUERY.NAMESPACE + "GetIsas";
  public static ALLOWABLE_CHILD_TYPES = QUERY.NAMESPACE + "AllowableChildTypes";
  public static PROPERTY_RANGE = QUERY.NAMESPACE + "PropertyRange";
  public static OBJECT_PROPERTY_RANGE_SUGGESTIONS = QUERY.NAMESPACE + "ObjectPropertyRangeSuggestions";
  public static DATA_PROPERTY_RANGE_SUGGESTIONS = QUERY.NAMESPACE + "DataPropertyRangeSuggestions";
  public static ALLOWABLE_PROPERTIES = QUERY.NAMESPACE + "AllowableProperties";
  public static SEARCH_PROPERTIES = QUERY.NAMESPACE + "SearchProperties";
  public static SEARCH_ENTITIES = QUERY.NAMESPACE + "SearchEntities";
  public static SEARCH_MAIN_TYPES = QUERY.NAMESPACE + "SearchmainTypes";
}
