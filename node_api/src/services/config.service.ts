import ConfigRepository from "@/repositories/configRepository";

export default class ConfigService {
  private repo: ConfigRepository;
  constructor() {
    this.repo = new ConfigRepository();
  }
  public async getConfig(iri: string): Promise<any> {
    return this.repo.getConfig(iri);
  }
  public async setConfig(subjectUrl: string, name: string, description: string, data: any): Promise<void> {
    this.repo.setConfig(subjectUrl, name, description, data);
  }
}
