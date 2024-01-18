const Env = {
  API: process.env.VITE_API ?? "http://localhost:8080/",
  GIT_TOKEN: process.env.VITE_GIT_TOKEN ?? null,
  GRAPH_HOST: process.env.VITE_GRAPH_HOST ?? "http://localhost:7200",
  GRAPH_REPO: process.env.VITE_GRAPH_REPO ?? "im",
  GRAPH_REPO_CONFIG: process.env.VITE_GRAPH_REPO_CONFIG ?? "config",
  GRAPH_REPO_USER: process.env.VITE_GRAPH_REPO_USER ?? "user",
  GRAPH_REPO_WORKFLOW: process.env.VITE_GRAPH_REPO_WORKFLOW ?? "workflow",
  GRAPH_TIMEOUT: process.env.VITE_GRAPH_TIMEOUT ?? 30000,
  OPENSEARCH_URL: process.env.VITE_OPENSEARCH_URL ?? "https://search.endeavourhealth.net/concept/_search",
  OPENSEARCH_AUTH: process.env.VITE_OPENSEARCH_AUTH ?? "",
  COGNITO_REGION: process.env.VITE_COGNITO_REGION ?? "eu-west-2",
  COGNITO_USER_POOL: process.env.VITE_COGNITO_USER_POOL ?? "",
  MYSQL_HOST: process.env.VITE_MYSQL_HOST ?? "localhost",
  MYSQL_USER: process.env.VITE_MYSQL_USER ?? "root",
  MYSQL_PASS: process.env.VITE_MYSQL_PASS ?? "password",
  MYSQL_DB: process.env.VITE_MYSQL_DB ?? "subscriber",
  ALLOWED_HOSTS: process.env.VITE_ALLOWED_HOSTS ?? "*",
  NODE_ENV: process.env.NODE_ENV ?? "development"
};

export default Env;
