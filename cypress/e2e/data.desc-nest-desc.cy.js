/**
 *  Nested Describe
 */
describe('TEST1', () => {
  it('case1', () => { });
  it('case2', () => { });
  it('case3', () => { });
  describe('NEST', () => {
    it('case1', () => { });
    it('case2', () => { });
    it('case3', () => {
      expect(1).to.equal(2);
    });
  });
});