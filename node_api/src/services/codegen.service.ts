import { CodeTemplate } from "@im-library/interfaces";
import EntityService from "./entity.service";
import Env from "./env.service";
import { generateCode } from "@im-library/helpers";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import AdmZip from "adm-zip";
import { codify } from "@im-library/helpers/CodeGenerator";

export default class CodeGenService {
  axios: any;
  entityService: EntityService;

  constructor(axios: any) {
    this.axios = axios;

    this.entityService = new EntityService(axios);
  }

  public async generateCode(template: string) {
    const models: TTIriRef[] = [];

    const templateData = await this.loadTemplate(template);

    await this.getChildrenRecursive(models, "http://endhealth.info/im#PatientRecordEntry");

    const zip = new AdmZip();

    for (const model of models) {
      const properties = await this.entityService.getDataModelProperties(model["@id"]);
      const code = generateCode(templateData, model, properties, "");
      zip.addFile(codify(model.name!) + templateData.fileExtension, Buffer.from(code));
    }

    return zip.toBuffer();
  }

  private async getChildrenRecursive(models: TTIriRef[], iri: string) {
    if (models.some(m => m["@id"] === iri)) return;

    const info = await this.entityService.getEntitySummary(iri);
    models.push({ "@id": info.iri, name: info.name, description: info.description });

    const children = await this.entityService.getEntityChildren(iri);

    for (const child of children) {
      if (!models.some(m => m["@id"] == child["@id"])) {
        // models.push(child);
        await this.getChildrenRecursive(models, child["@id"]);
      }
    }
  }

  public async loadTemplate(template: string): Promise<CodeTemplate> {
    const templateData: { name: string; extension: string; collectionWrapper: string; datatypeMap: any; template: string } = (
      await this.axios.get(Env.API + "api/codeGen/public/codeTemplate", {
        params: { templateName: template }
      })
    ).data;

    // Get marker positions
    const propertyTemp = "<template #property>";
    const propertyTempEnd = "</template #property>";
    const arrayTemp = "<template #array>";
    const arrayTempEnd = "</template #array>";

    const t = templateData.template;
    const ps = { s: t.indexOf(propertyTemp), l: propertyTemp.length };
    const pe = { s: t.indexOf(propertyTempEnd), l: propertyTempEnd.length };
    const as = { s: t.indexOf(arrayTemp), l: arrayTemp.length };
    const ae = { s: t.indexOf(arrayTempEnd), l: arrayTempEnd.length };

    const header = t.substring(0, ps.s);
    const footer = t.substring(pe.s + pe.l);
    const property = t.substring(ps.s + ps.l, as.s > 0 ? as.s : pe.s);
    const array = as.s > 0 ? t.substring(as.s + as.l, ae.s) : "";

    return {
      fileExtension: templateData.extension,
      collectionWrapper: templateData.collectionWrapper,
      datatypeMap: templateData.datatypeMap,
      header: header,
      footer: footer,
      property: property,
      collectionProperty: array
    } as CodeTemplate;
  }
}
