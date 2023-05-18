import { GraphdbService, iri, sanitise } from "@/services/graphdb.service";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { CustomError } from "@im-library/models";
import { ErrorType } from "@im-library/enums";
import { USER } from "@im-library/vocabulary/USER";

export default class UserRepository {
  private graph: GraphdbService;

  constructor() {
    this.graph = GraphdbService.userRepo();
  }

  public async getUserTheme(user: string): Promise<any> {
    const qry = "SELECT ?theme WHERE { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_THEME) + " ?theme }";
    const rs = await this.graph.execute(qry);
    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["theme"])) {
      console.log(rs[0].theme.id);
      return rs[0].theme.id;
    } else {
      //throw new CustomError(`User MRU not found: ${user}`, ErrorType.MRUNotFoundError);
    }
  }

  public async getUserMRU(user: string): Promise<any> {
    const qry = "SELECT ?mru WHERE {    ?user ?userMRU ?mru }";
    const rs = await this.graph.execute(qry, {
      user: iri(USER.NAMESPACE + user),
      userMRU: iri(USER.USER_MRU)
    });
    if (isArrayHasLength(rs) && isObjectHasKeys(rs[0], ["mru"])) {
      console.log(rs[0].mru.id);
      return rs[0].mru.id;
    } else {
      console.log("a");
      //throw new CustomError(`User MRU not found: ${user}`, ErrorType.MRUNotFoundError);
    }
  }

  public async updateUserTheme(user: string, theme: string): Promise<void> {
    const deleteQry = "DELETE WHERE { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_THEME) + " ?theme }";
    await this.graph.update(deleteQry);
    const qry = "INSERT DATA { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_THEME) + " " + sanitise(theme) + " }";
    await this.graph.update(qry);
  }

  public async updateUserMRU(user: string, mru: any): Promise<void> {
    const deleteQry = "DELETE WHERE { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_MRU) + " ?mru }";
    await this.graph.update(deleteQry);
    const qry = "INSERT DATA { " + iri(USER.NAMESPACE + user) + " " + iri(USER.USER_MRU) + " " + sanitise(mru) + " }";
    await this.graph.update(qry);
  }
}
