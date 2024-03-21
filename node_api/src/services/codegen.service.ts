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

  public async generateCode(template: string, namespace: string) {
    const models: TTIriRef[] = [];

    const templateData = await this.loadTemplate(template);

    await this.getChildrenRecursive(models, "http://endhealth.info/im#PatientRecordEntry");

    const zip = new AdmZip();

    for (const model of models) {
      const properties = await this.entityService.getDataModelProperties(model["@id"]);
      const code = generateCode(templateData, model, properties, namespace);
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
        await this.getChildrenRecursive(models, child["@id"]);
      }
    }
  }

  public async loadTemplate(template: string): Promise<CodeTemplate> {
    const templateData: any = (
      await this.axios.get(Env.API + "api/codeGen/public/codeTemplate", {
        params: { templateName: template }
      })
    ).data;

    return {
      template: templateData.template,
      fileExtension: templateData.extension,
      collectionWrapper: templateData.collectionWrapper,
      datatypeMap: templateData.datatypeMap
    };
  }
}
