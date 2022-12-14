export default class User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  id: string;
  roles: string[];

  constructor(username: string, firstName: string, lastName: string, email: string, password: string, avatar: string, roles: string[]) {
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.avatar = avatar;
    this.id = "";
    this.roles = roles;
  }

  setId(id: string): void {
    this.id = id;
  }
}
