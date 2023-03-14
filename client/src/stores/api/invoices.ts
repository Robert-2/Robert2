import Decimal from 'decimal.js';

//
// - Types
//

export type RawInvoice<DecimalType extends string | Decimal = string> = {
    id: number,
    number: string,
    date: string,
    url: string,
    discount_rate: DecimalType,
    total_without_taxes: DecimalType,
    total_with_taxes: DecimalType,
    currency: string,
};

export type Invoice = RawInvoice<Decimal>;

//
// - Normalizer
//

export const normalize = (invoice: RawInvoice): Invoice => ({
    ...invoice,
    discount_rate: new Decimal(invoice.discount_rate),
    total_without_taxes: new Decimal(invoice.total_without_taxes),
    total_with_taxes: new Decimal(invoice.total_with_taxes),
});
