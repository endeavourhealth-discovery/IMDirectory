import Env from "@/services/env.service";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { entityToAliasEntity } from "@im-library/helpers/Transforms";
import { EclSearchRequest, Query, QueryRequest, SearchResponse } from "@im-library/interfaces/AutoGen";
import { IM, QUERY } from "@im-library/vocabulary";
import EntityService from "./entity.service";

import IMQtoSQL from "@/logic/IMQtoSQL";

export default class QueryService {
  axios: any;
  entityService: EntityService;

  constructor(axios: any) {
    this.axios = axios;
    this.entityService = new EntityService(axios);
  }

  public async queryIM(query: QueryRequest, controller?: AbortController): Promise<any> {
    const response = await this.axios.post(Env.API + "api/query/public/queryIM", query);
    return response.data;
  }

  public async generateQuerySQL(queryIri: string) {
    const entityResponse = await this.entityService.getPartialEntity(queryIri, [IM.DEFINITION]);
    if (!isObjectHasKeys(entityResponse, ["data"]) || !isObjectHasKeys(entityResponse.data, [IM.DEFINITION])) {
      return {};
    }
    const query = JSON.parse(entityResponse.data[IM.DEFINITION]);
    return IMQtoSQL(query);
  }

  public async generateQuerySQLfromQuery(query: Query) {
    return IMQtoSQL(query);
  }
}
