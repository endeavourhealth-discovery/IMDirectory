const Env = {
  API: process.env.VITE_API || "http://localhost:8080/",
  GIT_TOKEN: process.env.GIT_TOKEN || null,
  GRAPH_HOST: process.env.GRAPH_HOST || "http://localhost:7200",
  GRAPH_REPO: process.env.GRAPH_REPO || "im",
  GRAPH_TIMEOUT: process.env.GRAPH_TIMEOUT || 30000,
  OPENSEARCH_URL: process.env.OPENSEARCH_URL || "https://search.endeavourhealth.net/concept/_search",
  OPENSEARCH_AUTH: process.env.OPENSEARCH_AUTH || "",
  COGNITO_REGION: process.env.COGNITO_REGION || "eu-west-2",
  COGNITO_USER_POOL: process.env.COGNITO_USER_POOL || "",
  MYSQL_HOST: process.env.MYSQL_HOST || "localhost",
  MYSQL_USER: process.env.MYSQL_USER || "root",
  MYSQL_PASS: process.env.MYSQL_PASS || "password",
  MYSQL_DB: process.env.MYSQL_DB || "subscriber",
  ALLOWED_HOSTS: process.env.ALLOWED_HOSTS || "*",
  NODE_ENV: process.env.NODE_ENV || "development"
};

Object.freeze(Env);

export default Env;
