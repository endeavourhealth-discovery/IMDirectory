import ParserService from "@/services/parser.service";
import express, { NextFunction, Request, Response } from "express";

export default class ParserController {
  public path = "/node_api/parser";
  public router = express.Router();
  private parserService: ParserService;

  constructor() {
    this.initRoutes();
    this.parserService = new ParserService();
  }

  private initRoutes() {
    this.router.post("/public/text/list", (req, res, next) => this.getListFromText(req, res, next));
    this.router.post("/public/file/list", (req, res, next) => this.getListFromFile(req, res, next));
  }

  getListFromText(req: Request, res: Response, next: NextFunction) {
    try {
      const data = this.parserService.getListFromText(req.body.text as string);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }

  getListFromFile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = this.parserService.getListFromFile(req.body.file, req.body.selectedColumn);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }
}
