import { Request } from "express";
import router from "express-promise-router";
import WorkflowService from "@/services/workflow.service";
import AuthMiddleware from "@/middlewares/auth.middleware";
import { isBugReport } from "@im-library/helpers/TypeGuards";

export default class WorkflowController {
  public path = "/node_api/workflow";
  public router = router();
  private workflowService;
  private auth;

  constructor() {
    this.initRoutes();
    this.workflowService = new WorkflowService();
    this.auth = new AuthMiddleware();
  }

  private initRoutes() {
    this.router.get("/getBugReport", this.auth.secure(), async (req, res, next) => {
      this.getBugReport(req)
        .then(data => res.send(data))
        .catch(next);
    });
    this.router.put("/setBugReport", this.auth.secure(), async (req, res, next) => {
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

  async setBugReport(req: Request) {
    if (isBugReport(req.body)) {
      return this.workflowService.setBugReport(req.body);
    } else throw new Error("Input data is not of type BugReport");
  }
}
