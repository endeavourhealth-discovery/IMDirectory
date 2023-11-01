import { FunctionRequest } from "@im-library/interfaces/AutoGen";
import QueryService from "./query.service";
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";

export default class FunctionService {
  axios: any;
  queryService: QueryService;

  constructor(axios: any) {
    this.axios = axios;
    this.queryService = new QueryService(axios);
  }

  public async getAllowablePropertySuggestions(request: FunctionRequest) {
    const focus = request.arguments?.find(arg => arg.parameter === "focus");
    const term = request.arguments?.find(arg => arg.parameter === "term");
    if (focus && focus.valueObject) {
      if (isAliasIriRef(focus.valueObject)) {
        return await this.queryService.getAllowablePropertySuggestions(focus.valueObject.iri, term?.valueData);
      } else if (isBoolGroup(focus.valueObject)) {
        return await this.queryService.getAllowablePropertySuggestionsBoolFocus(focus.valueObject, term?.valueData);
      }
    } else throw new CustomError("missing required arguments 'focus'/'term'", ErrorType.InvalidInputError);
  }

  public async getAllowableRangeSuggestions(request: FunctionRequest) {
    const property = request.arguments?.find(arg => arg.parameter === "property");
    const term = request.arguments?.find(arg => arg.parameter === "term");
    if (property && property.valueObject && property.valueObject.iri) {
      return await this.queryService.getAllowableRangeSuggestions(property.valueObject.iri, term?.valueData);
    } else throw new CustomError("Missing required arguments 'focus'/'term'", ErrorType.InvalidInputError);
  }
}
