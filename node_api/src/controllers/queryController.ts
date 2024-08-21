import EntityService from "@/services/entity.service";
import QueryService from "@/services/query.service";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
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

  async getPropertyRange(req: Request) {
    return await this.queryService.getPropertyRange(req.query.propIri as string);
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
