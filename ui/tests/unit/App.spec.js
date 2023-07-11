import { render } from "@testing-library/vue";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ProgressSpinner from "primevue/progressspinner";
import ConfirmDialog from "primevue/confirmdialog";
import DynamicDialog from "primevue/dynamicdialog";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Tooltip from "primevue/tooltip";
import { expect, vi } from "vitest";
import PrimeVue, { usePrimeVue } from "primevue/config";
import { GithubService, UserService } from "@/services";
import { fakerFactory } from "@im-library/mocks/fakerFactory";
import { createTestingPinia } from "@pinia/testing";
import { useSharedStore } from "@/stores/sharedStore";
import { useUserStore } from "@/stores/userStore";

createTestingPinia({
  initialState: {
    shared: { showReleaseNotes: false }
  }
});
const mockState = useSharedStore();
const mockUserState = useUserStore();

const mockPush = vi.fn();
const mockGo = vi.fn();
const mockRoute = { name: "Concept" };

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    go: mockGo
  }),
  useRoute: () => mockRoute
}));

const mockAdd = vi.fn();

vi.mock("primevue/usetoast", () => ({
  useToast: () => ({
    add: mockAdd
  })
}));

let changeThemeMock = vi.fn();

vi.mock("@/composables/setupChangeTheme.ts", () => {
  return {
    default: () => ({
      changeTheme: () => changeThemeMock
    })
  };
});

describe("App.vue", () => {
  let component;
  let getLatestReleaseSpy;
  let testLatestRelease = fakerFactory.githubRelease.create();
  let getUserThemeSpy;

  beforeEach(async () => {
    vi.resetAllMocks();
    getLatestReleaseSpy = vi.spyOn(GithubService, "getLatestRelease").mockResolvedValue(testLatestRelease);
    getUserThemeSpy = vi.spyOn(UserService, "getUserTheme").mockResolvedValue("saga-orange");
    component = render(App, {
      global: {
        components: { Toast, ProgressSpinner, ConfirmDialog, Button, Menu, DynamicDialog },
        stubs: { "router-link": true, "router-view": true, ReleaseNotes: true, CookiesConsent: true, SnomedConsent: true },
        plugins: [PrimeVue],
        directives: {
          tooltip: Tooltip
        }
      }
    });
  });

  it("should check auth and update sharedStore history count on mount", async () => {
    expect(mockUserState.authenticateCurrentUser).toHaveBeenCalledTimes(1);
  });
});
