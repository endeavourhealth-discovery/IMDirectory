import UserRepository from "@/repositories/userRepository";
import { User } from "@im-library/interfaces";

export default class UserService {
  private repo: UserRepository;
  constructor() {
    this.repo = new UserRepository();
  }
  public async getUserTheme(user: string): Promise<any[]> {
    return this.repo.getUserTheme(user);
  }
  public updateUserTheme(user: string, theme: string): Promise<void> {
    console.log("c");
    console.log(user);
    console.log(theme);
    return this.repo.updateUserTheme(user, theme);
  }
  public async getUserMRU(user: string): Promise<any[]> {
    return this.repo.getUserMRU(user);
  }
  public updateUserMRU(user: string, mru: any): Promise<void> {
    return this.repo.updateUserMRU(user, mru);
  }
}
