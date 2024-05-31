// TODO: Need graphdb typings
// @ts-ignore
import Graphdb from "graphdb";
import Env from "@/services/env.service";
import _ from "lodash";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";

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
    let rs: any = await client.query(stmt);

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
    else return "'" + sanitiseString(data) + "'";
  } else if (_.isArray(data)) {
    sanitiseArray(data);
    return "'" + JSON.stringify(data) + "'";
  }
  if (_.isObject(data)) {
    sanitiseObject(data);
    return "'" + JSON.stringify(data) + "'";
  }
  if (typeof data === "number") return "'" + data + "'";
}

export function desanitise(data: string) {
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch (error) {
    throw new CustomError("Invalid JSON. Failed to desanitise due to parsing error", ErrorType.InvalidJsonError);
  }
  if (_.isArray(parsed)) desanitiseArray(parsed);
  else if (_.isObject(parsed)) desanitiseObject(parsed);
  return parsed;
}

function sanitiseObject(data: any): void {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") data[key] = sanitiseString(value);
    else if (_.isArray(value)) {
      sanitiseArray(value);
    } else if (_.isObject(value)) sanitiseObject(value);
  }
}

function sanitiseString(data: string): string {
  return data.replaceAll("'", "%27").replaceAll('"', "%22").replaceAll("`", "%60");
}

function sanitiseArray(data: any[]): void {
  for (const [i, value] of data.entries()) {
    if (typeof value === "string") data[i] = sanitiseString(value);
    else if (_.isArray(value)) sanitiseArray(value);
    else if (_.isObject(value)) sanitiseObject(value);
  }
}

function desanitiseObject(data: any) {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") data[key] = desanitiseString(value);
    else if (_.isArray(value)) desanitiseArray(value);
    else if (_.isObject(value)) desanitiseObject(value);
  }
}

function desanitiseArray(data: any[]) {
  for (const [i, value] of data.entries()) {
    if (typeof value === "string") data[i] = desanitiseString(value);
    else if (_.isArray(value)) desanitiseArray(value);
    else if (_.isObject(value)) desanitiseObject(value);
  }
}

function desanitiseString(data: string) {
  return data.replaceAll("%27", "'").replaceAll("%22", '"').replaceAll("%60", "`");
}
