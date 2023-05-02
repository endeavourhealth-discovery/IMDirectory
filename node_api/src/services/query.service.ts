import Env from "@/services/env.service";
import { eclToIMQ } from "@im-library/helpers";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { AliasEntity, EclSearchRequest } from "@im-library/interfaces";
import { QueryRequest, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDFS } from "@im-library/vocabulary";
import EclService from "./ecl.service";
import {GraphdbService, iri} from "@/services/graphdb.service";

export default class QueryService {
  axios: any;
  eclService: EclService;
  private graph: GraphdbService;

  constructor(axios: any) {
    this.axios = axios;
    this.eclService = new EclService(axios);
    this.graph = new GraphdbService();
  }

  public async queryIM(query: QueryRequest, controller?: AbortController) {
    try {
      const response = await this.axios.post(Env.API + "api/query/public/queryIM", query);
      return response.data;
    } catch (error) {
      return {} as any;
    }
  }

  public async getAllowableRangeSuggestions(iri: string, searchTerm?: string): Promise<AliasEntity[]> {
    const allowableRangesQuery = {
      query: {
        "@id": "http://endhealth.info/im#Query_AllowableRanges"
      },
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": iri
          }
        }
      ]
    } as QueryRequest;

    const subtypesQuery = {
      query: {
        "@id": "http://endhealth.info/im#Query_GetIsas"
      },
      argument: [
        {
          parameter: "this",
          valueIriList: [] as TTIriRef[]
        }
      ]
    } as QueryRequest;

    let suggestions = [] as AliasEntity[];
    try {
      const allowableRanges = await this.queryIM(allowableRangesQuery);
      if (allowableRanges.entities) {
        subtypesQuery.argument[0].valueIriList = allowableRanges.entities.map((entity: any) => {
          return { "@id": entity["@id"] };
        });

        if (searchTerm) {
          subtypesQuery.textSearch = searchTerm;
        }
        suggestions = (await this.queryIM(subtypesQuery)).entities;
        this.convertTTEntitiesToAlias(suggestions);
      }
      return suggestions;
    } catch (error) {
      return suggestions;
    }
  }

  public async getAllowablePropertySuggestions(iri: string, searchTerm?: string): Promise<AliasEntity[]> {
    const queryRequest = {
      query: {
        "@id": "http://endhealth.info/im#Query_AllowableProperties"
      },
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": iri
          }
        }
      ]
    } as QueryRequest;

    if (searchTerm) {
      queryRequest.textSearch = searchTerm;
    }

    let suggestions = [] as AliasEntity[];
    try {
      suggestions = (await this.queryIM(queryRequest)).entities;
      this.convertTTEntitiesToAlias(suggestions);
      return suggestions;
    } catch (error) {
      return suggestions;
    }
  }

  public async getAllowablePropertySuggestionsBoolFocus(focus: any, searchTerm?: string): Promise<AliasEntity[]> {
    let query;
    let suggestions = [] as AliasEntity[];
    if (focus.ecl) query = eclToIMQ(focus.ecl);
    if (query) {
      const eclSearchRequest = { eclQuery: query, includeLegacy: false, limit: 1000, statusFilter: [{ "@id": IM.ACTIVE }] } as EclSearchRequest;
      const results = await this.eclService.eclSearch(eclSearchRequest);
      if (isArrayHasLength(results)) {
        for (const result of results) {
          const queryRequest = {
            query: {
              "@id": "http://endhealth.info/im#Query_AllowableProperties"
            },
            argument: [
              {
                parameter: "this",
                valueIri: {
                  "@id": result["@id"]
                }
              }
            ]
          } as QueryRequest;

          if (searchTerm) {
            queryRequest.textSearch = searchTerm;
          }
          try {
            const queryResults = (await this.queryIM(queryRequest)).entities;
            this.convertTTEntitiesToAlias(queryResults);
            suggestions = suggestions.concat(queryRequest);
          } catch (error) {}
        }
      }
    }
    return suggestions;
  }

  convertTTEntitiesToAlias(ttEntities: any[]) {
    ttEntities.forEach(ttEntity => entityToAliasEntity(ttEntity));
  }

  public async getAllowableChildTypes(iri: string) {
    const queryRequest = {
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": iri
          }
        }
      ],
      query: {
        "@id": "http://endhealth.info/im#AllowableChildTypes"
      }
    } as any as QueryRequest;

    const response = await this.queryIM(queryRequest);

    if (!isObjectHasKeys(response)) return [];
    return response.entities;
  }

  async getPropertyRange(propIri: string): Promise<any> {
    const isTrue = '"true"^^http://www.w3.org/2001/XMLSchema#boolean';
    const queryRequest = {
      argument: [
        {
          parameter: "this",
          valueIri: {
            "@id": propIri
          }
        }
      ],
      query: {
        "@id": "http://endhealth.info/im#Query_AllowableRanges"
      }
    } as any as QueryRequest;

    const response = await this.queryIM(queryRequest);

    if (isObjectHasKeys(response, ["entities"]) && response.entities.length !== 0) {
      return response.entities;
    } else {
      const propType = await this.checkPropertyType(propIri);
      if( propType.objectProperty.id === isTrue ) {
        queryRequest.query = { "@id": "http://endhealth.info/im#Query_ObjectPropertyRangeSuggestions" } as any;
        const suggestions = await this.queryIM(queryRequest);
        suggestions.entities.push({
          "@id": "http://endhealth.info/im#Concept",
          "http://www.w3.org/2000/01/rdf-schema#label": "Terminology concept"
        });
        return suggestions.entities;
      } else if( propType.dataProperty.id === isTrue ) {
        queryRequest.query = { "@id": "http://endhealth.info/im#Query_dataPropertyRangeSuggestions" }  as any;
        const dataTypes = await this.queryIM(queryRequest);
        if (isObjectHasKeys(dataTypes, ["entities"]) && dataTypes.entities.length !== 0) {
          return dataTypes.entities;
        }
      } else return [];
    }
  }

  public async checkPropertyType(propIri:string) {
    const query = "SELECT ?objectProperty ?dataProperty " +
                  "WHERE {" +
                  "bind(exists{?propIri ?isA  ?objProp} as ?objectProperty)" +
                  "bind(exists{?propIri ?isA ?dataProp} as ?dataProperty)" +
                  "} "

    const rs = await this.graph.execute(query, {
      propIri:iri(propIri),
      isA:iri(IM.IS_A),
      objProp:iri(IM.DATAMODEL_OBJECTPROPERTY),
      dataProp:iri(IM.DATAMODEL_DATAPROPERTY)
    }, false);

    if(isArrayHasLength(rs)) {
      return rs[0];
    }
  }

  public async isFunctionProperty(propIri:string) {
    const isTrue = '"true"^^http://www.w3.org/2001/XMLSchema#boolean';
    const query = "SELECT ?functionProperty " +
        "WHERE {" +
        "bind(exists{?propIri ?isA  ?funcProp} as ?functionProperty)" +
        "} "

    const rs = await this.graph.execute(query, {
      propIri:iri(propIri),
      isA:iri(IM.IS_A),
      funcProp:iri(IM.DATAMODEL_FUNCTIONPROPERTY)
    }, false);

    if(isArrayHasLength(rs)) {
      return rs[0].functionProperty.value;
    }
  }
}
