import Env from "./env.service";

export default class EclService {
  axios: any;

  constructor(axios: any) {
    this.axios = axios;
  }

  public async parseEcl(ecl: string): Promise<any> {
    try {
      return await this.axios.post(Env.API + "api/ecl/public/parseEcl", ecl, { headers: { "Content-Type": "text/plain" } });
    } catch (error) {
      console.error(error);
      return {};
    }
  }
}
