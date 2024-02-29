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
          return await this.queryService.getAllowablePropertySuggestions(
            focus.valueObject.iri,
            term?.valueData,
            request.page?.pageNumber,
            request.page?.pageSize
          );
        }
      } else if (isBoolGroup(focus.valueObject)) {
        return await this.queryService.getAllowablePropertySuggestionsBoolFocus(
          focus.valueObject,
          term?.valueData,
          request.page?.pageNumber,
          request.page?.pageSize
        );
      }
    }
    throw new CustomError("missing required arguments 'focus'/'searchIri'", ErrorType.InvalidInputError);
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

  public async getAllowablePropertyValueSuggestions(request: FunctionRequest): Promise<SearchResponse> {
    const propertyIri = request.arguments?.find(arg => arg.parameter === "propertyIri");
    const term = request.arguments?.find(arg => arg.parameter === "searchIri");
    if (propertyIri?.valueIri && term?.valueData) {
      const ranges = await this.queryService.queryIMSearch({
        query: { "@id": QUERY.ALLOWABLE_RANGES },
        argument: [{ parameter: "this", valueIri: { "@id": propertyIri.valueIri["@id"] } }],
        page: { pageNumber: 1, pageSize: 1000 }
      });
      if (ranges.entities?.length) {
        return this.queryService.queryIMSearch({
          query: { "@id": QUERY.GET_ISAS },
          argument: [
            {
              parameter: "this",
              valueIriList: ranges.entities.map(r => {
                return { "@id": r.iri };
              })
            }
          ],
          textSearch: term.valueData,
          page: request.page ?? undefined
        });
      } else return {} as SearchResponse;
    }
    throw new CustomError("missing required arguments 'propertyIri'/'searchIri'", ErrorType.InvalidInputError);
  }

  public async isAllowablePropertyValueSuggestion(request: FunctionRequest): Promise<boolean> {
    const propertyIri = request.arguments?.find(arg => arg.parameter === "propertyIri");
    const term = request.arguments?.find(arg => arg.parameter === "searchIri");
    if (propertyIri && term) {
      const ranges = await this.queryService.queryIMSearch({
        query: { "@id": QUERY.ALLOWABLE_RANGE_SUGGESTIONS },
        argument: [{ parameter: "this", valueIri: { "@id": "http://snomed.info/sct#410662002" } }],
        textSearch: term?.valueData,
        page: { pageNumber: 1, pageSize: 1000 }
      });
      console.log(ranges);
      if (ranges.entities?.length) {
        return this.queryService.askQueryIM({
          query: { "@id": QUERY.GET_ISAS },
          argument: [
            {
              parameter: "this",
              valueIriList: ranges.entities.map(r => {
                return { "@id": r.iri };
              })
            }
          ]
        });
      } else return false;
    }
    throw new CustomError("missing required arguments 'propertyIri'/'searchIri'", ErrorType.InvalidInputError);
  }
}
