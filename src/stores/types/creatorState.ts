import { TTEntity } from "@/interfaces/ExtendedAutoGen";

export interface CreatorState {
  creatorSavedEntity: TTEntity | undefined;
  creatorHasChanges: boolean;
}
