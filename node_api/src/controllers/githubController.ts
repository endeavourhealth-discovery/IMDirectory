import { NextFunction, Request, Response } from "express";
import { GithubRelease } from "@im-library/interfaces/AutoGen";
import setGithubConfig from "@/logic/setGithubConfig";
import { CONFIG } from "@im-library/vocabulary";
import getGithubConfig, { getGithubLatest, getGithubReleases } from "@/logic/getGithubConfig";
import AuthMiddleware from "@/middlewares/auth.middleware";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";
import router from "express-promise-router";

export default class GithubController {
  public path = "/";
  public router = router();
  private auth;

  constructor() {
    this.auth = new AuthMiddleware();
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get("/node_api/github/updateGithubConfig", this.auth.secure("IMAdmin"), (req, res, next) =>
      this.updateGithubConfigs()
        .then(() => res.end())
        .catch(next)
    );
  }

  private async updateGithubConfigs() {
    await setGithubConfig();
  }
}
