# Repository Guidelines

## Project Structure & Module Organization
The project is a **Vue 3** application built with **Vite** and **TypeScript**, following a modular architecture:
- **`src/components/`**: Reusable UI components.
- **`src/views/`**: Page-level components mapped to routes.
- **`src/composables/`**: Stateful logic using Vue's Composition API.
- **`src/stores/`**: State management powered by **Pinia**.
- **`src/services/`**: API interaction layer and business logic.
- **`src/models/`, `src/interfaces/`, `src/enums/`, `src/typings/`**: Centralized TypeScript definitions.
- **`src/mocks/`**: API mocking configurations using **MSW**.
- **`tests/`**: Contains `unit/` (Vitest) and `e2e/` (Gauge/Playwright) test suites.

## Build, Test, and Development Commands
The project uses **pnpm** (v10.5.2) as the package manager.
- **Development**: `pnpm dev` (runs Vite and `vue-tsc` in watch mode)
- **Production Build**: `pnpm build`
- **Linting**: `pnpm lint` (ESLint with auto-fix)
- **Formatting**: `pnpm format` (Prettier)
- **Unit Testing**: `pnpm test:unit`
- **E2E Testing**: `pnpm test:e2e`
- **Type Checking**: `pnpm tsc:build`

## Coding Style & Naming Conventions
- **Linter**: **ESLint** is used with `@eslint/js`, `typescript-eslint`, and `eslint-plugin-vue`.
- **Formatter**: **Prettier** is enforced via `.prettierrc.json` and integrated into ESLint.
- **TypeScript**: Strict mode is enabled. The `no-explicit-any` rule is currently disabled but should be avoided where possible.
- **Imports**: Use the `@/` alias for paths relative to the `src/` directory.
- **UI Framework**: Uses **PrimeVue** for components and **Tailwind CSS** for utility styling.

## Testing Guidelines
- **Unit Tests**: Located in `tests/unit/`, executed via **Vitest**.
- **E2E Tests**: Located in `tests/e2e/`, executed via **Gauge** and **Playwright**.
- **Mocking**: Use **MSW** for intercepting and mocking API requests during development and testing.

## Commit & Pull Request Guidelines
- **Conventional Commits**: Follow the conventional commit format (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
- **Pre-commit Hooks**: **Husky** and **lint-staged** are configured to run Prettier on changed files before every commit.
- **Branching**: Features and fixes are typically developed in named branches (e.g., `feature/name`, `fix/issue`) and merged via Pull Requests to `develop` or `main`.
