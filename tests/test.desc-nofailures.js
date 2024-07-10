const expect = require("chai").expect;
const parseString = require('xml2js').parseString;
const path = require('path');
const fs = require('fs');
const helpers = require('./test_helper');


/**
 * Setting
 */
const testName = path.basename(__filename);
const testDataName = testName.replace('test.', 'data.').replace('.js', '.cy.js');

/**
 * Derived settings
 */
const testFile = path.join('cypress', 'e2e', testDataName);
const resultsFile = path.join('results', testFile)+'.xml';

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
      expect(cySuite.failures).to.equal('0');
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
      expect(suites[1].$.file).to.equal(helpers.normalizePath(testFile));
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
      expect(suites[1].$.file).to.equal(helpers.normalizePath(testFile));
    });
    it('System-out', () => {
      var systemout = suites[1]['system-out'][0];
      expect(systemout).to.equal('');
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
    });
  });
});