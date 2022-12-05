import { buildQueryDisplayFromQuery, getQueryDefinitionDisplayByIri } from "@/builders/query/displayBuilder";
import { buildQueryObjectFromQuery, getQueryObjectByIri } from "@/builders/query/objectBuilder";
import QueryRunner from "@/logic/queryRunner";
import QueryService from "@/services/query.service";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";

export default class QueryController {
  public path = "/node_api/query";
  public router = express.Router();
  private runner: QueryRunner;
  private queryService: QueryService;

  constructor() {
    this.initRoutes();
    this.runner = new QueryRunner();
    this.queryService = new QueryService(axios);
  }

  private initRoutes() {
    this.router.get("/node_api/query/public/getSQL", (req, res, next) => this.getSQL(req, res, next));
    this.router.post("/public/queryDisplay", (req, res, next) => this.getQueryDisplay(req, res, next));
    this.router.post("/public/queryObject", (req, res, next) => this.getQueryObject(req, res, next));
    this.router.get("/public/queryDefinitionDisplay", (req, res, next) => this.getQueryDefinitionDisplay(req, res, next));
    this.router.get("/public/queryObjectDisplay", (req, res, next) => this.getQueryObjectByIri(req, res, next));
    this.router.get("/public/allowablePropertySuggestions", (req, res, next) => this.getAllowablePropertySuggestions(req, res, next));
    this.router.get("/public/allowableRangeSuggestions", (req, res, next) => this.getAllowableRangeSuggestions(req, res, next));
  }

  async getSQL(req: Request, res: Response, next: NextFunction) {
    try {
      const sql = await this.runner.generateSQL(req.query.iri as string);
      res.send(sql).end();
    } catch (e) {
      next(e);
    }
  }

  async runQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.runner.runQuery(req.query.iri as string);
      res.send(data);
      res.end();
    } catch (e) {
      next(e);
    }
  }

  async getQueryDisplay(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await buildQueryDisplayFromQuery(req.body);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }

  async getQueryObject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = buildQueryObjectFromQuery(req.body);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }

  async getQueryObjectByIri(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getQueryObjectByIri(req.query.iri as string);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }

  async getQueryDefinitionDisplay(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getQueryDefinitionDisplayByIri(req.query.iri as string);
      res.send(data).end();
    } catch (error) {
      next(error);
    }
  }

  async getAllowablePropertySuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.queryService.getAllowablePropertySuggestions(req.query.iri as string, req.query.searchTerm as string);
      res.send(data).end();
    } catch (error) {
      next(error);
    }
  }

  async getAllowableRangeSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.queryService.getAllowableRangeSuggestions(req.query.iri as string, req.query.searchTerm as string);
      res.send(data).end();
    } catch (error) {
      next(error);
    }
  }
}
