import { Request } from "express";
import router from "express-promise-router";
import WorkflowService from "@/services/workflow.service";
import AuthMiddleware from "@/middlewares/auth.middleware";
import { isBugReport } from "@im-library/helpers/TypeGuards";
import MailService from "@/services/mailer.service";
import { BugReport } from "@im-library/interfaces";
import GithubService from "@/services/github.service";
import { WORKFLOW } from "@im-library/vocabulary";
import { WorkflowEnums } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

export default class WorkflowController {
  public path = "/node_api/workflow";
  public router = router();
  private workflowService: WorkflowService;
  private mailService: MailService;
  private githubService: GithubService;
  private auth: AuthMiddleware;

  constructor() {
    this.mailService = MailService.getInstance();
    this.auth = new AuthMiddleware();
    this.workflowService = new WorkflowService();
    this.githubService = new GithubService();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/getBugReport", this.auth.secure(), async (req, res, next) => {
      this.getBugReport(req)
        .then(data => res.send(data))
        .catch(next);
    });
    this.router.post("/createBugReport", this.auth.secure(), async (req, res, next) => {
      this.createBugReport(req)
        .then(() => res.end())
        .catch(next);
    });
  }

  async getBugReport(req: Request) {
    if (typeof req.query.iri === "string") {
      return this.workflowService.getBugReport(req.query.iri);
    } else throw new Error("Iri parameter is required.");
  }

  async createBugReport(req: Request) {
    const bugReport = req.body;
    bugReport.id = await this.workflowService.generateId();
    const latestRelease = await this.githubService.getLatestRelease("IMDirectory");
    if (latestRelease && isObjectHasKeys(latestRelease, ["version"])) bugReport.version = latestRelease.version;
    bugReport.type = WORKFLOW.BUG_REPORT;
    bugReport.state = WorkflowEnums.State.TODO;
    await this.setBugReport(bugReport);
    if (process.env.NODE_ENV === "production") await this.mailService.createConnection();
    else await this.mailService.createLocalConnection();
    await this.mailService.sendMail(req.headers["X-Request-Id"] as string, {
      from: "api@voror.co.uk",
      to: "support@voror.co.uk",
      subject: `New bug report submitted : ${bugReport.id}`,
      text: `A new bug report has been submitted with ID: ${bugReport.id}`
    });
  }

  async setBugReport(bugReport: BugReport) {
    if (isBugReport(bugReport)) {
      return this.workflowService.setBugReport(bugReport);
    } else throw new Error("Input data is not of type BugReport");
  }
}
