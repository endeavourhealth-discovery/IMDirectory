# Information Model Viewer
![Version](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMViewer/version.svg)
![Build Status](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMViewer/build.svg)
![Unit Tests](https://s3.eu-west-2.amazonaws.com/endeavour-codebuild-output/badges/IMViewer/unit-test.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=endeavourhealth-discovery_IMViewer&metric=alert_status)](https://sonarcloud.io/dashboard?id=endeavourhealth-discovery_IMViewer)
## Run Frontend (development)

Checkout from GIT

`cd frontend-vue`

`npm install` (you only have to do this once)

`npm run serve`

Navigate your browser to `http://localhost:8081`

The proxy expects the API to be running on localhost:8080

## Build Frontend (production)

`npm run build`
