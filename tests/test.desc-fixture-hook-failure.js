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
    fs.writeFileSync('results.json', JSON.stringify(results.testsuites, null, 2));
  });
});

describe(testName, () => {
  describe('Cypress Suite', () => {
    it('Name', () => {
      expect(cySuite.name).to.equal('Cypress Tests');
    });
    it.skip('Tests Count', () => {
      expect(cySuite.tests).to.equal('3');
    });
    it.skip('Failures Count', () => {
      expect(cySuite.failures).to.equal('1');
    });
    it.skip('Pending Count', () => {
      expect(cySuite.skipped).to.equal('2');
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
});