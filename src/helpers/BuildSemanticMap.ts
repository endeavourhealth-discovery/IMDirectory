import { DataModelService } from "@/services";

export async function getTypePropertyOptions(iri: string): Promise<any[]> {
  const shape = await DataModelService.getDataModelProperties(iri);
  const options = [];
  if (shape.property) {
    shape.property.sort((a, b) => a.order - b.order);
    for (const property of shape.property) {
      options.push({ value: property.path.iri, label: property.path.name });
    }
  }
  return options;
}
