/// <reference types="vite/client" />
import App from "./app";
import * as dotenv from "dotenv";
import QueryController from "./controllers/queryController";
import SetController from "./controllers/setController";
import ValidationController from "./controllers/validationController";
import GithubController from "./controllers/githubController";
import bodyParser from "body-parser";
import * as dns from "dns";
import SearchController from "./controllers/searchController";
import EntityController from "./controllers/entityController";
import CognitoController from "./controllers/cognitoController";

dotenv.config();

dns.setDefaultResultOrder("ipv4first");

const app = new App({
  port: 3000,
  controllers: [
    new QueryController(),
    new ValidationController(),
    new GithubController(),
    new SearchController(),
    new SetController(),
    new EntityController(),
    new CognitoController()
  ],
  middleWares: [bodyParser.json(), bodyParser.urlencoded({ extended: true })]
});

if (import.meta.env.PROD) app.listen();

export const viteNodeApp = app.app;
