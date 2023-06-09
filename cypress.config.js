const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    supportFile: false,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      require('./src/plugin') (on);
    }
  },
  component: {
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
  },
  videosFolder:	"cypress/videos"
});