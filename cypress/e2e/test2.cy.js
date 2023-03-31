const parseString = require('xml2js').parseString;

/**
 * Required Setting
 */
const testName = "test2.cy.js";

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
const screenshotFile  = "cypress/screenshots/"+testDataName+"/TEST2 -- NESTED -- case3 (failed).png";

/**
 * Gobals
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
  describe('TEST2', () => {
    it('Name', () => {
      expect(suites[1].$.name).to.equal('TEST2');
    });
    it('Tests Count', () => {
      expect(suites[1].$.tests).to.equal('6');
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
      it('"NESTED -- case1" name', () => {
        expect(testcases[3].$.name).to.equal('NESTED -- case1');
      });
      it('"NESTED -- case2" name', () => {
        expect(testcases[4].$.name).to.equal('NESTED -- case2');
      });
      it('"NESTED -- case3" name', () => {
        expect(testcases[5].$.name).to.equal('NESTED -- case3');
      });
      it('"NESTED -- case3" Failure', () => {
        var systemout = testcases[5]['system-out'][0];
        expect(systemout).to.equal('[[ATTACHMENT|'+screenshotFile+']]');
      })
    });
  });
});