import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    raw?: boolean;
    silent?: boolean;
  }
}
