import { OrganizationChartNode } from "primevue/organizationchart";
import axios from "axios";
import Env from "@/services/Env";

const API_URL = Env.API + "api/graphDto";

const GraphDtoService = {
    async getEntityGraph(iri: string): Promise<OrganizationChartNode> {
        return axios.get(API_URL + "/public/graph", { params: { iri: iri } });
    }
};

export default GraphDtoService;