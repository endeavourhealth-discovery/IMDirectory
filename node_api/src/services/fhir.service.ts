import FhirRepository from "@/repositories/fhirRepository";
import {fhirR4} from "@smile-cdr/fhirts";

export default class FhirService {
    private repo: FhirRepository;
    constructor() {
        this.repo = new FhirRepository();
    }

    public async getValueSet(url: string, expand: boolean): Promise<any> {
        const valueSet = new fhirR4.ValueSet();
        // valueSet.expansion.contains.contains = await this.getMembers(url, expand);
        // valueSet.compose.include.valueSet = await this.getSubsets(url);

        return valueSet;
    }


}