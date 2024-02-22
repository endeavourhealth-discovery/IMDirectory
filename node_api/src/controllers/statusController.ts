import router from "express-promise-router";
import StatusService from "@/services/status.service";
import axios from "axios";
import { GraphdbService } from "@/services/graphdb.service";
import Env from "@/services/env.service";

export default class StatusController {
  public path = "/";
  public router = router();
  private statusService: StatusService;

  constructor() {
    this.initRoutes();
    this.statusService = new StatusService(axios);
  }

  private initRoutes() {
    this.router.get("/node_api/status/public/healthCheck", async (req, res, next) => {
      let status = 200;
      let nodeStatus = 200;
      let imapiStatus;
      let graphStatus;
      await this.getImapiHealthCheck().then(r => {
        imapiStatus = r;
        if (imapiStatus !== 200) status = imapiStatus;
      });
      await this.getGraphDbHealthCheck().then(r => {
        graphStatus = r;
        if (graphStatus !== 200) status = graphStatus;
      });
      res.status(status).send("GraphDB:\t" + graphStatus + "\nIMAPI:\t" + imapiStatus + "\nNode_api:\t" + nodeStatus);
    });
    this.router.get("/node_api/status/public/health", (req, res, next) => {
      res.status(200).send("OK");
    });
  }

  async getImapiHealthCheck(): Promise<any> {
    return await this.statusService.imapiHealthCheck();
  }

  async getGraphDbHealthCheck(): Promise<any> {
    return await this.statusService.graphdbHealthCheck();
  }
}
