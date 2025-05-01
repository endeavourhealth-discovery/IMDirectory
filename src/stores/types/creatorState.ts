import { TTEntity } from "@/interfaces/ExtentedAutoGen";

export interface CreatorState {
  creatorSavedEntity: TTEntity | undefined;
  creatorHasChanges: boolean;
}
