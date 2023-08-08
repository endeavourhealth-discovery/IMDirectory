import { Request } from "express";
import router from "express-promise-router";
import WorkflowService from "@/services/workflow.service";
import AuthMiddleware from "@/middlewares/auth.middleware";
import { isBugReport } from "@im-library/helpers/TypeGuards";
import MailService from "@/services/mailer.service";

export default class WorkflowController {
  public path = "/node_api/workflow";
  public router = router();
  private workflowService;
  private mailService;
  private auth;

  constructor() {
    this.initRoutes();
    this.workflowService = new WorkflowService();
    this.mailService = MailService.getInstance();
    this.auth = new AuthMiddleware();
  }

  private initRoutes() {
    this.router.get("/getBugReport", this.auth.secure(), async (req, res, next) => {
      this.getBugReport(req)
        .then(data => res.send(data))
        .catch(next);
    });
    this.router.post("/createBugReport", this.auth.secure(), async (req, res, next) => {
      this.setBugReport(req)
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
    await this.setBugReport(req);
    if (process.env.NODE_ENV === "production") await this.mailService.createConnection();
    else await this.mailService.createLocalConnection();
    await this.mailService.sendMail(req.headers["X-Request-Id"] as string, {
      from: "test@voror.co.uk",
      to: "test@voror.co.uk",
      subject: `New bug report submitted : ${req.body.id}`,
      text: "A new bug report has been submitted"
    });
  }

  async setBugReport(req: Request) {
    if (isBugReport(req.body)) {
      return this.workflowService.setBugReport(req.body);
    } else throw new Error("Input data is not of type BugReport");
  }
}
