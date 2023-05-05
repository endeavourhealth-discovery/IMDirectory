import express, { NextFunction, Request, Response } from "express";
import ProvService from "@/services/prov.service";
import router from "express-promise-router";

export default class ProvController {
  public path = "/node_api/prov";
  public router = router();
  private service: ProvService;

  constructor() {
    this.initRoutes();
    this.service = new ProvService();
  }

  private initRoutes() {
    this.router.get("/public/history", async (req, res, next) =>
      this.getProvHistory(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
  }

  async getProvHistory(req: Request) {
    return await this.service.getProvHistory(req.query.url as string);
  }
}
