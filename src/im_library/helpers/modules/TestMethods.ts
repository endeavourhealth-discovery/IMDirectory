import { createStore } from "vuex";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHashHistory, RouteComponent, RouteRecordRaw } from "vue-router";

export function createTestStore(mockState?: any, mockCommit?: any, mockDispatch?: any) {
  const store = createStore({
    state() {
      return mockState || {};
    }
  });
  store.commit = mockCommit || vi.fn();
  store.dispatch = mockDispatch || vi.fn();
  return store;
}

export function createTestRouter(routes?: RouteRecordRaw[], mockPush?: any, mockGo?: any, mockBack?: any, mockForward?: any) {
  const router = createRouter({ routes: routes || [], history: createWebHashHistory() });
  router.push = mockPush || vi.fn();
  router.go = mockGo || vi.fn();
  router.back = mockBack || vi.fn();
  router.forward = mockForward || vi.fn();
  return router;
}

export function mountComposable(composable: any, mockStore?: any, mockRouter?: any) {
  const TestComponent = defineComponent({
    setup() {
      return { ...composable() };
    },
    template: "<template></template>"
  });

  if (mockRouter)
    return mount(TestComponent, {
      global: {
        provide: { store: mockStore || createTestStore() },
        plugins: [mockRouter]
      }
    });
  else return mount(TestComponent, { global: { provide: { store: mockStore || createTestStore() } } });
}

export default { createTestStore, createTestRouter, mountComposable };
