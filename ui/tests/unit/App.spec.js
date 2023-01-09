import { render, fireEvent, within } from "@testing-library/vue";
import App from "@/App.vue";
import Toast from "primevue/toast";
import ProgressSpinner from "primevue/progressspinner";
import ConfirmDialog from "primevue/confirmdialog";
import Button from "primevue/button";
import Menu from "primevue/menu";
import { expect, vi } from "vitest";
import PrimeVue from "primevue/config";

vi.mock("vuex", () => ({
  useStore: () => ({
    dispatch: mockDispatch,
    commit: mockCommit,
    state: mockState
  })
}));

const mockDispatch = vi.fn();
const mockCommit = vi.fn();
const mockState = { showReleaseNotes: false };

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

describe("App.vue", () => {
  let component;

  beforeEach(async () => {
    vi.resetAllMocks();
    component = render(App, {
      global: {
        components: { Toast, ProgressSpinner, ConfirmDialog, Button, Menu },
        stubs: { "router-link": true, "router-view": true, ReleaseNotes: true },
        plugins: [PrimeVue]
      }
    });
  });

  it("should check auth and update store history count on mount", async () => {
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith("authenticateCurrentUser");
  });
});
