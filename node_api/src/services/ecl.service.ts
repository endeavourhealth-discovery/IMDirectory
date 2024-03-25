import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { eclToIMQ, eclToBuild, validateEcl } from "@im-library/helpers";
import { EclSearchRequest } from "@im-library/interfaces";
import Env from "./env.service";
import { SearchResponse } from "@im-library/interfaces/AutoGen";

export default class EclService {
  axios: any;

  constructor(axios: any) {
    this.axios = axios;
  }

  public eclToBuild(ecl: string) {
    return eclToBuild(ecl);
  }

  public eclToIMQ(ecl: string) {
    return eclToIMQ(ecl);
  }

  public validateEcl(ecl: string) {
    return validateEcl(ecl);
  }

  public async evaluateEcl(ecl: string) {
    const esr = {
      eclString: ecl
    } as EclSearchRequest;

    return await this.eclSearch(esr);
  }

  public async eclSearch(eclSearchRequest: EclSearchRequest): Promise<SearchResponse> {
    if (isObjectHasKeys(eclSearchRequest, ["eclString"]) && eclSearchRequest.eclString) {
      eclSearchRequest.eclQuery = eclToIMQ(eclSearchRequest.eclString);
      delete eclSearchRequest.eclString;
    } else if (isObjectHasKeys(eclSearchRequest, ["eclQuery"]) && eclSearchRequest.eclQuery) {
      delete eclSearchRequest.eclString;
    } else throw new Error("eclString or eclQuery required for eclSearch");
    return (await this.axios.post(Env.API + "api/ecl/public/eclSearch", eclSearchRequest)).data;
  }
}
