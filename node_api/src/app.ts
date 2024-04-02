import express, { Application, Router } from "express";
import swaggerUi from "swagger-ui-express";
import * as swaggerFile from "@/../public/swagger_output.json";
import cors from "cors";
import Env from "@/services/env.service";
import errorHandler from "./middlewares/errorHandler.middleware";
import logger from "./middlewares/logger.middleware";
import initScheduledJobs from "./scheduledJobs";

class App {
  public app: Application;
  public port: number;
  public router: Router = express.Router();

  constructor(appInit: { port: number; controllers: any[]; middleWares: any[] }) {
    this.app = express();
    this.port = appInit.port;

    this.app.use(
      cors({
        origin: Env.ALLOWED_HOSTS,
        optionsSuccessStatus: 200
      })
    );

    this.app.get("/doc/swagger.json", (req, res) => {
      res.send(swaggerFile);
    });
    this.app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

    this.app.options("*", cors());

    appInit.middleWares.forEach(m => this.app.use(m));
    appInit.controllers.forEach(c => this.app.use(c.path, c.router));

    this.app.use(errorHandler);
    
    this.app.use(express.json({ limit: "50mb" }));

    initScheduledJobs();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`App started on port ${this.port}`);
    });
  }
}

export default App;
