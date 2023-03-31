/**
 *  Nested Describe
 */
describe('TEST2', () => {
  it('case1', () => { });
  it('case2', () => { });
  it('case3', () => { });
  describe('NESTED', () => {
    it('case1', () => { })
    it('case2', () => { })
    it('case3', () => {
      expect(1).to.equal(2);
    })
  })
})