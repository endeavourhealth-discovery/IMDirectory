import { FunctionRequest, SearchResponse, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import QueryService from "./query.service";
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";
import EntityService from "./entity.service";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import Env from "./env.service";
import { QUERY } from "@im-library/vocabulary";

export default class FunctionService {
  axios: any;
  queryService: QueryService;
  entityService: EntityService;

  constructor(axios: any) {
    this.axios = axios;
    this.queryService = new QueryService(axios);
    this.entityService = new EntityService(axios);
  }

  public async getAllowablePropertySuggestions(request: FunctionRequest): Promise<SearchResponse> {
    const focus = request.arguments?.find(arg => arg.parameter === "focus");
    const term = request.arguments?.find(arg => arg.parameter === "searchIri");
    if (focus && focus.valueObject) {
      if (isAliasIriRef(focus.valueObject)) {
        if (focus.valueObject.iri === "any") {
          return await this.queryService.queryIMSearch({
            query: { "@id": QUERY.GET_ANCESTORS },
            argument: [{ parameter: "this", valueData: "http://snomed.info/sct#410662002" }],
            textSearch: term?.valueData
          });
        } else {
          return await this.queryService.getAllowablePropertySuggestions(focus.valueObject.iri, term?.valueData);
        }
      } else if (isBoolGroup(focus.valueObject)) {
        return await this.queryService.getAllowablePropertySuggestionsBoolFocus(focus.valueObject, term?.valueData);
      }
    }
    throw new CustomError("missing required arguments 'focus'/'term'", ErrorType.InvalidInputError);
  }

  public async isAllowablePropertySuggestion(request: FunctionRequest): Promise<boolean> {
    const focus = request.arguments?.find(arg => arg.parameter === "focus");
    const term = request.arguments?.find(arg => arg.parameter === "searchIri");
    if (focus && focus.valueObject && term && term.valueData) {
      if (isAliasIriRef(focus.valueObject)) {
        if (focus.valueObject.iri === "any") {
          return await this.entityService.isInverseIsa("http://snomed.info/sct#410662002", term?.valueData);
        }
        return await this.queryService.isAllowablePropertySuggestion(focus.valueObject.iri, term.valueData);
      } else if (isBoolGroup(focus.valueObject)) {
        return await this.queryService.isAllowablePropertySuggestionBoolFocus(focus.valueObject, term.valueData);
      } else throw new CustomError("focus argument is of incorrect type", ErrorType.InvalidInputError);
    } else throw new CustomError("missing required arguments 'focus'/'searchIri'", ErrorType.InvalidInputError);
  }
}
