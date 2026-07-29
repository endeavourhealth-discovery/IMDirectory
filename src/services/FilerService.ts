import { NAMESPACE } from "@endeavour/vue-library/enums";
import type { TTDocument, TTEntity } from "@endeavour/vue-library/models";

import Env from "./Env";
import api from "./api";

const API_URL = Env.API + "api/filer/private";
const FilerService = {
  async moveFolder(entity: string, oldFolder: string, newFolder: string): Promise<void> {
    return await api.post(API_URL + "/folder/move", null, {
      params: {
        entity,
        oldFolder,
        newFolder
      }
    });
  },

  async addToFolder(entity: string, folder: string): Promise<void> {
    return await api.post(API_URL + "/folder/add", null, {
      params: {
        entity,
        folder
      }
    });
  },

  async createFolder(container: string, name: string): Promise<string> {
    return await api.post(API_URL + "/folder/create", null, {
      params: {
        container: container,
        name: name
      }
    });
  },

  async downloadDeltas(): Promise<Blob> {
    return await api.get(API_URL + "/deltas/download", { responseType: "blob" });
  },

  async fileEntity(entity: TTEntity, namespace: NAMESPACE, crud: string): Promise<void> {
    return await api.post(API_URL + "/file/entity", { entity: entity, namespace: namespace, crud: crud });
  },

  async fileDocument(document: TTDocument): Promise<{ [x: string]: string }> {
    return await api.post(API_URL + "/file/document", { document: document, insertNamespace: NAMESPACE.IM });
  },

  async getTaskProgress(taskId: string): Promise<{ [x: string]: number }> {
    return await api.get(API_URL + `/file/document/${taskId}`);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(FilerService);

export default FilerService;
