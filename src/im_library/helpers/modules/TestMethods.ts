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

export function createTestRouter(routes?: RouteRecordRaw[]) {
  return createRouter({ routes: routes || [], history: createWebHashHistory() });
}

export function mountComposable(composable: any, mockStore?: any, mockRouter?: any, mockRoute?: any) {
  const TestComponent = defineComponent({
    setup() {
      return { ...composable() };
    },
    template: "<template></template>"
  });

  return mount(TestComponent, {
    global: {
      provide: { store: mockStore || createTestStore(), router: mockRouter || createTestRouter(), route: mockRoute || {} }
    }
  });
}

export default { createTestStore, createTestRouter, mountComposable };
