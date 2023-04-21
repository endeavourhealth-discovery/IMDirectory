import ConfigRepository from "@/repositories/configRepository";

async function getGithubConfig(name: string) {
  const configRepository = new ConfigRepository();
  const result = await configRepository.getConfig(name);
  return JSON.parse(desanitise(result));
}

function desanitise(data: string) {
  return data.replaceAll('"', "'").replaceAll("`", '"');
}

export default getGithubConfig;
