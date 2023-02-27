import ProvRepository from "@/repositories/provRepository";
export default class ProvService {

    private repo: ProvRepository;

    constructor() {
        this.repo = new ProvRepository();
    }
    public async getProvHistory(url:string): Promise<any[]> {
        const provs = [] as any[];
        const result = await this.repo.getProvHistory(url);
        result.forEach((r:any) => {
            provs.push({
                "@id" : r.prov.value,
                "http://endhealth.info/im#effectiveDate": r.effectiveDate.value,
                "http://endhealth.info/im#provenanceActivityType": [{
                    "@id": r.activityType.value,
                    "name": r.activityTypeName ? r.activityTypeName.value : undefined
                }],
                "http://endhealth.info/im#provenanceAgent": [{
                    "@id": r.agent ? r.agent.value : undefined,
                    "name": r.agentName ? r.agentName.value : undefined
                }],
                "http://endhealth.info/im#provenanceTarget" : [{
                    "@id": url
                }],
                "http://endhealth.info/im#usedEntity": [{
                    "@id": r.usedEntity ? r.usedEntity.value : undefined,
                    "name": r.usedEntityName ? r.usedEntityName?.value : undefined
                }]
            })
        })
       return  provs;
    }
}