import { IM } from "../IM";

export class EDITOR {
  public static NAMESPACE = IM.NAMESPACE + "Editor_";

  public static CONCEPT_SHAPE = this.NAMESPACE + "ConceptShape";
  public static CONCEPT_SET_SHAPE = this.NAMESPACE + "ConceptSetShape";
  public static FOLDER_SHAPE = this.NAMESPACE + "FolderShape";
  public static DATA_MODEL_SHAPE = this.NAMESPACE + "DataModelShape";
  public static QUERY_SHAPE = this.NAMESPACE + "QueryShape";
  public static PROPERTY_SHAPE = this.NAMESPACE + "PropertyShape";
}
