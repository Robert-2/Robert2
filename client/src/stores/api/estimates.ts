import requester from '@/globals/requester';
import Decimal from 'decimal.js';

//
// - Types
//

export type RawEstimate<DecimalType extends string | Decimal = string> = {
    id: number,
    date: string,
    url: string,
    discount_rate: DecimalType,
    total_without_taxes: DecimalType,
    total_with_taxes: DecimalType,
    currency: string,
};

export type Estimate = RawEstimate<Decimal>;

//
// - Normalizer
//

export const normalize = (estimate: RawEstimate): Estimate => ({
    ...estimate,
    discount_rate: new Decimal(estimate.discount_rate),
    total_without_taxes: new Decimal(estimate.total_without_taxes),
    total_with_taxes: new Decimal(estimate.total_with_taxes),
});

//
// - Fonctions
//

const remove = async (id: Estimate['id']): Promise<void> => {
    await requester.delete(`/estimates/${id}`);
};

export default { remove };
