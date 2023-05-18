import { GraphdbService, iri, sanitise } from "@/services/graphdb.service";
import { User } from "@im-library/interfaces";
import { USER } from "@im-library/vocabulary/USER";
export default class UserRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.userRepo();
  }

  public async getUserTheme(user: string): Promise<any> {
    const qry = "SELECT ?theme WHERE { GRAPH ?graph {    ?user ?userTheme ?theme }";
    const rs = await this.graph.execute(qry, {
      graph: iri(USER.NAMESPACE),
      user: USER.DOMAIN + USER.NAMESPACE + iri(user),
      userTheme: iri(USER.USER_THEME)
    });
  }

  public async updateUserTheme(user: string, theme: string): Promise<void> {
    console.log("d");
    const deleteQry = "DELETE WHERE { " + USER.NAMESPACE + iri(user) + " " + iri(USER.USER_THEME) + " ?theme }";
    console.log(deleteQry);
    await this.graph.execute(deleteQry);
    const qry = "INSERT DATA { " + USER.NAMESPACE + iri(user) + " " + iri(USER.USER_THEME) + " " + sanitise(theme) + " }";
    console.log(qry);
    await this.graph.execute(qry);
  }

  public async getUserMRU(user: string): Promise<any> {
    const qry = "SELECT ?mru WHERE { GRAPH ?graph {    ?user ?userMRU ?mru }";
    const rs = await this.graph.execute(qry, {
      graph: iri(USER.NAMESPACE),
      user: USER.DOMAIN + USER.NAMESPACE + iri(user),
      userMRU: iri(USER.USER_MRU)
    });
  }

  public async updateUserMRU(user: string, mru: any): Promise<void> {
    const deleteQry = "DELETE WHERE { + GRAPH " + iri(USER.NAMESPACE) + " { " + USER.DOMAIN + USER.NAMESPACE + iri(user) + " " + iri(USER.USER_MRU) + " ?mru }";
    await this.graph.execute(deleteQry);
    const qry =
      "INSERT DATA { " +
      "GRAPH " +
      iri(USER.NAMESPACE) +
      " { " +
      USER.DOMAIN +
      USER.NAMESPACE +
      iri(user) +
      " " +
      iri(USER.USER_MRU) +
      " " +
      sanitise(mru) +
      " }";
    await this.graph.execute(qry);
  }
}
