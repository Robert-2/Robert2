import formatAddress from '@/utils/formatAddress';

describe('formatAddress', () => {
    it('returns the full address as a string', () => {
        const result = formatAddress('5 rue des tests', '05000', 'Gap', { name: 'France' });
        expect(result).toEqual('5 rue des tests\n05000 Gap\nFrance');
    });

    it('returns first part of an address as a string', () => {
        const result = formatAddress('5 rue des tests', null, null, null);
        expect(result).toEqual('5 rue des tests');
    });

    it('returns second part of an address as a string', () => {
        const result = formatAddress(null, '05000', null, null);
        expect(result).toEqual('05000');
    });

    it('returns second part of an address as a string', () => {
        const result = formatAddress(null, null, 'Gap', null);
        expect(result).toEqual('Gap');
    });

    it('returns second part of an address as a string', () => {
        const result = formatAddress(null, '05000', 'Gap', null);
        expect(result).toEqual('05000 Gap');
    });

    it('returns second part of an address as a string', () => {
        const result = formatAddress('5 rue des tests', null, 'Gap', null);
        expect(result).toEqual('5 rue des tests\nGap');
    });

    it('returns third part of an address as a string', () => {
        const result = formatAddress(null, null, null, { name: 'France' });
        expect(result).toEqual('France');
    });

    it('returns first and third part of an address as a string', () => {
        const result = formatAddress('5 rue des tests', null, null, { name: 'France' });
        expect(result).toEqual('5 rue des tests\nFrance');
    });

    it('returns null when nothing given', () => {
        const result = formatAddress(null, null, null, null);
        expect(result).toEqual(null);
    });
});
