/**
 *  Nested Describe
 */
describe('TEST1', () => {
  it('case1', () => { });
  it('case2', () => { });
  it('case3', () => {
    expect(1).to.equal(2);
  });
  describe('NEST1', () => {
    it('case1', () => { });
    it('case2', () => { });
    it('case3', () => {
      expect(1).to.equal(2);
    })
    describe('NEST2', () => {
      it('case1', () => { });
      it('case2', () => { });
      it('case3', () => {
        expect(1).to.equal(2);
      });
    });
  });
});