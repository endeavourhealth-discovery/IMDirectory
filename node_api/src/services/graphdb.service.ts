// TODO: Need graphdb typings
// @ts-ignore
import Graphdb from "graphdb";
import Env from "@/services/env.service";

const { ServerClientConfig, ServerClient, RDFRepositoryClient } = Graphdb.server;
const { RDFMimeType } = Graphdb.http;
const { RepositoryClientConfig } = Graphdb.repository;
const { GetQueryPayload, QueryType, UpdateQueryPayload } = Graphdb.query;
const { QueryContentType } = Graphdb.http;
const { SparqlJsonResultParser } = Graphdb.parser;

export class GraphdbService {
  private serverConfig: typeof ServerClientConfig;
  private server: typeof ServerClient;
  private repoConfig: typeof RepositoryClientConfig;
  private repo: typeof RDFRepositoryClient;

  public async update(sparql: string): Promise<boolean> {
    try {
      const client = await this.getRepo();

      client.registerParser(new SparqlJsonResultParser());

      const stmt = new UpdateQueryPayload().setQuery(sparql).setContentType(QueryContentType.X_WWW_FORM_URLENCODED).setInference(true).setTimeout(5);

      return client.update(stmt).then(() => {
        return true;
      });
    } catch (e) {
      console.error("********* ERROR!!");
      console.error(e);
      return false;
    }
  }

  public async execute(sparql: string, bindings?: any): Promise<any[]> {
    try {
      const client = await this.getRepo();

      const stmt = new GetQueryPayload().setQuery(sparql).setQueryType(QueryType.SELECT).setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);

      if (bindings) {
        for (const key of Object.keys(bindings)) {
          stmt.addBinding("$" + key, bindings[key]);
        }
      }

      const rs = await client.query(stmt);

      const result: any[] = [];
      rs.on("data", (binding: any) => {
        result.push(binding);
      });
      await new Promise(done => rs.on("end", done));

      return result;
    } catch (e) {
      console.error("********* ERROR!!");
      console.error(e);
      return [];
    }
  }

  private async getRepo() {
    if (this.repo == null) {
      await this.connect();
      this.repo.registerParser(new SparqlJsonResultParser());
    }

    return this.repo;
  }

  private async connect() {
    const timeout = Env.GRAPH_TIMEOUT || 30000;
    this.serverConfig = new ServerClientConfig(Env.GRAPH_HOST)
      .setTimeout(timeout)
      .setHeaders({
        Accept: RDFMimeType.SPARQL_RESULTS_JSON
      })
      .setKeepAlive(true);

    this.server = new ServerClient(this.serverConfig);

    this.repoConfig = new RepositoryClientConfig(Env.GRAPH_HOST)
      .setEndpoints([Env.GRAPH_HOST + "/repositories/" + Env.GRAPH_REPO])
      .setReadTimeout(timeout)
      .setWriteTimeout(timeout);

    this.repo = await this.server.getRepository(Env.GRAPH_REPO, this.repoConfig);
  }
}

export function iri(url: string) {
  return "<" + url + ">";
}
