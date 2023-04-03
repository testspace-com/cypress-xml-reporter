const parseString = require('xml2js').parseString;

/**
 * Setting
 */
const focus    = 'desc-nest-desc';
const ROOT_DIR = 'cypress/'

/**
 * Derived settings
 */

const testName     = 'test.'+focus+'.cy.js';
const testDataName = 'data.'+focus+'.cy.js';
const testFile     = ROOT_DIR+'e2e/'+testDataName;
const resultsFile  = ROOT_DIR+'results/results.'+testDataName+'.xml';
const videoFile    = ROOT_DIR+'videos/'+testDataName+'.mp4';

/**
 * Failure(s) required settings
 */
const screenshotFile  = ROOT_DIR+'screenshots/'+testDataName+'/TEST1 -- NEST -- case3 (failed).png';

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
  describe('TEST1', () => {
    it('Name', () => {
      expect(suites[1].$.name).to.equal('TEST1');
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
      it('"NEST -- case1" name', () => {
        expect(testcases[3].$.name).to.equal('NEST -- case1');
      });
      it('"NEST -- case2" name', () => {
        expect(testcases[4].$.name).to.equal('NEST -- case2');
      });
      it('"NEST -- case3" name', () => {
        expect(testcases[5].$.name).to.equal('NEST -- case3');
      });
      it('"NEST -- case3" Failure', () => {
        var systemout = testcases[5]['system-out'][0];
        expect(systemout).to.equal('[[ATTACHMENT|'+screenshotFile+']]');
      })
    });
  });
});