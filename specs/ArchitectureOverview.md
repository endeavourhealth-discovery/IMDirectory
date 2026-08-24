# IMDirectory — Architecture Overview

## What it is
A **Vue 3 SPA** (v2.12.0) for browsing, searching, creating, and editing healthcare information model entities. Built by Endeavour Health Discovery. Talks to a backend IM API, uses Casdoor/OAuth2 auth, supports roles (ADMIN, CREATOR, EDITOR, UPRN).

## Architecture Layers

```
API Backend (:8080)
    ^
    |  (REST via Axios)
    v
Services Layer (src/services/ — 17 service modules)
    ^
    |  (async method calls)
    v
Pinia Stores (9) + Composables (12)
    ^
    |  (reactive state / computed)
    v
Vue Components (Views -> Sub-components)
```

## Key Architectural Patterns

1. **Vue 3 Composition API** — `<script setup>` throughout; no Options API.
2. **Pinia stores** — 9 stores using setup function syntax: `sharedStore`, `authStore`, `directoryStore`, `editorStore`, `creatorStore`, `filterStore`, `dialogStore`, `loadingStore`, `queryStore`.
3. **Dynamic form rendering** — Editor/Creator uses SHACL-like shape definitions to dynamically render 30+ component types (`ArrayBuilder`, `EntityAutoComplete`, `TextInput`, `HtmlInput`, `TabLayout`, `VerticalLayout`, etc.).
4. **Service layer** — 17 frozen object literals (not classes) wrapping Axios calls. Request/response interceptors handle auth, error mapping, and Graph headers.
5. **MSW mocking** — Activated via `pnpm dev:mocked`; uses `@faker-js/faker` + `@msw/data` + Zod schemas in `src/mocks/`.
6. **Provide/Inject** — Heavily used in the editor for propagating `editorEntity`, `editorValidity`, `valueVariableMap`, and `forceValidation` down the component tree.
7. **Router guards** — Hash-based history (`createWebHashHistory`) with extensive `beforeEach` guards: auth, roles, licenses, agreements, unsaved-changes warnings.
8. **Internal shared library** (`@endeavour/vue-library`) — Provides core types (`TTEntity`, `PropertyShape`, `NodeShape`, `User`), enums (`UserRole`, `SHACL`, `IM`, `RDF`, `RDFS`), and utilities.

## Project Structure

| Directory | Purpose |
|---|---|
| `src/components/` | Feature-grouped components (app, shared, directory, editor, creator, imquery, query, workflow, uprn, adminToolbox) |
| `src/views/` | 20 page-level route components |
| `src/stores/` | 9 Pinia stores |
| `src/services/` | 17 API service modules |
| `src/composables/` | 12 composables |
| `src/helpers/` | 13 utility/helper modules |
| `src/router/` | Route definitions + 7 navigation guard modules |
| `src/interfaces/` | 50+ TypeScript interfaces |
| `src/enums/` | 10 TypeScript enums |
| `src/models/` | Custom error classes (ApiError, CustomError) |
| `src/typings/` | 8 ambient type declaration files (.d.ts) |
| `src/constants/` | Editor shape definitions, avatar constants, query editor config |
| `src/injectionKeys/` | Vue provide/inject key symbols |
| `src/mocks/` | MSW handlers + faker data factory |
| `src/logger/` | Logging configuration (typescript-logging) |
| `src/assets/` | CSS (Tailwind, PrimeVue overrides), SCSS layout, flags |
| `tests/unit/` | Vitest + happy-dom unit tests |
| `tests/e2e/` | Gauge + Playwright E2E tests |

## Stack

| Category | Packages |
|---|---|
| **UI Framework** | Vue 3.5, Vue Router 5, Pinia 3 |
| **Component Library** | PrimeVue 4.5 (Aura theme), PrimeIcons 7 |
| **Styling** | Tailwind CSS 4.2, SCSS (sass 1.99) |
| **HTTP** | Axios 1.15 |
| **Validation** | vee-validate 4, yup 1.7 |
| **Charts/Visualization** | chart.js 4, d3 7, mermaid 11 |
| **Diagrams** | svg-pan-zoom 3 |
| **Build** | Vite 8, TypeScript 6, vue-tsc 3 |
| **Linting/Formatting** | ESLint 10, Prettier 3.8, Husky 9, lint-staged 16 |
| **Unit Testing** | Vitest 4.1, happy-dom 20, @vue/test-utils 2, @testing-library/vue 8 |
| **E2E Testing** | Playwright 1.57, Gauge 1.6 |
| **API Mocking** | MSW 2.13, @faker-js/faker 10 |
| **Utilities** | lodash-es 4, @vueuse/core 14, uuid 13, zod 4 |
| **Internal Library** | @endeavour/vue-library (GitHub source) |

## Data Flow Examples

### Directory Browsing
1. User clicks a node in `NavTree.vue`
2. Emit bubbles to `DirectorySplitter.vue` → `router.push({ name: "Folder", params: { selectedIri } })`
3. Route loads `DirectoryDetails.vue`, calls `EntityService.getFullEntity(iri)` on mount
4. Service makes Axios GET to IMAPI; response (`TTEntity`) renders entity details

### Editing an Entity
1. Navigate to `/editor/:iri` → `Editor.vue` mounts
2. `useEditorEntity().fetchEntity()` calls `EntityService.getFullEntity()`
3. `useEditorShape().getShapesCombined()` loads the editor shape definition from `constants/editorShapes/`
4. Shape is processed into `groups` (PropertyShape array); template iterates and dynamically renders via `:is="processComponentType(group.componentType)"`
5. User input flows via provide/inject → `editorEntity` ref → `updateEntity()`
6. Validation runs via `useValidity` composable; save calls `EntityService.updateEntity()`

## Route Structure

Top-level layout (`InformationManager.vue`) with child routes under `/`:

| Route | Component | Access |
|---|---|---|
| `/directory` | Directory.vue | License required |
| `/directory/folder/:iri` | DirectoryDetails.vue | License required |
| `/directory/search` | SearchResults.vue | License required |
| `/directory/eclSearch` | EclSearch.vue | License required |
| `/directory/IMQuerySearch` | IMQuerySearch.vue | License required |
| `/admin` | AdminToolbox.vue | ADMIN role |
| `/creator` | Creator.vue | CREATOR/ADMIN role |
| `/editor/:iri` | Editor.vue | EDITOR/ADMIN role |
| `/workflow` | Workflow.vue | Auth + license |
| `/filer` | Filer.vue | License + auth |
| `/uprn` | Uprn.vue | UPRN/ADMIN role |
| `/codeGenerator` | CodeGen.vue | Auth + license |
| Error pages | AccessDenied / EntityNotFound / PageNotFound / ServerOffline | Public |
| `/callback` | Callback.vue | OAuth2 callback |
| `/:pathMatch(.*)*` | PageNotFound.vue | Catch-all |
