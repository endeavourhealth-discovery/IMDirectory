import { User } from "@endeavour/vue-library/models";

export interface CustomAlert {
  status: number;
  message: string;
  error?: Error | string;
  user?: User;
  nextStep?: string;
}
