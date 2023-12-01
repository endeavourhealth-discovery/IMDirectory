import { FunctionRequest } from "@im-library/interfaces/AutoGen";
import QueryService from "./query.service";
import { isAliasIriRef, isBoolGroup } from "@im-library/helpers/TypeGuards";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";
import EntityService from "./entity.service";
import { IM } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary, EntityReferenceNode } from "@im-library/interfaces";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import Env from "./env.service";

export default class FunctionService {
  axios: any;
  queryService: QueryService;
  entityService: EntityService;

  constructor(axios: any) {
    this.axios = axios;
    this.queryService = new QueryService(axios);
    this.entityService = new EntityService(axios);
  }

  public async getAllowablePropertySuggestions(request: FunctionRequest) {
    const focus = request.arguments?.find(arg => arg.parameter === "focus");
    const term = request.arguments?.find(arg => arg.parameter === "searchIri");
    if (focus && focus.valueObject) {
      if (isAliasIriRef(focus.valueObject)) {
        if (focus.valueObject.iri === "any") {
          const results = await this.entityService.getInverseIsas("http://snomed.info/sct#410662002", term?.valueData);
          const resultsAsSummary: ConceptSummary[] = [];
          for (const result of results) {
            const asSummary = await this.entityService.getEntitySummary(result["@id"]);
            entityToAliasEntity(asSummary);
            resultsAsSummary.push(asSummary);
          }
          return resultsAsSummary;
        }
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

  public async isAllowableRangeSuggestion(request: FunctionRequest): Promise<boolean> {
    const property = request.arguments?.find(arg => arg.parameter === "property");
    const term = request.arguments?.find(arg => arg.parameter === "searchIri");
    if (property && property.valueObject && property.valueObject.iri && term && term.valueData) {
      return await this.queryService.isAllowableRangeSuggestion(property.valueObject.iri, term.valueData);
    } else throw new CustomError("Missing required arguments 'focus'/'searchIri'", ErrorType.InvalidInputError);
  }

  public async isType(request: FunctionRequest): Promise<boolean> {
    const type = request.arguments?.find(arg => arg.parameter === "type");
    const iri = request.arguments?.find(arg => arg.parameter === "searchIri");
    if (type && type.valueIri && iri && iri.valueData) {
      const result = await this.axios.post(Env.API + "api/function/public/callAskFunction", request);
      return result.data;
    } else throw new CustomError("Missing required arguments 'type'/'searchIri'", ErrorType.InvalidInputError);
  }
}
