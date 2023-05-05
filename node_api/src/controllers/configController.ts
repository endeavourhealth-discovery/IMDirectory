import express, { NextFunction, Request, Response } from "express";
import ConfigService from "@/services/config.service";
import { CONFIG } from "@im-library/vocabulary";
import router from "express-promise-router";

export default class ConfigController {
  public path = "/node_api/config";
  public router = router();
  private configService;

  constructor() {
    this.initRoutes();
    this.configService = new ConfigService();
  }

  private initRoutes() {
    this.router.get("/public/componentLayout", async (req, res, next) =>
      this.getComponentLayout(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/dashboardLayout", async (req, res, next) =>
      this.getDashboardLayout(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
  }

  async getComponentLayout(req: Request) {
    if (req.query.name === "summary") {
      return await this.configService.getConfig(CONFIG.SUMMARY);
    } else if (req.query.name === "definition") {
      return await this.configService.getConfig(CONFIG.DEFINITION);
    } else {
      throw new Error("Unknown component layout config");
    }
  }

  async getDashboardLayout(req: Request) {
    if (req.query.name === "conceptDashboard") {
      return await this.configService.getConfig(CONFIG.CONCEPT_DASHBOARD);
    } else {
      throw new Error("Unknown dashboard layout config");
    }
  }
}
