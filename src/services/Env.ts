const Env = {
  API: import.meta.env.VITE_API ? (import.meta.env.VITE_API as string) : "/imapi/",
  DIRECTORY_URL: import.meta.env.VITE_DIRECTORY_URL ? (import.meta.env.VITE_DIRECTORY_URL as string) : "/#/",
  UPRN_API: import.meta.env.VITE_UPRN_API ? (import.meta.env.VITE_UPRN_API as string) : "https://devuprnapi.endhealth.co.uk:8443"
};

Object.freeze(Env);

export default Env;
