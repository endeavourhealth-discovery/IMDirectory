import { defineStore } from "pinia";
import { CreatorState } from "@/stores/types/creatorState";
import { useCookieStore } from "@/stores/cookieStore";

const cookieStore = useCookieStore();
export const useCreatorStore = defineStore("creator", {
    state: (): CreatorState => ({
        creatorSavedEntity: JSON.parse(localStorage.getItem("creatorSavedEntity") || "{}") as any,
        creatorHasChanges: false as boolean
    }),
    actions: {
        updateCreatorSavedEntity(entity: any) {
            if (cookieStore.cookiesOptionalAccepted) {
                this.creatorSavedEntity = entity;
                if (entity && cookieStore.cookiesOptionalAccepted) localStorage.setItem("creatorSavedEntity", JSON.stringify(entity));
                else localStorage.removeItem("creatorSavedEntity");
            }
        },
        updateCreatorHasChanges(bool: any) {
            this.creatorHasChanges = bool;
        }
    }
});
