const parseString = require('xml2js').parseString;

/**
 * Setting
 */
const testName = "test1.cy.js";

/**
 * Derived settings
 */

const testDataName = "data."+testName;
const testFile     = "cypress/e2e/"+testDataName;
const resultsFile  = "cypress/results/results."+testDataName+".xml";
const videoFile    = "cypress/videos/"+testDataName+".mp4";

/**
 * Failure(s) required settings
 */
const screenshotFile  = "cypress/screenshots/"+testDataName+"/TEST1 -- case3 (failed).png";

/**
 * Globals
 */
var suites    = [];

before( () => {
  cy.readFile(resultsFile).then((str) => {
    parseString(str, function (err, results) {
      suites = results.testsuites.testsuite;
      cy.writeFile('results.json', suites)
    });
  });
});
describe(testName, () => {
  describe('Root Suite', () => {
    it('Name', () => {
      expect(suites[0].$.name).to.equal('Root Suite');
    });
    it('Tests Count', () => {
      expect(suites[0].$.tests).to.equal('0');
    });
    it('File Name', () => {
      expect(suites[1].$.file).to.equal(testFile);
    });
  });
  describe('TEST1', () => {
    it('Name', () => {
      expect(suites[1].$.name).to.equal('TEST1');
    });
    it('Tests Count', () => {
      expect(suites[1].$.tests).to.equal('3');
    });
    it('File Name', () => {
      expect(suites[1].$.file).to.equal(testFile);
    });
    it('System-out', () => {
      var systemout = suites[1]['system-out'][0];
      expect(systemout).to.equal('[[ATTACHMENT|'+videoFile+']]');
    });
    describe('Testcases', ()=> {
      var testcases;
      before(() => {
        testcases = suites[1]['testcase'];
      });
      it('"case1" name', () => {
        expect(testcases[0].$.name).to.equal('case1');
      });
      it('"case2" name', () => {
        expect(testcases[1].$.name).to.equal('case2');
      });
      it('"case3" name', () => {
        expect(testcases[2].$.name).to.equal('case3');
      });
      it('"case3" Failure', () => {
        var systemout = testcases[2]['system-out'][0];
        expect(systemout).to.equal('[[ATTACHMENT|'+screenshotFile+']]');
      })
    });
  });
});