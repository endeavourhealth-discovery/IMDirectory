const Env = {
  API: import.meta.env.VITE_API ? (import.meta.env.VITE_API as string) : "/imapi/",
  DIRECTORY_URL: window.location.origin + "/#/",
  QUERY_RUNNER: import.meta.env.VITE_QUERY_RUNNER_URL ? (import.meta.env.VITE_QUERY_RUNNER_URL as string) : "http://localhost:3000",
  CASDOOR_URL: import.meta.env.VITE_CASDOOR_URL ? (import.meta.env.VITE_CASDOOR_URL as string) : "http://localhost:8000",
  CASDOOR_CLIENT_ID: import.meta.env.VITE_CASDOOR_CLIENT_ID ? (import.meta.env.VITE_CASDOOR_CLIENT_ID as string) : "",
  /** Where Casdoor sends the browser after signing in or out. Must be registered as a redirect URL on the Casdoor application. */
  AUTH_REDIRECT_URI: new URL(import.meta.env.BASE_URL, window.location.origin).href
};

Object.freeze(Env);

export default Env;
