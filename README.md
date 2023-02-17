# Information Model (v2)

![Version](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IM/version.svg)
![Build Status](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IM/build.svg)
![Unit Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IM/unit-test.svg)

## Sonar

| Module | Status                                                                                                                                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UI     | [![Quality Gate (UI)](https://sonarcloud.io/api/project_badges/measure?project=endeavourhealth-discovery_IM::ui&metric=alert_status)](https://sonarcloud.io/dashboard?id=endeavourhealth-discovery_IM::ui)                     |
| Common | [![Quality Gate (Common)](https://sonarcloud.io/api/project_badges/measure?project=endeavourhealth-discovery_IM::im_library&metric=alert_status)](https://sonarcloud.io/dashboard?id=endeavourhealth-discovery_IM::im_library) |
| API    | [![Quality Gate (API)](https://sonarcloud.io/api/project_badges/measure?project=endeavourhealth-discovery_IM::node_api&metric=alert_status)](https://sonarcloud.io/dashboard?id=endeavourhealth-discovery_IM::node_api)        |

## Setup

### Fontawesome

Information Model (v2) uses FontAwesome Pro. Before running the install script you will need to run the following within your terminal using a valid [FONT-AWESOME-PACKAGE-TOKEN](https://fontawesome.com/sessions/sign-in?next=%2Faccount%23pro-package-tokens):

```console
npm config set "@fortawesome:registry" https://npm.fontawesome.com/
npm config set "//npm.fontawesome.com/:_authToken" FONT-AWESOME-PACKAGE-TOKEN
```

### Install

Run the following terminal command in the project root:

```console
npm run install-all
```

## Execute

To run both the UI and API from the root folder (in parallel), run `npm run dev`. Alternatively, cd into the relevant module and `npm run dev` from there.
