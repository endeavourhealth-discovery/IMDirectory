// TODO: Need graphdb typings
// @ts-ignore
import Graphdb from "graphdb";
import Env from "@/services/env.service";
import logger from "@/middlewares/logger.middleware";

const { ServerClientConfig, ServerClient, RDFRepositoryClient } = Graphdb.server;
const { RDFMimeType } = Graphdb.http;
const { RepositoryClientConfig } = Graphdb.repository;
const { GetQueryPayload, QueryType, UpdateQueryPayload } = Graphdb.query;
const { QueryContentType } = Graphdb.http;
const { SparqlJsonResultParser } = Graphdb.parser;

export class GraphdbService {
  public static imRepo() {
    return new GraphdbService(Env.GRAPH_REPO);
  }

  public static configRepo() {
    return new GraphdbService(Env.GRAPH_REPO_CONFIG);
  }

  public static userRepo() {
    return new GraphdbService(Env.GRAPH_REPO_USER);
  }

  public static workflowRepo() {
    return new GraphdbService(Env.GRAPH_REPO_WORKFLOW);
  }

  private constructor(repoName: string) {
    this.repoName = repoName;
  }

  private serverConfig: typeof ServerClientConfig;
  private server: typeof ServerClient;
  private repoConfig: typeof RepositoryClientConfig;
  private repoName: string;
  private repo: typeof RDFRepositoryClient;

  public async update(sparql: string): Promise<boolean> {
    const client = await this.getRepo();
    const stmt = new UpdateQueryPayload().setQuery(sparql).setContentType(QueryContentType.X_WWW_FORM_URLENCODED).setInference(true).setTimeout(5);
    return client.update(stmt).then(() => {
      return true;
    });
  }

  public async execute(sparql: string, bindings?: any): Promise<any[]> {
    const client = await this.getRepo();
    const stmt = new GetQueryPayload().setQuery(sparql).setQueryType(QueryType.SELECT).setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);

    if (bindings) {
      for (const key of Object.keys(bindings)) {
        stmt.addBinding("$" + key, bindings[key]);
      }
    }
    let rs: any;

    rs = await client.query(stmt);

    const result: any[] = [];
    rs.on("data", (binding: any) => {
      result.push(binding);
    });
    await new Promise(done => rs.on("end", done));

    return result;
  }

  public async delete(subject?: string, predicate?: string, object?: string, contexts?: any) {
    const client = await this.getRepo();
    await client.deleteStatements(subject, predicate, object, contexts).then(() => {
      return true;
    });
  }

  private async getRepo() {
    if (this.repo == null) {
      this.repo = await this.connect();
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
      .setEndpoints([Env.GRAPH_HOST + "/repositories/" + this.repoName])
      .setReadTimeout(timeout)
      .setWriteTimeout(timeout);
    const repo = await this.server.getRepository(this.repoName, this.repoConfig);
    repo.registerParser(new SparqlJsonResultParser());
    return repo;
  }
}

function iri(url: string) {
  return "<" + url + ">";
}

export function sanitise(data: any) {
  if (typeof data === "string") {
    if (data.startsWith("http") || data.startsWith("https")) return iri(data);
    else return JSON.stringify(data);
  }
  if (typeof data === "object") return "'" + JSON.stringify(data).replaceAll('"', "`").replaceAll("'", '"') + "'";
  if (typeof data === "number") return "'" + data + "'";
}

export function desanitise(data: string) {
  return JSON.parse(data.replaceAll('"', "'").replaceAll("`", '"'));
}
