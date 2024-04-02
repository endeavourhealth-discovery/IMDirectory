/// <reference types="vite/client" />
import App from "./app";
import * as dotenv from "dotenv";
import QueryController from "./controllers/queryController";
import ValidationController from "./controllers/validationController";
import GithubController from "./controllers/githubController";
import bodyParser from "body-parser";
import * as dns from "dns";
import SearchController from "./controllers/searchController";
import EntityController from "./controllers/entityController";
import CognitoController from "./controllers/cognitoController";
import ParserController from "./controllers/parserController";
import FhirController from "@/controllers/fhirController";
import EclController from "@/controllers/eclController";
import ConfigController from "@/controllers/configController";
import ProvController from "@/controllers/provController";
import StatusController from "./controllers/statusController";
import TransformController from "./controllers/transformController";
import gracefulShutdown from "http-graceful-shutdown";
import logger from "./middlewares/logger.middleware";
import { morganMiddlewareConsole, morganMiddlewareFile } from "./middlewares/morgan.middleware";
import WorkflowController from "./controllers/workflowController";
import FunctionController from "./controllers/functionController";
import CodeGenController from "@/controllers/codeGenController";

dotenv.config();

dns.setDefaultResultOrder("ipv4first");

const app = new App({
  port: 3000,
  controllers: [
    new StatusController(),
    new QueryController(),
    new ValidationController(),
    new GithubController(),
    new SearchController(),
    new EntityController(),
    new CognitoController(),
    new ParserController(),
    new FhirController(),
    new EclController(),
    new ConfigController(),
    new ProvController(),
    new WorkflowController(),
    new TransformController(),
    new FunctionController(),
    new CodeGenController()
  ],
  middleWares: [
    bodyParser.json({ type: "application/json" }),
    bodyParser.text({ type: "text/plain" }),
    bodyParser.urlencoded({ extended: true }),
    morganMiddlewareConsole,
    morganMiddlewareFile
  ]
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
