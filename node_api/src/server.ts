/// <reference types="vite/client" />
import App from "./app";
import * as dotenv from "dotenv";
import QueryController from "./controllers/queryController";
import ValidationController from "./controllers/validationController";
import GithubController from "./controllers/githubController";
import bodyParser from "body-parser";
import * as dns from "dns";
import EntityController from "./controllers/entityController";
import CognitoController from "./controllers/cognitoController";
import FhirController from "@/controllers/fhirController";
import StatusController from "./controllers/statusController";
import gracefulShutdown from "http-graceful-shutdown";
import logger from "./middlewares/logger.middleware";
import { morganMiddlewareConsole, morganMiddlewareFile } from "./middlewares/morgan.middleware";
import CodeGenController from "@/controllers/codeGenController";
import metricsInterceptor from "@/middlewares/metrics.middleware";

dotenv.config();

dns.setDefaultResultOrder("ipv4first");

const app = new App({
  port: 3000,
  controllers: [
    new StatusController(),
    new QueryController(),
    new ValidationController(),
    new GithubController(),
    new EntityController(),
    new CognitoController(),
    new FhirController(),
    new CodeGenController()
  ],
  middleWares: [
    metricsInterceptor,
    bodyParser.json({ type: "application/json" }),
    bodyParser.text({ type: "text/plain" }),
    bodyParser.urlencoded({ extended: true }),
    morganMiddlewareConsole,
    morganMiddlewareFile
  ]
});

process.on("uncaughtException", err => {
  console.error("fatal", err);
  logger.log("fatal", err);
  process.exit(1);
});

process.on("unhandledRejection", err => {
  console.error("fatal", err);
  logger.log("fatal", err);
  process.exit(1);
});

if (import.meta.env.PROD) app.listen();

function shutdownFunction(signal?: string | undefined): Promise<void> {
  return new Promise(resolve => {
    logger.warn("... called signal: " + signal);
    logger.warn("... in cleanup");
    setTimeout(function () {
      logger.warn("... cleanup finished");
      resolve();
    }, 1000);
  });
}

function finalFunction() {
  logger.warn("Server gracefully shutdown");
}

gracefulShutdown(app.app, { onShutdown: shutdownFunction, finally: finalFunction, development: true });

export const viteNodeApp = app.app;
