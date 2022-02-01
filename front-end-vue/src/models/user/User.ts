export class User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  id: string;

  constructor(username: string, firstName: string, lastName: string, email: string, password: string, avatar: string) {
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.avatar = avatar;
    this.id = "";
  }

  setId(id: string): void {
    this.id = id;
  }
}
