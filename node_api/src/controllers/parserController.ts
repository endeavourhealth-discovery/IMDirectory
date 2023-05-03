import ParserService from "@/services/parser.service";
import express, { NextFunction, Request, Response } from "express";
import router from "express-promise-router";

export default class ParserController {
  public path = "/node_api/parser";
  public router = router();
  private parserService: ParserService;

  constructor() {
    this.initRoutes();
    this.parserService = new ParserService();
  }

  private initRoutes() {
    this.router.post("/public/text/list", (req, res, next) =>
      this.getListFromText(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.post("/public/file/list", (req, res, next) =>
      this.getListFromFile(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
  }

  async getListFromText(req: Request) {
    return this.parserService.getListFromText(req.body.text as string);
  }

  async getListFromFile(req: Request) {
    return this.parserService.getListFromFile(req.body.file, req.body.selectedColumn);
  }
}
