const Env = {
  API: import.meta.env.VITE_API ? (import.meta.env.VITE_API as string) : "/imapi/",
  DIRECTORY_URL: window.location.origin + "/#/",
  UPRN_API: import.meta.env.VITE_UPRN_API ? (import.meta.env.VITE_UPRN_API as string) : "https://devuprnapi.endhealth.co.uk:8443",
  QUERY_RUNNER: import.meta.env.VITE_QUERY_RUNNER_URL ? (import.meta.env.VITE_QUERY_RUNNER_URL as string) : "http://localhost:3000",
  CASDOOR_URL: import.meta.env.VITE_CASDOOR_URL ? (import.meta.env.VITE_CASDOOR_URL as string) : "http://localhost:8000"
};

Object.freeze(Env);

export default Env;
