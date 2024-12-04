import Decimal from 'decimal.js';
import config from '@/globals/config';

import type Currency from '@/utils/currency';
import type { SourceMaterial } from '../_types';

export type RentalPrice<IsPeriodPrice extends boolean> =
    IsPeriodPrice extends false
        ? { rentalPrice: Decimal, currency: Currency }
        : {
            unitPrice: Decimal,
            degressiveRate: Decimal,
            rentalPrice: Decimal,
            currency: Currency,
        };

type RentalPriceData =
    | {
        isPeriodPrice: true,
        sync: RentalPrice<true>,
        override: RentalPrice<true> | null,
    }
    | {
        isPeriodPrice: false,
        sync: RentalPrice<false>,
        override: RentalPrice<false> | null,
    };

const getRentalPriceData = (material: SourceMaterial): RentalPriceData => {
    const usePeriodPrice = 'rental_price_period' in material;

    const rentalPriceSync = new Decimal(
        usePeriodPrice
            ? (material.rental_price_period ?? 0)
            : (material.rental_price ?? 0),
    );
    const rentalPriceOverride = (() => {
        if (material.overrides === null) {
            return null;
        }

        const value = usePeriodPrice
            ? material.overrides.rental_price_period
            : material.overrides.rental_price;

        return value !== null ? new Decimal(value ?? 0) : null;
    })();

    if (!usePeriodPrice) {
        return {
            isPeriodPrice: usePeriodPrice,
            sync: {
                rentalPrice: rentalPriceSync,
                currency: config.currency,
            },
            override: rentalPriceOverride === null ? null : {
                rentalPrice: rentalPriceOverride,
                currency: material.overrides!.currency,
            },
        };
    }

    return {
        isPeriodPrice: usePeriodPrice,
        sync: {
            unitPrice: new Decimal(material.rental_price ?? 0),
            degressiveRate: new Decimal(material.degressive_rate ?? 0),
            rentalPrice: rentalPriceSync,
            currency: config.currency,
        },
        override: rentalPriceOverride === null ? null : {
            unitPrice: new Decimal(material.overrides!.rental_price ?? 0),
            degressiveRate: new Decimal(material.overrides!.degressive_rate ?? 0),
            rentalPrice: rentalPriceOverride,
            currency: material.overrides!.currency,
        },
    };
};

export default getRentalPriceData;
