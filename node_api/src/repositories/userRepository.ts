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
    const rs = await this.graph.execute(qry, {
      user: iri(USER.NAMESPACE + user),
      hasTheme: iri(USER.USER_THEME)
    });
    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["theme"])) {
      return rs[0].theme.value;
    } else {
      await this.updateUserTheme(user, "a");
      const rs = await this.graph.execute(qry);
      return rs[0].theme.value;
    }
  }

  public async getUserMRU(user: string): Promise<any[]> {
    const qry = "SELECT ?mru WHERE { ?user ?hasMRU ?mru }";
    const rs = await this.graph.execute(qry, {
      user: iri(USER.NAMESPACE + user),
      hasMRU: iri(USER.USER_MRU)
    });
    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["mru"])) {
      return JSON.parse(rs[0].mru.value);
    } else {
      await this.updateUserMRU(user, []);
      const rs = await this.graph.execute(qry);
      return JSON.parse(rs[0].mru.value);
    }
  }

  public async getUserFavourites(user: string): Promise<any[]> {
    const qry = "SELECT ?favourites WHERE { ?user ?hasFavourites ?favourites }";
    const rs = await this.graph.execute(qry, {
      user: iri(USER.NAMESPACE + user),
      hasFavourites: iri(USER.USER_FAVOURITES)
    });
    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["favourites"])) {
      console.log(rs[0].favourites.value);
      return JSON.parse(rs[0].favourites.value);
    } else {
      await this.updateUserFavourites(user, []);
      const rs = await this.graph.execute(qry);
      return JSON.parse(rs[0].favourites.value);
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
