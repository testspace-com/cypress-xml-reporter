const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporterOptions: {
    resultsFolder: 'results/log'
  },
  e2e: {
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      const logsOptions = {
        printLogsToConsole: "always", // onFail or always
        printLogsToFile: "always",    // onFail or always
        outputRoot: config.projectRoot + '/cypress/',
        specRoot: 'cypress/e2e',
        outputTarget: {
          'logs|json': 'json',
          'logs|txt': 'txt',
        }
      };
      require('cypress-terminal-report/src/installLogsPrinter')(on, logsOptions);
      require('./src/plugin') (on, logsOptions);
    }
  },
  component: {
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
  },
  videosFolder:	"cypress/videos"
});