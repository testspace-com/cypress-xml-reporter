const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'MyReporter',
  e2e: {
    supportFile: false,
   // specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      require('./src/config') (on);
    }
  },
  component: {
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
  },
 // videosFolder:	"cypress/videos"
});