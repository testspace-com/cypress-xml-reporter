/**
 * Pending tests
 */
describe('TEST1', () => {
    it.skip('case1 - skipped', () => { });
    it('case2 - pending');
    it('case3 - pending');
    it('case4', () => { });
    it('case5', () => {
        expect(1).to.equal(2);
    });
});
