import axios from "axios";
import Env from "./Env";


const FhirService = {
    async getValueSet(url: string, expand?: any ) {
        try {
            return await axios.get(Env.VITE_NODE_API + "/node_api/fhir/r4/ValueSet", { params: { iri: url, expand: expand} });
        } catch (error) {
            return [] as any[];
        }
    }
}

if (process.env.NODE_ENV !== "test") Object.freeze(FhirService);

export default FhirService;