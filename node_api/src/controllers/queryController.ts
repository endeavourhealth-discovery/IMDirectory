import { buildQueryDisplayFromQuery } from "@/builders/query/displayBuilder";
import { buildQueryObjectFromQuery } from "@/builders/query/objectBuilder";
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
    this.router.post("/public/queryDisplay", (req, res, next) =>
      this.getQueryDisplay(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.post("/public/queryObject", (req, res, next) =>
      this.getQueryObject(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/queryDefinitionDisplay", (req, res, next) =>
      this.getQueryDefinitionDisplay(req)
        .then(data => res.send(data).end())
        .catch(next)
    );
    this.router.get("/public/queryObjectDisplay", (req, res, next) =>
      this.getQueryObjectByIri(req)
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

  async getQueryDisplay(req: Request) {
    return buildQueryDisplayFromQuery(req.body);
  }

  async getQueryObject(req: Request) {
    return buildQueryObjectFromQuery(req.body);
  }

  async getQueryObjectByIri(req: Request) {
    return await this.entityService.getQueryObjectByIri(req.query.iri as string);
  }

  async getQueryDefinitionDisplay(req: Request) {
    return await this.entityService.getQueryDefinitionDisplayByIri(req.query.iri as string);
  }

  async getAllowablePropertySuggestions(req: Request) {
    const iri = req.query.iri;
    const searchTerm = req.query.searchTerm;
    if (iri && typeof iri === "string" && iri.startsWith("http"))
      return await this.queryService.getAllowablePropertySuggestions(iri as string, searchTerm as string);
    else return await this.queryService.searchProperties(searchTerm as string);
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
}
