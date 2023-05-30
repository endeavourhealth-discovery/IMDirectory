import { desanitise, GraphdbService, iri, sanitise } from "@/services/graphdb.service";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { USER } from "@im-library/vocabulary/USER";

export default class UserRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.userRepo();
  }

  public async getUserTheme(user: string): Promise<string> {
    const qry = "SELECT ?theme WHERE { ?user ?hasTheme ?theme }";
    const bnd = { user: iri(USER.NAMESPACE + user), hasTheme: iri(USER.USER_THEME) };

    const rs = await this.graph.execute(qry, bnd);
    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["theme"])) {
      return rs[0].theme.value;
    } else {
      await this.updateUserTheme(user, "saga-blue");
      return "saga-blue";
    }
  }

  public async getUserMRU(user: string): Promise<any[]> {
    const qry = "SELECT ?mru WHERE { ?user ?hasmru ?mru }";
    const bnd = { user: iri(USER.NAMESPACE + user), hasmru: iri(USER.USER_MRU) };
    const rs = await this.graph.execute(qry, bnd);
    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["mru"])) {
      return desanitise(rs[0].mru.value);
    } else {
      await this.updateUserMRU(user, []);
      return [];
    }
  }

  public async getUserFavourites(user: string): Promise<any[]> {
    const qry = "SELECT ?favourites WHERE { ?user ?hasfav ?favourites }";
    const bnd = { user: iri(USER.NAMESPACE + user), hasfav: iri(USER.USER_FAVOURITES) };
    const rs = await this.graph.execute(qry, bnd);
    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["favourites"])) {
      return desanitise(rs[0].favourites.value);
    } else {
      await this.updateUserFavourites(user, []);
      return [];
    }
  }

  public async updateUserTheme(user: string, theme: string): Promise<void> {
    const deleteQry = "DELETE WHERE { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_THEME) + " ?theme }";
    await this.graph.update(deleteQry);
    const qry = "INSERT DATA { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_THEME) + " " + sanitise(theme) + " }";
    await this.graph.update(qry);
  }

  public async updateUserMRU(user: string, mru: any[]): Promise<void> {
    const deleteQry = "DELETE WHERE { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_MRU) + " ?mru }";
    await this.graph.update(deleteQry);
    const qry = "INSERT DATA { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_MRU) + " " + sanitise(mru) + " }";
    await this.graph.update(qry);
  }
  public async updateUserFavourites(user: string, favourites: any[]): Promise<void> {
    const deleteQry = "DELETE WHERE { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_FAVOURITES) + " ?favourites }";
    await this.graph.update(deleteQry);
    const qry = "INSERT DATA { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_FAVOURITES) + " " + sanitise(favourites) + " }";
    await this.graph.update(qry);
  }
}
