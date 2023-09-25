# Cypress XML Reporter

A JUnit XML reporter for Cypress that includes **screenshots**, **videos**, and **logs** on test failures.

![CI](https://github.com/testspace-com/cypress-xml-reporter/actions/workflows/test.yml/badge.svg) [![npm](https://img.shields.io/npm/v/cypress-xml-reporter.svg?style=flat-square)](http://www.npmjs.com/package/cypress-xml-reporter)

This reporter works with [Testspace](https://testspace.com) to publish CI test results that include:

1. Captured screenshot of a test failure
2. Captured video for a suite with one or more failing tests
3. Logs generated using the [cypress terminal reporter](https://github.com/archfz/cypress-terminal-report)


## Installation

```
npm install cypress-xml-reporter --save-dev
```

Register the *plugin* in `cypress.config.js`:
```
module.exports = defineConfig({
  video: true, // Cypress v13.x defaults to false
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-xml-reporter/src/plugin') (on);
    }
  }
});
```

Note that Cypress [v13.x](https://docs.cypress.io/guides/references/changelog#13-0-0) defaults the `video` option to `false`. This option requires to be `true` to capture videos for test failures.

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
  video: true, // Cypress v13.x defaults to false
  reporter: 'cypress-xml-reporter',
  reporterOptions: {
    resultsFolder: './path/location'
  },
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-xml-reporter/src/plugin') (on);
    }
  }
});
```

## Terminal Logging
To capture terminal output as log files the [Cypress terminal report](https://github.com/archfz/cypress-terminal-report) package is supported:

```
npm install cypress-terminal-report --save-dev
```
The package is required to be configured for [log specs in separate files](https://github.com/archfz/cypress-terminal-report#logging-to-files), setting the **type** format as `txt`. And pass in the defined options (i.e. *logsOptions*) to the reporter plugin:

```
setupNodeEvents(on, config) {
  const logsOptions = {
    outputRoot: config.projectRoot + '/cypress/',
    outputTarget: {
      'logs|txt': 'txt',
    }
  };
  require('cypress-terminal-report/src/installLogsPrinter')(on, logsOptions);
  require('cypress-xml-reporter/src/plugin') (on, logsOptions);
}
```

Note that the terminal report requires an extra [installation](https://github.com/archfz/cypress-terminal-report#install) step to **register the log collector**.