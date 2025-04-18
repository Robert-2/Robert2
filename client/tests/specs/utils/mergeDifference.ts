import mergeDifference from '@/utils/mergeDifference';

describe('mergeDifference', () => {
    it('merge two array, keeping the a array order and removing entires missing in b array', () => {
        expect(mergeDifference([1, 2], [3])).toEqual([3]);
        expect(mergeDifference([1, 6, 2], [1, 7, 6])).toEqual([1, 6, 7]);
        expect(mergeDifference([1, 2, 3], [3, 2, 1])).toEqual([1, 2, 3]);
    });
});
