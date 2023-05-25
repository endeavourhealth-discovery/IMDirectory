import UserRepository from "@/repositories/userRepository";

export default class UserService {
  private repo: UserRepository;

  constructor() {
    this.repo = new UserRepository();
  }

  public async getUserTheme(user: string): Promise<any[]> {
    return this.repo.getUserTheme(user);
  }

  public async getUserMRU(user: string): Promise<any[]> {
    return this.repo.getUserMRU(user);
  }

  public async getUserFavourites(user: string): Promise<any[]> {
    return this.repo.getUserFavourites(user);
  }

  public updateUserTheme(user: string, theme: string): Promise<void> {
    return this.repo.updateUserTheme(user, theme);
  }

  public updateUserMRU(user: string, mru: any): Promise<void> {
    return this.repo.updateUserMRU(user, mru);
  }

  public updateUserFavourites(user: string, favourites: any): Promise<void> {
    return this.repo.updateUserFavourites(user, favourites);
  }
}
