export class WORKFLOW {
  public static DOMAIN = "http://endhealth.info/";
  public static NAMESPACE = this.DOMAIN + "workflow#";

  public static BUG_REPORT = this.NAMESPACE + "bugReport";

  public static DATE_CREATED = this.NAMESPACE + "dateCreated";
  public static CREATED_BY = this.NAMESPACE + "createdBy";
  public static ASSIGNED_TO = this.NAMESPACE + "assignedTo";
  public static STATE = this.NAMESPACE + "state";

  // bug report
  public static RELATED_PRODUCT = this.NAMESPACE + "relatedProduct";
  public static RELATED_MODULE = this.NAMESPACE + "relatedModule";
  public static OPERATING_SYSTEM = this.NAMESPACE + "operatingSystem";
  public static BROWSER = this.NAMESPACE + "browser";
  public static SEVERITY = this.NAMESPACE + "severity";
  public static ERROR = this.NAMESPACE + "errorDetails";
  public static REPRODUCE_STEPS = this.NAMESPACE + "reproduceSteps";
  public static EXPECTED_RESULT = this.NAMESPACE + "expectedResult";
  public static ACTUAL_RESULT = this.NAMESPACE + "actualResult";
  public static RELATED_VERSION = this.NAMESPACE + "relatedVersion";
}
