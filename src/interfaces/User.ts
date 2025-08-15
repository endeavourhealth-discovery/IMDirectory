import { UserRole } from "./AutoGen";

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar: string;
  roles: UserRole[];
  mfaStatus: string[];
}
