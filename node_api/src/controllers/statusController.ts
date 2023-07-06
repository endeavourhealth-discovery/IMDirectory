import router from "express-promise-router";

export default class StatusController {
  public path = "/";
  public router = router();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/node_api/status/public/healthCheck", (req, res, next) => {
      res.status(200).send("OK");
    });
  }
}
