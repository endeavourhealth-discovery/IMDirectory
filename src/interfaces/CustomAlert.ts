import { User } from "./User";

export interface CustomAlert {
  status: number;
  message: string;
  error?: Error | string;
  user?: User;
  nextStep?: string;
}
