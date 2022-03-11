export default class Env {
  static api = import.meta.env.VITE_API || "http://localhost:8080/";
}
