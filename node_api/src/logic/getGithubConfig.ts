import ConfigRepository from "@/repositories/configRepository";
import { desanitise } from "@/services/graphdb.service";

async function getGithubConfig(name: string) {
  const configRepository = new ConfigRepository();
  const result = await configRepository.getConfig(name);
  return desanitise(result);
}

export default getGithubConfig;
