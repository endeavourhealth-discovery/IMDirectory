import FhirRepository from "@/repositories/fhirRepository";
import {fhirR4} from "@smile-cdr/fhirts";
import QueryService from "@/services/query.service";
import axios from "axios";
import {ValueSetContains} from "@smile-cdr/fhirts/dist/FHIR-R4/classes/valueSetContains";

export default class FhirService {
    private repo: FhirRepository;
    private queryService: QueryService;
    constructor() {
        this.repo = new FhirRepository();
        this.queryService = new QueryService(axios);
    }

    public async getValueSet(url: string, expand: boolean): Promise<any> {
        const result = new fhirR4.ValueSet();
        const members = await this.repo.getMembers(url);
        const subsets =  await this.repo.getSubsets(url);
        const def = await this.repo.getDefinition(url);

        const expansion= new fhirR4.ValueSetExpansion();
        expansion.contains = [];
        expansion.contains = expansion.contains.concat(await this.getContains(members,def));

        if (expand && subsets) {
            for (const s of subsets) {
              const subset = await this.getValueSet(s,expand);
              if (subset.expansion && subset.expansion.contains)
                expansion.contains = expansion.contains.concat(subset.expansion.contains);
            }
        }

        if(Object.keys(expansion.contains).length !== 0) {
            result.expansion = expansion;
        }

        const compose = await this.getCompose(subsets,def);
        if(compose != null && Object.keys(compose).length !== 0) {
            result.compose = compose;
        }

        return result;
    }


    async getContains(members:string[], def:string[]) : Promise<ValueSetContains[]> {
        const result:ValueSetContains[] = [];
        if (members !== null && members.length !== 0) {
            members.forEach((m: any) => {
                result.push(this.setValueSetContains(m.member.value, m.term.value, m.code.value, m.scheme.value));
            })
        } else if (def !== null && def.length !== 0) {
            const queryRequest = {
                query: JSON.parse(def[0])
            }
            const entitiesFromDef = (await this.queryService.queryIM(queryRequest as any)).entities;
            for (const m of entitiesFromDef) {
                const entity = await this.repo.getDetails(m["@id"]);
                result.push(this.setValueSetContains(m["@id"], entity[0].term.value, entity[0].code.value, entity[0].scheme.value));
            }
        }

        return result;

    }

    setValueSetContains(iri:string, term:string, code:string, scheme:string) {
        const valueSetContains = new fhirR4.ValueSetContains();
        valueSetContains.id = iri;
        valueSetContains.display = term;
        valueSetContains.code = code;
        valueSetContains.system = scheme;
        return valueSetContains;
    }

    async  getCompose(subsets:string[], def:string[]) {
        const compose = new fhirR4.ValueSetCompose();
        const include = new fhirR4.ValueSetInclude();
        const filter = new fhirR4.ValueSetFilter();
        if(subsets !== null && subsets.length !== 0) {
            include.valueSet = subsets;
        }
        filter.value =  await this.repo.getECLFromDefinition(def);
        if(filter.value !== null && filter.value !== "") {
            include.filter = [filter];
        }

        if(include !== null && Object.keys(include).length !== 0) {
            compose.include = [include];
        }

        return compose;
    }


}
