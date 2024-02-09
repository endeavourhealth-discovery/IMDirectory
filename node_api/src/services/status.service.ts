import Env from "@/services/env.service";

export default class StatusService {
  axios: any;
  constructor(axios: any) {
    this.axios = axios;
  }

  public async imapiHealthCheck(): Promise<any> {
    const response = await this.axios.get(Env.API + "api/status/public/healthCheck");
    return response.status;
  }

  public async graphdbHealthCheck(): Promise<any> {
    const db = [Env.GRAPH_REPO, Env.GRAPH_REPO_CONFIG, Env.GRAPH_REPO_USER, Env.GRAPH_REPO_WORKFLOW];
    let response;
    for (const dbName of db) {
      response = await this.axios.get(Env.GRAPH_HOST + "/repositories/" + dbName + "/health");
      if (response.status !== 200) return response.status;
    }
    return response.status;
  }
}
