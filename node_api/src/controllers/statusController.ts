import router from "express-promise-router";

export default class StatusController {
  public router = router();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/public/status", (req, res, next) => res.status(200).send("OK"));
  }
}
