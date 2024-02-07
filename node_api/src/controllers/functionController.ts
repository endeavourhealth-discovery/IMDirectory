import FunctionService from "@/services/function.service";
import { ErrorType } from "@im-library/enums";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { CustomError } from "@im-library/models";
import axios from "axios";
import { Request } from "express";
import router from "express-promise-router";
import { IM_FUNCTION } from "@im-library/vocabulary";

export default class FunctionController {
  public path = "/node_api/function";
  public router = router();
  private functionService: FunctionService;

  constructor() {
    this.initRoutes();
    this.functionService = new FunctionService(axios);
  }

  private initRoutes() {
    this.router.post("/public/callSearchFunction", (req, res, next) => {
      this.runSearchFunction(req)
        .then(data => res.send(data))
        .catch(next);
    });
    this.router.post("/public/callAskFunction", (req, res, next) => {
      this.runAskFunction(req)
        .then(data => res.send(data))
        .catch(next);
    });
  }

  async runSearchFunction(req: Request) {
    const functionRequest = req.body;
    if (functionRequest && isObjectHasKeys(functionRequest, ["functionIri"])) {
      switch (functionRequest.functionIri) {
        case IM_FUNCTION.ALLOWABLE_PROPERTIES:
          return this.functionService.getAllowablePropertySuggestions(functionRequest);
        case IM_FUNCTION.ALLOWABLE_RANGES:
          return this.functionService.getAllowableRangeSuggestions(functionRequest);
        default:
          throw new CustomError("Invalid funtion iri: " + functionRequest.functionIri, ErrorType.InvalidInputError);
      }
    } else throw new CustomError("functionIri is required.", ErrorType.InvalidInputError);
  }

  async runAskFunction(req: Request) {
    const functionRequest = req.body;
    if (functionRequest && isObjectHasKeys(functionRequest, ["functionIri"])) {
      switch (functionRequest.functionIri) {
        case IM_FUNCTION.ALLOWABLE_PROPERTIES:
          return this.functionService.isAllowablePropertySuggestion(functionRequest);
        case IM_FUNCTION.ALLOWABLE_RANGES:
          return this.functionService.isAllowableRangeSuggestion(functionRequest);
        case IM_FUNCTION.IS_TYPE:
          return this.functionService.isType(functionRequest);
        default:
          throw new CustomError("Invalid funtion iri: " + functionRequest.functionIri, ErrorType.InvalidInputError);
      }
    } else throw new CustomError("functionIri is required.", ErrorType.InvalidInputError);
  }
}
