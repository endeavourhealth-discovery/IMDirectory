import FunctionService from "@/services/function.service";
import QueryService from "@/services/query.service";
import { ErrorType } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { CustomError } from "@im-library/models";
import { IM } from "@im-library/vocabulary";
import axios from "axios";
import { Request } from "express";
import router from "express-promise-router";

export default class FunctionController {
  public path = "/node_api/function";
  public router = router();
  private functionService: FunctionService;
  private queryService: QueryService;

  constructor() {
    this.initRoutes();
    this.functionService = new FunctionService(axios);
    this.queryService = new QueryService(axios);
  }

  private initRoutes() {
    this.router.post("/public/callSearchFunction", (req, res, next) => {
      this.runSearchFunction(req)
        .then(data => res.send(data))
        .catch(next);
    });
  }

  async runSearchFunction(req: Request) {
    const functionRequest = req.body;
    if (functionRequest && isObjectHasKeys(functionRequest, ["functionIri"])) {
      if (functionRequest.functionIri === IM.function.ALLOWABLE_PROPERTIES) return this.functionService.getAllowablePropertySuggestions(functionRequest);
      else if (functionRequest.functionIri === IM.function.ALLOWABLE_RANGES) return this.functionService.getAllowableRangeSuggestions(functionRequest);
      else throw new CustomError("Invalid funtion iri: " + functionRequest.functionIri, ErrorType.InvalidInputError);
    } else throw new CustomError("functionIri is required.", ErrorType.InvalidInputError);
  }
}
