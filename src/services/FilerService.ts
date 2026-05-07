import { NAMESPACE } from "@endeavour/vue-library/enums";
import type { ExtendedTTEntity, TTDocument } from "@endeavour/vue-library/interfaces";

import axios from "axios";

import Env from "./Env";

const API_URL = Env.API + "api/filer/private";
const FilerService = {
  async moveFolder(entity: string, oldFolder: string, newFolder: string): Promise<void> {
    return await axios.post(API_URL + "/folder/move", null, {
      params: {
        entity,
        oldFolder,
        newFolder
      }
    });
  },

  async addToFolder(entity: string, folder: string): Promise<void> {
    return await axios.post(API_URL + "/folder/add", null, {
      params: {
        entity,
        folder
      }
    });
  },

  async createFolder(container: string, name: string): Promise<string> {
    return await axios.post(API_URL + "/folder/create", null, {
      params: {
        container: container,
        name: name
      }
    });
  },

  async downloadDeltas(): Promise<Blob> {
    return await axios.get(API_URL + "/deltas/download", { responseType: "blob" });
  },

  async fileEntity(entity: ExtendedTTEntity, namespace: NAMESPACE, crud: string): Promise<void> {
    return await axios.post(API_URL + "/file/entity", { entity: entity, namespace: namespace, crud: crud });
  },

  async fileDocument(document: TTDocument): Promise<{ [x: string]: string }> {
    return await axios.post(API_URL + "/file/document", { document: document, insertNamespace: NAMESPACE.IM });
  },

  async getTaskProgress(taskId: string): Promise<{ [x: string]: number }> {
    return await axios.get(API_URL + `/file/document/${taskId}`);
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(FilerService);

export default FilerService;
