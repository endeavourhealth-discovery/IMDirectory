import EntityService from "@/services/entity.service";
import QueryService from "@/services/query.service";
import axios from "axios";
import express, { NextFunction, Request, Response } from "express";
import router from "express-promise-router";

export default class QueryController {
  public path = "/node_api/query";
  public router = router();
  private queryService: QueryService;
  private entityService: EntityService;

  constructor() {
    this.initRoutes();
    this.queryService = new QueryService(axios);
    this.entityService = new EntityService(axios);
  }

  private initRoutes() {
    this.router.get("/public/queryDefinitionDisplay", (req, res, next) =>
      this.getQueryDefinitionDisplay(req)
        .then(data => res.send(data).end())
        .catch(next)
    );

    this.router.get("/public/queryDisplay", (req, res, next) =>
      this.getQueryDisplay(req)
        .then(data => res.send(data).end())
        .catch(next)
    );

    this.router.get("/public/allowablePropertySuggestions", (req, res, next) =>
      this.getAllowablePropertySuggestions(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/allowablePropertySuggestionsBoolFocus", (req, res, next) =>
      this.getAllowablePropertySuggestionsBoolFocus(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/allowableRangeSuggestions", (req, res, next) =>
      this.getAllowableRangeSuggestions(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/allowableChildTypes", (req, res, next) =>
      this.getAllowableChildTypes(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/propertyRange", (req, res, next) =>
      this.getPropertyRange(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/isFunctionProperty", (req, res, next) =>
      this.isFunctionProperty(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
  }

  async getAllowableChildTypes(req: Request) {
    return await this.queryService.getAllowableChildTypes(req.query.iri as string);
  }

  async getQueryDefinitionDisplay(req: Request) {
    return await this.entityService.getQueryDefinitionDisplayByIri(req.query.iri as string);
  }

  async getAllowablePropertySuggestions(req: Request) {
    return await this.queryService.getAllowablePropertySuggestions(req.query.iri as string, req.query.searchTerm as string);
  }

  async getAllowablePropertySuggestionsBoolFocus(req: Request) {
    const focus: any = req.body.focus;
    const searchTerm: string = req.body.searchTerm;
    return await this.queryService.getAllowablePropertySuggestionsBoolFocus(focus, searchTerm);
  }

  async getAllowableRangeSuggestions(req: Request) {
    return await this.queryService.getAllowableRangeSuggestions(req.query.iri as string, req.query.searchTerm as string);
  }

  async getPropertyRange(req: Request) {
    return await this.queryService.getPropertyRange(req.query.propIri as string);
  }

  async isFunctionProperty(req: Request) {
    return await this.queryService.isFunctionProperty(req.query.propIri as string);
  }

  async getQueryDisplay(req: Request) {
    return await this.queryService.getQueryDisplay(req.query.queryIri as string);
  }
}
