import EclService from "@/services/ecl.service";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";
import router from "express-promise-router";

export default class EclController {
  public path = "/node_api/ecl";
  public router = router();
  private eclService;

  constructor() {
    this.initRoutes();
    this.eclService = new EclService(axios);
  }

  private initRoutes() {
    this.router.post("/public/eclToBuilder", (req, res, next) =>
      this.eclToBuild(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.post("/public/eclToIMQ", (req, res, next) =>
      this.eclToIMQ(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.post("/public/eclSearch", (req, res, next) =>
      this.eclSearch(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.post("/public/validateEcl", (req, res, next) =>
      this.validateEcl(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.post("/public/evaluateEcl", (req, res, next) =>
      this.evaluateEcl(req)
        .then(data => res.send(data))
        .catch(next)
    );
  }

  async eclToBuild(req: Request) {
    const ecl = req.body;
    return this.eclService.eclToBuild(ecl);
  }

  async eclToIMQ(req: Request) {
    const ecl = req.body;
    return this.eclService.eclToIMQ(ecl);
  }

  async eclSearch(req: Request) {
    const eclSearchRequest = req.body;
    return await this.eclService.eclSearch(eclSearchRequest);
  }

  async validateEcl(req: Request) {
    return this.eclService.validateEcl(req.body);
  }

  async evaluateEcl(req: Request) {
    return await this.eclService.evaluateEcl(req.body);
  }
}
