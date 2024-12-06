import Currency from '@/utils/currency';

describe('Utils / Currency', () => {
    it('should throw an error if the currency is unknown', () => {
        expect(() => new Currency('UNK')).toThrow('Unknown currency: "UNK".');
        expect(() => new Currency('EUR')).not.toThrow();
    });

    describe('name', () => {
        it('should return the currency readable name', () => {
            expect((new Currency('EUR')).name).toEqual('Euro');
            expect((new Currency('CHF')).name).toEqual('Franc Suisse');
        });
    });

    describe('symbol', () => {
        it('should return the currency symbol', () => {
            expect((new Currency('EUR')).symbol).toEqual('€');
            expect((new Currency('CHF')).symbol).toEqual('CHF');
            expect((new Currency('USD')).symbol).toEqual('$');
        });
    });

    describe('code', () => {
        it('should return the currency code', () => {
            expect((new Currency('EUR')).code).toEqual('EUR');
            expect((new Currency('USD')).code).toEqual('USD');
        });
    });
});
