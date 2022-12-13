import User from "./User.js";

export default class CustomAlert {
  status: number;
  message: string;
  error?: Error | string;
  user?: User;

  constructor(status: number, message: string, error?: Error | string, user?: User) {
    this.status = status;
    this.message = message;
    this.error = error;
    this.user = user;
  }
}
