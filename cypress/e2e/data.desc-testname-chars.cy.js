/**
 * Describe only
*/
describe('"TESTNAME"/with slashes', () => {
  it.skip('case1', () => { });
  it('case2', () => { });
  it('"case3" / other chars', () => {
    expect(1).to.equal(2);
  });
});