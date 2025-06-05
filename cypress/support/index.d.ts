declare global {
  var vueSnapshots: any;
  namespace Cypress {
    interface Chainable {
      acceptLicenseAndCookies(): Chainable<void>;
      openReleaseNotes(): Chainable<void>;
      getByTestId(id: string, options?: any): Chainable<void>;
      preventRouterNewTab(): Chainable<void>;
      visitNewTab(url: string): Chainable<void>;
      login(): Chainable<void>;
      expandTreeNode(treeId: string, contains: string): Chainable<void>;
      searchAndSelect(searchTerm: string): Chainable<void>;
      acceptLicenseAndLogin(): Chainable<void>;
      populateBaseType(): Chainable<void>;
      loginByCognitoApi(username: string, password: string): Chainable<void>;
      setLocalStorage(localStorageMap: Map<string, string>): Chainable<void>;
      requestWithAuth(method: "POST" | "GET", url: string, body: any): Chainable<any>;
      clearFavouritesAndSuggested(): Chainable<void>;
      searchAndSelectWithFilters(searchTerm: string, filters: FilterOptions): Chainable<void>;
      setHostingMode(isPublicMode: boolean): Chainable<void>;
      toMatchSnapshot(options?: any): void;
    }
  }
}
