# IMDirectory

![Version](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMViewer/version.svg)
![Build Status](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMViewer/build.svg)
![Unit Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMViewer/unit-test.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=endeavourhealth-discovery_IMViewer&metric=alert_status)](https://sonarcloud.io/dashboard?id=endeavourhealth-discovery_IMViewer)

## Project setup

**The proxy expects the IMAPI to be running on localhost:8080**

```
npm install
```

#### Environment variables

In project root add files

> .env.development.local

> .env.production.local

> .env.test.local

Files should contain:

    VITE_API={url for IMApi} [local default: http://localhost:8080/]

    VITE_DIRECTORY_URL={url for IMDirectory} [local default: http://localhost:8082]

    VITE_AUTH_URL={url for IMAuth} [local default: http://localhost:8082]

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build
```

### Preview production build

```
npm run serve
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
