import { CreateComponentPublicInstance } from "vue";

export default class DirectService {
  static VIEWER_APP = "https://dev.endhealth.co.uk/#/concept/";
  static MESSAGE = "You will be directed to a different application. Are you sure you want to proceed?";

  public static directTo(iri: string) {
    window.open(this.VIEWER_APP + encodeURIComponent(iri));
  }

  public static directWithConfirmation(iri: string, component: CreateComponentPublicInstance<any>) {
    component.$confirm.require({
      message: this.MESSAGE,
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.directTo(iri);
      },
      reject: () => {
        component.$confirm.close();
      }
    });
  }
}
