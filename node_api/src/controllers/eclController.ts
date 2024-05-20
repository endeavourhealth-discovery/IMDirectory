import EclService from "@/services/ecl.service";
import axios from "axios";
import { Request } from "express";
import router from "express-promise-router";

export default class EclController {
  public path = "/node_api/ecl";
  public router = router();
  private eclService;

  constructor() {
    this.initRoutes();
    this.eclService = new EclService(axios);
  }

  private initRoutes() {
    this.router.post("/public/eclSearch", (req, res, next) =>
      this.eclSearch(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.post("/public/evaluateEcl", (req, res, next) =>
      this.evaluateEcl(req)
        .then(data => res.send(data))
        .catch(next)
    );
  }

  async eclSearch(req: Request) {
    const eclSearchRequest = req.body;
    return await this.eclService.eclSearch(eclSearchRequest);
  }

  async evaluateEcl(req: Request) {
    return await this.eclService.evaluateEcl(req.body);
  }
}
