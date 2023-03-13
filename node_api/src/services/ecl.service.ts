import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import eclToBuild from "@im-library/helpers/Ecl/EclToBuild";
import eclToIMQ from "@im-library/helpers/Ecl/EclToIMQ";
import validateEcl from "@im-library/helpers/Ecl/ValidateEcl";
import { EclSearchRequest } from "@im-library/interfaces";
import Env from "./env.service";

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

  public async eclSearch(eclSearchRequest: EclSearchRequest) {
    if (isObjectHasKeys(eclSearchRequest, ["eclString"]) && eclSearchRequest.eclString) {
      eclSearchRequest.eclQuery = eclToIMQ(eclSearchRequest.eclString);
      delete eclSearchRequest.eclString;
    } else if (isObjectHasKeys(eclSearchRequest, ["eclQuery"]) && eclSearchRequest.eclQuery) {
      eclSearchRequest.eclQuery = eclSearchRequest.eclQuery;
      delete eclSearchRequest.eclString;
    } else throw new Error("eclString or eclQuery required for eclSearch");
    return (await this.axios.post(Env.API + "api/ecl/public/evaluateEclQuery", eclSearchRequest)).data;
  }
}
