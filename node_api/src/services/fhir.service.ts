import { fhirR4 } from "@smile-cdr/fhirts";
import axios from "axios";
import { ValueSetContains } from "@smile-cdr/fhirts/dist/FHIR-R4/classes/valueSetContains";
import Env from "@/services/env.service";
import { SetContent } from "@im-library/interfaces/AutoGen";
import EclService from "@/services/ecl.service";

export default class FhirService {
  public async getValueSet(url: string, expand: boolean): Promise<any> {
    if (!url) return null;

    const setContent: SetContent = (
      await axios.get(Env.API + "api/entity/public/setExport", {
        params: {
          iri: url,
          definition: true,
          core: expand,
          includeSubsets: true,
          format: "object"
        }
      })
    ).data;

    const result = new fhirR4.ValueSet();
    result.resourceType = "ValueSet";
    result.language = "en";
    result.url = url;
    result.name = setContent.name;
    result.title = setContent.name;
    result.description = setContent.description;

    if (setContent.status) {
      result.status = setContent.status.toLowerCase() as any;
    }

    if (setContent.version) {
      result.version = setContent.version.toString();
    }

    const expansion = new fhirR4.ValueSetExpansion();

    if (setContent.concepts && setContent.concepts.length > 0)
      expansion.contains = setContent.concepts.map<ValueSetContains>(c => {
        const valueSetContains = new fhirR4.ValueSetContains();
        valueSetContains.id = c["@id"];
        valueSetContains.display = c.name;
        valueSetContains.code = c.code;
        valueSetContains.system = c.scheme?.["@id"];
        return valueSetContains;
      });

    if (expansion.contains && expansion.contains.length > 0) result.expansion = expansion;

    const compose = new fhirR4.ValueSetCompose();
    result.compose = compose;
    const include = new fhirR4.ValueSetInclude();
    compose.include = [include];

    include.valueSet = setContent.subsets;

    if (setContent.setDefinition) {
      const filter = new fhirR4.ValueSetFilter();
      filter.value = setContent.setDefinition;
      include.filter = [filter];
    }

    return result;
  }

  async eclToFhir(data: string) {
    const result = new fhirR4.ValueSet();
    result.resourceType = "ValueSet";
    result.name = data.replaceAll("\n", " ");

    const expansion = new fhirR4.ValueSetExpansion();
    expansion.contains = [];

    const contains: ValueSetContains[] = [];
    const evaluated = await (new EclService(axios).evaluateEcl(data));
    if (evaluated.entities) {
      for (const e of evaluated.entities) {
        const valueSetContains = new fhirR4.ValueSetContains();

        valueSetContains.id = e.iri;
        valueSetContains.display = e.name;
        valueSetContains.code = e.code;
        valueSetContains.system = e.scheme?.["@id"];

        contains.push(valueSetContains);
      }
    }

    expansion.contains = contains;
    result.expansion = expansion;

    return result;
  }
}
