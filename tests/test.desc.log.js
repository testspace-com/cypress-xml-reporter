const expect = require("chai").expect;
const parseString = require('xml2js').parseString;
const path = require('path');
const fs = require('fs');

/**
 * Setting
 */
const testName = path.basename(__filename);
const testDataName = testName.replace('test.', 'data.').replace('.log.js', '.cy.js');

/**
 * Derived settings
 */
const testFile = path.join('cypress', 'e2e', testDataName);
const resultsFile = path.join('results', 'log', testFile)+'.xml';
const videoFile = path.join('cypress', 'videos', testDataName)+'.mp4';
const screenshotFile = path.join('cypress', 'screenshots', testDataName, 'TEST1 -- case3 (failed).png');

// Remove "spaces" and "newlines" variants
const logContent = ":TEST1->case1TEST1->case2TEST1->case3cy:command(X):assertexpected**1**toequal**2**Actual:1Expected:2";
const systemOut = testFile+logContent+"[[ATTACHMENT|"+videoFile+"]]";

/**
 * Globals
 */
var suites = [];
var cySuite = {};

before( () => {
  var theFile = fs.readFileSync(resultsFile, 'utf-8');
  parseString(theFile, function (err, results) {
    suites = results.testsuites.testsuite;
    cySuite = results.testsuites.$;
    fs.writeFileSync('results.json', JSON.stringify(suites, null, 2));
  });
});

describe(testName, () => {
  describe('Cypress Suite', () => {
    it('Name', () => {
      expect(cySuite.name).to.equal('Cypress Tests');
    });
    it('Tests Count', () => {
      expect(cySuite.tests).to.equal('3');
    });
    it('Failures Count', () => {
      expect(cySuite.failures).to.equal('1');
    });
    it('Pending Count', () => {
      expect(cySuite.skipped).to.equal('0');
    });
  });
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
      systemout = systemout.replace(/\s+|\r?\n|\r/g, '');
      expect(systemout).to.equal(systemOut);
    });
    describe('Testcases', ()=> {
      var testcases;
      before(() => {
        testcases = suites[1]['testcase'];
      });
      it('"case1" Name', () => {
        expect(testcases[0].$.name).to.equal('case1');
      });
      it('"case2" Name', () => {
        expect(testcases[1].$.name).to.equal('case2');
      });
      it('"case3" Name', () => {
        expect(testcases[2].$.name).to.equal('case3');
      });
      it('"case3" Failure Message', () => {
        expect(testcases[2].failure[0].$.message).to.equal("expected 1 to equal 2");
      });
      it('"case3" Failure Type', () => {
        expect(testcases[2].failure[0].$.type).to.equal("AssertionError");
      });
      it('"case3" Failure System-out', () => {
        var systemout = testcases[2]['system-out'][0];
        expect(systemout).to.equal('[[ATTACHMENT|'+screenshotFile+']]');
      });
    });
  });
});