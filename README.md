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
TBD

### Logging Configuration
TBD

