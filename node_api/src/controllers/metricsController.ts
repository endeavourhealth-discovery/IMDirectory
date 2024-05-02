import router from "express-promise-router";
import metrics from "@/middlewares/metrics.middleware";

export default class MetricsController {
  public path = "/metrics";
  public router = router();

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/", function (req, res) {
      res.setHeader("Content-Type", metrics.metrics.contentType);

      metrics.metrics.metrics().then(data => res.status(200).send(data));
    });
  }
}
