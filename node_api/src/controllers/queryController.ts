import EntityService from "@/services/entity.service";
import QueryService from "@/services/query.service";
import { Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import axios from "axios";
import { Request } from "express";
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
    this.router.get("/public/queryDisplay", (req, res, next) =>
      this.getQueryDisplay(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/queryDisplayFromQuery", (req, res, next) =>
      this.getQueryDisplayFromQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/public/allowablePropertySuggestions", (req, res, next) =>
      this.getAllowablePropertySuggestions(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/allowablePropertySuggestionsBoolFocus", (req, res, next) =>
      this.getAllowablePropertySuggestionsBoolFocus(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/allowableRangeSuggestions", (req, res, next) =>
      this.getAllowableRangeSuggestions(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/allowableChildTypes", (req, res, next) =>
      this.getAllowableChildTypes(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/propertyRange", (req, res, next) =>
      this.getPropertyRange(req)
        .then(data => res.send(data))
        .catch(next)
    );
    this.router.get("/public/isFunctionProperty", (req, res, next) =>
      this.isFunctionProperty(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/labeledQuery", (req, res, next) =>
      this.getLabeledQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/public/dataModelProperty", (req, res, next) =>
      this.getDataModelProperty(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.get("/public/generateQuerySQL", (req, res, next) =>
      this.generateQuerySQL(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/generateQuerySQL", (req, res, next) =>
      this.generateQuerySQLfromQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );

    this.router.post("/public/selection/validate", (req, res, next) =>
      this.validateSelectionWithQuery(req)
        .then(data => res.send(data))
        .catch(next)
    );
  }

  async getAllowableChildTypes(req: Request) {
    return await this.queryService.getAllowableChildTypes(req.query.iri as string);
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

  async getQueryDisplay(req: Request) {
    return await this.queryService.getQueryDisplay(req.query.queryIri as string);
  }

  async getQueryDisplayFromQuery(req: Request) {
    return await this.queryService.getQueryDisplayFromQuery(req.body as Query);
  }

  async getLabeledQuery(req: Request) {
    const query: any = req.body;
    return await this.queryService.getLabeledQuery(query);
  }

  async getDataModelProperty(req: Request) {
    return await this.queryService.getDataModelProperty(req.query.dataModelIri as string, req.query.propertyIri as string);
  }

  async generateQuerySQL(req: Request) {
    return await this.queryService.generateQuerySQL(req.query.queryIri as string);
  }

  async generateQuerySQLfromQuery(req: Request) {
    const query: any = req.body;
    return await this.queryService.generateQuerySQLfromQuery(query as Query);
  }

  async validateSelectionWithQuery(req: Request) {
    const queryRequest: QueryRequest = req.body.queryRequest;
    const selectedIri: string = req.body.iri;
    return await this.queryService.validateSelectionWithQuery(selectedIri, queryRequest);
  }
}
