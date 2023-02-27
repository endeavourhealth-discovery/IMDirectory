import ConfigRepository from "@/repositories/configRepository";

export default class ConfigService {
    private repo: ConfigRepository;
    constructor() {
        this.repo = new ConfigRepository();
    }
    public async getConfig(iri: string): Promise<any[]> {
        return this.repo.getConfig(iri);
    }

}