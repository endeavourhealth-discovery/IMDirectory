import QueryService from "@/services/query.service";
import { Query, QueryRequest } from "@im-library/interfaces/AutoGen";
import axios from "axios";
import { Request } from "express";
import router from "express-promise-router";

export default class QueryController {
  public path = "/node_api/query";
  public router = router();
  private queryService: QueryService;

  constructor() {
    this.initRoutes();
    this.queryService = new QueryService(axios);
  }

  private initRoutes() {
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
  }

  async generateQuerySQL(req: Request) {
    return await this.queryService.generateQuerySQL(req.query.queryIri as string);
  }

  async generateQuerySQLfromQuery(req: Request) {
    const query: any = req.body;
    return await this.queryService.generateQuerySQLfromQuery(query as Query);
  }
}
