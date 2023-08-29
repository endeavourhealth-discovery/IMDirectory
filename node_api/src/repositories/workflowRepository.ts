import { GraphdbService, sanitise, desanitise } from "@/services/graphdb.service";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { BugReport } from "@im-library/interfaces";
import { IM, RDF, RDFS, WORKFLOW } from "@im-library/vocabulary";

export default class WorkflowRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.workflowRepo();
  }

  public async getBugReport(url: string): Promise<BugReport> {
    const qry =
      "SELECT ?s ?wfType ?wfCreatedBy ?wfAssignedTo ?wfRelatedProduct ?wfRelatedModule ?wfVersion ?wfOS ?wfBrowser wfSeverity ?wfStatus ?wfError ?description ?wfReproduceSteps ?wfExpectedResult ?wfDateCreated ?wfState " +
      "WHERE { " +
      "GRAPH ?c { " +
      "?s ?type ?wfType;" +
      "?createdBy ?wfCreatedBy;" +
      "?assignedTo ?wfAssignedTo;" +
      "?state ?wfState;" +
      "?dateCreated ?wfDateCreated ." +
      "OPTIONAL {?s ?relatedProduct ?wfRelatedProduct;}" +
      "OPTIONAL {?s ?relatedModule ?wfRelatedModule;}" +
      "OPTIONAL {?s ?version ?wfVersion;}" +
      "OPTIONAL {?s ?os ?wfOS;}" +
      "OPTIONAL {?s ?browser ?wfBrowser" +
      "OPTIONAL {?s ?severity ?wfSeverity;}" +
      "OPTIONAL {?s ?status ?wfStatus;}" +
      "OPTIONAL {?s ?error ?wfError;}" +
      "OPTIONAL {?s ?description ?wfDescription" +
      "OPTIONAL {?s ?reproduceSteps wfReproduceSteps;}" +
      "OPTIONAL {?s ?expectedResult ?wfExpectedResult;}" +
      "OPTIONAL {?actualResult ?wfActualResult;}" +
      "} " +
      "}";
    const rs = await this.graph.execute(qry, {
      c: sanitise(WORKFLOW.NAMESPACE),
      s: sanitise(url),
      label: sanitise(RDFS.LABEL),
      type: sanitise(RDF.TYPE),
      wfType: sanitise(WORKFLOW.BUG_REPORT),
      createdBy: sanitise(WORKFLOW.CREATED_BY),
      assignedTo: sanitise(WORKFLOW.ASSIGNED_TO),
      state: sanitise(WORKFLOW.STATE),
      relatedProduct: sanitise(WORKFLOW.RELATED_PRODUCT),
      relatedModule: sanitise(WORKFLOW.RELATED_MODULE),
      version: sanitise(WORKFLOW.RELATED_VERSION),
      os: sanitise(WORKFLOW.OPERATING_SYSTEM),
      browser: sanitise(WORKFLOW.BROWSER),
      severity: sanitise(WORKFLOW.SEVERITY),
      status: sanitise(IM.HAS_STATUS),
      error: sanitise(WORKFLOW.ERROR),
      description: sanitise(RDFS.COMMENT),
      reproduceSteps: sanitise(WORKFLOW.REPRODUCE_STEPS),
      expectedResult: sanitise(WORKFLOW.EXPECTED_RESULT),
      actualResult: sanitise(WORKFLOW.ACTUAL_RESULT),
      dateCreated: sanitise(WORKFLOW.DATE_CREATED)
    });
    const bugReport = {} as BugReport;
    if (isArrayHasLength(rs)) {
      const r = rs[0];
      bugReport.id = r.s.value;
      bugReport.type = r.wfType.value;
      bugReport.createdBy = r.wfCreatedBy.value;
      bugReport.assignedTo = r.wfAssignedTo.value;
      bugReport.state = r.wfState.value;
      bugReport.dateCreated = new Date(r.wfDateCreated.value);
      if (isObjectHasKeys(r, ["wfRelatedProduct"])) bugReport.product = r.wfRelatedProduct.value;
      if (isObjectHasKeys(r, ["wfRelatedModule"])) bugReport.module = r.wfRelatedModule.value;
      if (isObjectHasKeys(r, ["wfRelatedProduct"])) bugReport.product = r.wfRelatedProduct.value;
      if (isObjectHasKeys(r, ["wfVersion"])) bugReport.version = r.wfVersion.value;
      if (isObjectHasKeys(r, ["wfOS"])) bugReport.OS = r.wfOS.value;
      if (isObjectHasKeys(r, ["wfBrowser"])) bugReport.browser = r.wfBrowser.value;
      if (isObjectHasKeys(r, ["wfSeverity"])) bugReport.severity = r.wfSeverity.value;
      if (isObjectHasKeys(r, ["wfStatus"])) bugReport.status = r.wfStatus.value;
      if (isObjectHasKeys(r, ["wfError"])) bugReport.error = r.wfError.value;
      if (isObjectHasKeys(r, ["wfDescription"])) bugReport.description = r.wfDescription.value;
      if (isObjectHasKeys(r, ["wfReproduceSteps"])) bugReport.reproduceSteps = desanitise(r.wfReproduceSteps.value);
      if (isObjectHasKeys(r, ["wfExpectedResult"])) bugReport.expectedResult = r.wfExpectedResult.value;
      if (isObjectHasKeys(r, ["wfActualResult"])) bugReport.actualResult = r.wfActualResult.value;
    }
    return bugReport;
  }

  public async setBugReport(bugReport: BugReport) {
    await this.graph.delete(sanitise(bugReport.id));

    for (const [key, value] of Object.entries(bugReport)) {
      if (key !== "id") await this.insert(bugReport.id, this.bugReportKeyToIri(key), value);
    }
  }

  public async generateId(): Promise<string> {
    const qry = "SELECT DISTINCT ?s WHERE { GRAPH ?graph {?s ?p ?o .}} ORDER BY DESC (?s) LIMIT 1";
    const rs = await this.graph.execute(qry, { graph: sanitise(WORKFLOW.NAMESPACE), p: sanitise(RDF.TYPE) });
    if (isArrayHasLength(rs)) {
      const iri = rs[0].s.id as string;
      const code = parseInt(iri.split("#")[1]);
      return iri.split("#")[0] + "#" + (code + 1).toString();
    } else return WORKFLOW.NAMESPACE + "10000000";
  }

  private async insert(subject: string, predicate: string, object: any) {
    const qry =
      "INSERT DATA { GRAPH " + sanitise(WORKFLOW.NAMESPACE) + " { " + sanitise(subject) + " " + sanitise(predicate) + " " + sanitise(object) + " . } }";
    await this.graph.update(qry);
  }

  private bugReportKeyToIri(key: string) {
    switch (key) {
      case "createdBy":
        return WORKFLOW.CREATED_BY;
      case "type":
        return RDF.TYPE;
      case "assignedTo":
        return WORKFLOW.ASSIGNED_TO;
      case "state":
        return WORKFLOW.STATE;
      case "product":
        return WORKFLOW.RELATED_PRODUCT;
      case "version":
        return WORKFLOW.RELATED_VERSION;
      case "module":
        return WORKFLOW.RELATED_MODULE;
      case "OS":
        return WORKFLOW.OPERATING_SYSTEM;
      case "browser":
        return WORKFLOW.BROWSER;
      case "severity":
        return WORKFLOW.SEVERITY;
      case "status":
        return IM.HAS_STATUS;
      case "error":
        return WORKFLOW.ERROR;
      case "reproduceSteps":
        return WORKFLOW.REPRODUCE_STEPS;
      case "expectedResult":
        return WORKFLOW.EXPECTED_RESULT;
      case "actualResult":
        return WORKFLOW.ACTUAL_RESULT;
      case "dateCreated":
        return WORKFLOW.DATE_CREATED;
      case "description":
        return RDFS.COMMENT;
      default:
        throw new Error(`Unexpected key ${key}`);
    }
  }
}
