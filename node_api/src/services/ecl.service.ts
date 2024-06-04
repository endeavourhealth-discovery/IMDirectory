import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { EclSearchRequest } from "@im-library/interfaces";
import Env from "./env.service";
import { SearchResponse } from "@im-library/interfaces/AutoGen";

export default class EclService {
  axios: any;

  constructor(axios: any) {
    this.axios = axios;
  }

  public async evaluateEcl(ecl: string) {
    const esr = {
      eclString: ecl
    } as EclSearchRequest;

    return await this.eclSearch(esr);
  }

  public async eclSearch(eclSearchRequest: EclSearchRequest): Promise<SearchResponse> {
    if (isObjectHasKeys(eclSearchRequest, ["eclString"]) && eclSearchRequest.eclString) {
      eclSearchRequest.eclQuery = (await this.axios.post(Env.API + "api/ecl/public/queryFromEcl", eclSearchRequest.eclString)).data;
      delete eclSearchRequest.eclString;
    } else if (isObjectHasKeys(eclSearchRequest, ["eclQuery"]) && eclSearchRequest.eclQuery) {
      delete eclSearchRequest.eclString;
    } else throw new Error("eclString or eclQuery required for eclSearch");
    return (await this.axios.post(Env.API + "api/ecl/public/eclSearch", eclSearchRequest)).data;
  }
}
