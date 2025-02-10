# IMDirectory

![Version](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory/version.svg)
![Build Status](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory/build.svg)
![Unit Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMDirectory/unit-test.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=endeavourhealth-discovery_IMDirectory&metric=alert_status)](https://sonarcloud.io/dashboard?id=endeavourhealth-discovery_IMDirectory)

## Project setup

**The proxy expects the IMAPI to be running on localhost:8080**

### node, npm, pnpm

IMDirectory uses [node](https://nodejs.org/en), [npm](https://www.npmjs.com/) and [pnpm](https://pnpm.io/). Current recommended compatable versions are:

| Package | Version |
| ------- | ------- |
| node    | 18.17.0 |
| npm     | 9.6.7   |
| pnpm    | 9.11.0  |

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

    CYPRESS_LOGIN_USERNAME="username for IMDirectory account cypress will use"
    CYPRESS_LOGIN_PASSWORD="password for IMDirectory account cypress will use"
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

E2E test using cypress

```console
pnpm test:e2e
```

### Customize configuration

For customisation the config is in the root folder file

> vite.config.ts

See [Configuration Reference](https://cli.vuejs.org/config/).
