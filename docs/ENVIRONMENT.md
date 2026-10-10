# IMDirectory environment variables

IMDirectory is a Vue 3 single-page app built with Vite and served as static files. That makes its configuration very simple, and very different from the server apps:

- **Build time:** every `VITE_…` variable is read by Vite while building (`vite build`, or when `vite` / `vite --mode …` starts for development) and is **written into the JavaScript bundle**. A different value means a different build.
- **Run time:** there is nothing to configure. The built app is static files, and a web server cannot change these values after the build. To change the IMAPI address, Casdoor settings or similar, rebuild (or build one bundle per environment).

> Because the values are compiled into files that every visitor downloads, **never put secrets in a `VITE_…` variable.** Sign-in uses PKCE, so the app needs no client secret.

## Build time (`VITE_…`)

Vite loads these from `.env`, then `.env.<mode>` (`.env.production` for `vite build`, `.env.mock` for `pnpm dev:mocked`). Variables set in the shell at build time override the files. All `.env*` files are git-ignored.

| Variable                 | Required    | Default                 | Purpose                                                                                                                                                                                                                                                                                        |
|--------------------------|-------------|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `VITE_API`               | no          | `/imapi/`               | Base URL of IMAPI **with a trailing slash**. The default is a same-origin path, which the dev server proxies to `http://127.0.0.1:8080` and a production web server should proxy to IMAPI. Set it to an absolute URL (ending in the IMAPI context path as appropriate) to call IMAPI directly. |
| `VITE_CASDOOR_URL`       | for sign-in | `http://localhost:8000` | Base URL of Casdoor. **Must be `https` outside local development.**                                                                                                                                                                                                                            |
| `VITE_CASDOOR_CLIENT_ID` | for sign-in | empty                   | Client ID of the IMDirectory application in Casdoor. If empty, sign-in is disabled and the app behaves as an anonymous / public site. IMAPI must list this client ID in its `CASDOOR_ALLOWED_CLIENT_IDS`.                                                                                      |
| `VITE_QUERY_RUNNER_URL`  | no          | `http://localhost:3000` | Base URL of IMQueryRunner, used for links into it.                                                                                                                                                                                                                                             |
| `BASE_URL`               | no          | `/`                     | Standard Vite setting (the `base` option, or `--base` on the command line) rather than a variable you set in `.env`. If the app is served from a sub-path, the sign-in redirect URL includes it.                                                                                               |

### Casdoor redirect URL

The sign-in redirect URL is the app's **root**, `origin + BASE_URL`, for example `https://directory.example.org/` or `http://localhost:8082/`. Register exactly that (with the trailing slash) as a redirect URL on the IMDirectory application in Casdoor; the same URL is used after signing out. The app uses hash routing, and a redirect URL cannot contain a `#`, so a `/#/callback` entry is not used any more.

### Development

| What       | How                                                                                                                                                          |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Dev server | `pnpm dev` (port 8082). `/imapi` is proxied to `http://127.0.0.1:8080`; that address is fixed in `vite.config.ts`, not configurable by environment variable. |
| Mocked API | `pnpm dev:mocked` loads `.env.mock` and starts the mock service worker, so no IMAPI is needed.                                                               |
| Mode       | Vite's `MODE` (`development`, `production` or `mock`) is the only other value read, in `src/main.ts`.                                                        |

## Run time

None. See above.

## Tests only

| Variable                                   | Used by                | Purpose                                        |
|--------------------------------------------|------------------------|------------------------------------------------|
| `TEST_USERNAME`, `TEST_PASSWORD`           | Gauge end-to-end tests | App URL and a test account.                    |
| `headless_chrome`, `screenshot_on_failure` | Gauge                  | Browser behaviour (set by `pnpm test:e2e:ci`). |
| `CI`                                       | Playwright             | Enables retries and single-worker mode in CI.  |

Unit tests (`pnpm test:unit`) need no environment.
