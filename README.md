# Cypress XML Reporter
A JUnit XML reporter for Cypress that includes screenshots, videos, and logs.

## Installation

```
npm install cypress-xml-reporter --save-dev
```
For including logs the https://www.npmjs.com/package/cypress-terminal-report package is supported:

```
npm install cypress-terminal-report --save-dev
```

Register the *plugin* in `cypress.config.js`:
```
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-xml-reporter/src/plugin') (on);
    }
  }
});
```

## Usage
Run Cypress with `cypress-xml-reporter`:

```
$ cypress run --reporter cypress_xml_reporter
```

The generated xml files are by default located at `./results`. You may optionally configure a different location by setting the environment variable `RESULTS_FOLDER` or specifying `resultsFolder` in the `reporterOptions`:

```
$ RESULTS_FOLDER=./path/location cypress run --reporter cypress_xml_reporter
```
Or
```
$ cypress run --reporter cypress_xml_reporter --reporter-options "resultsFolder=./path/location"
```
Or using `cypress.config.js`:
```
module.exports = defineConfig({
  reporterOptions: {
    resultsFolder: './path/location'
  }
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-xml-reporter/src/plugin') (on);
    }
  }
});
```

### Logging Configuration
TBD

