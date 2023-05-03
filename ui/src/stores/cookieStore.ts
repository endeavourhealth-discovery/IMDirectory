import { defineStore } from "pinia";
import { CookieState } from "@/stores/types/cookieState";

import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

export const useCookieStore = defineStore("cookie", {
    state: (): CookieState => ({
        cookiesEssentialAccepted: localStorage.getItem("cookiesEssentialAccepted") === "true" ? true : false,
        cookiesOptionalAccepted: localStorage.getItem("cookiesOptionalAccepted") === "true" ? true : false,
        showCookieConsent: false,
    }),
    getters: {
        hasCookiesOptionalAccepted: state => isObjectHasKeys(state.cookiesOptionalAccepted)
    },
    actions: {
        clearOptionalCookies() {
            localStorage.removeItem("currentTheme");
            localStorage.removeItem("favourites");
            localStorage.removeItem("recentLocalActivity");
            localStorage.removeItem("directoryMainSplitterVertical");
            localStorage.removeItem("directoryMainSplitterHorizontal");
            localStorage.removeItem("viewerMainSplitterVertical");
            localStorage.removeItem("viewerMainSplitterHorizontal");
            localStorage.removeItem("eclEditorSavedString");
            localStorage.removeItem("editorSavedEntity");
            localStorage.removeItem("creatorSavedEntity");
            localStorage.removeItem("editorSelectedIri");
        },
        updateCookiesEssentialAccepted(bool: any) {
            this.cookiesEssentialAccepted = bool;
            localStorage.setItem("cookiesEssentialAccepted", bool);
        },
        updateCookiesOptionalAccepted(bool: any) {
            this.cookiesOptionalAccepted = bool;
            localStorage.setItem("cookiesOptionalAccepted", bool);
        },
        updateShowCookieConsent(bool: boolean) {
            this.showCookieConsent = bool;
        },
    }
});
