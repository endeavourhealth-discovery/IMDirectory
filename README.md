# IMDirectory

## Current status

| Environment | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Live        | ![Version](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-live/version.svg) ![Build](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-live/build.svg) ![Unit Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-live/unit-test.svg) ![E2E Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-live/e2e-test.svg)                                                                                                                                                         |
| UAT         | ![Version](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-uat/version.svg) ![Build](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-uat/build.svg) ![Unit Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-uat/unit-test.svg) ![E2E Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-uat/e2e-test.svg)                                                                                                                                                             |
| Dev         | ![Version](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-dev/version.svg) ![Build](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-dev/build.svg) ![Unit Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-dev/unit-test.svg) ![E2E Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory-dev/e2e-test.svg) [![Sonar](https://sonarcloud.io/api/project_badges/measure?project=IMDirectory&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=IMDirectory) |

## Project setup

**The proxy expects the IMAPI to be running on localhost:8080**

### Fontawesome

IMDirectory uses [FontAwesome Pro](https://fontawesome.com/). The project is setup to connect to a self-hosted version of fontawesome pro. This setup is contained in the root file

> index.html

### Install

```console
pnpm install
```

#### Environment variables

In project root add file

> .env

File should contain:

    VITE_HOSTING_MODE="public" || "private"

### Compiles and hot-reloads for development

```console
pnpm dev
```

### Compiles and minifies for production

```console
pnpm build
```

### Preview production build

```console
npm preview
```

### Lints and fixes files

Lint using esLint

```console
pnpm lint
```

Format using prettier

```console
pnpm lint
```

### Testing

Unit test using vitest

```console
pnpm test:unit
```

E2E test

```console
pnpm test:e2e
```

### Customize configuration

For customisation the config is in the root folder file

> vite.config.ts

See [Configuration Reference](https://cli.vuejs.org/config/).
