import { buildQueryDisplayFromQuery } from "@/builders/query/displayBuilder";
import { buildQueryObjectFromQuery } from "@/builders/query/objectBuilder";
import EntityService from "@/services/entity.service";
import QueryService from "@/services/query.service";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";

export default class QueryController {
  public path = "/node_api/query";
  public router = express.Router();
  private queryService: QueryService;
  private entityService: EntityService;

  constructor() {
    this.initRoutes();
    this.queryService = new QueryService(axios);
    this.entityService = new EntityService(axios);
  }

  private initRoutes() {
    this.router.post("/public/queryDisplay", (req, res, next) => this.getQueryDisplay(req, res, next));
    this.router.post("/public/queryObject", (req, res, next) => this.getQueryObject(req, res, next));
    this.router.get("/public/queryDefinitionDisplay", async (req, res, next) => await this.getQueryDefinitionDisplay(req, res, next));
    this.router.get("/public/queryObjectDisplay", async (req, res, next) => await this.getQueryObjectByIri(req, res, next));
    this.router.get("/public/allowablePropertySuggestions", async (req, res, next) => await this.getAllowablePropertySuggestions(req, res, next));
    this.router.get(
      "/public/allowablePropertySuggestionsBoolFocus",
      async (req, res, next) => await this.getAllowablePropertySuggestionsBoolFocus(req, res, next)
    );
    this.router.get("/public/allowableRangeSuggestions", async (req, res, next) => await this.getAllowableRangeSuggestions(req, res, next));
    this.router.get("/public/allowableChildTypes", async (req, res, next) => await this.getAllowableChildTypes(req, res, next));
    this.router.get("/public/propertyRange", async (req, res, next) => await this.getPropertyRange(req, res, next));
  }
  async getAllowableChildTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const childTypes = await this.queryService.getAllowableChildTypes(req.query.iri as string);
      res.send(childTypes).end();
    } catch (e) {
      next(e);
    }
  }

  async getQueryDisplay(req: Request, res: Response, next: NextFunction) {
    try {
      const data = buildQueryDisplayFromQuery(req.body);
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
      const data = await this.entityService.getQueryObjectByIri(req.query.iri as string);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }

  async getQueryDefinitionDisplay(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.entityService.getQueryDefinitionDisplayByIri(req.query.iri as string);
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

  async getAllowablePropertySuggestionsBoolFocus(req: Request, res: Response, next: NextFunction) {
    try {
      const focus: any = req.body.focus;
      const searchTerm: string = req.body.searchTerm;
      const data = await this.queryService.getAllowablePropertySuggestionsBoolFocus(focus, searchTerm);
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

  async getPropertyRange(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.queryService.getPropertyRange(req.query.propIri as string);
      res.send(data).end();
    } catch (e) {
      next(e);
    }
  }
}
