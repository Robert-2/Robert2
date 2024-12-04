import type Decimal from 'decimal.js';
import type Currency from '@/utils/currency';
import type {
    MaterialBillingData,
    ExtraBillingData,
    BillingData,
} from '@/stores/api/bookings';

//
// - Raw billing data
//

export type RawMaterialBillingData = MaterialBillingData;

export type RawExtraBillingData = (
    & ExtraBillingData
    & { _id: number | string }
);

export type RawBillingData = (
    & Omit<BillingData, 'materials' | 'extras'>
    & {
        materials: RawMaterialBillingData[],
        extras: RawExtraBillingData[],
    }
);

//
// - Full billing data
//

export type PriceDetails = { amount: Decimal, currency: Currency };

/* eslint-disable @typescript-eslint/naming-convention */
export type Tax<
    PriceType extends PriceDetails | Decimal = PriceDetails | Decimal,
    IsRate extends boolean = boolean,
> = (
    IsRate extends true
        ? { name: string, is_rate: true, value: Decimal }
        : { name: string, is_rate: false, value: PriceType }
);
/* eslint-enable @typescript-eslint/naming-convention */

export type Taxes<T extends PriceDetails | Decimal = PriceDetails | Decimal> = Array<Tax<T>>;

export type TotalTax = Tax<Decimal> & { total: Decimal };

/* eslint-disable @typescript-eslint/naming-convention */
export type BillingMaterial = (
    & Omit<RawMaterialBillingData, 'unit_price'>
    & {
        name: UnsyncedDataValue<string>,
        reference: UnsyncedDataValue<string>,
        quantity: number,
        is_discountable: boolean,
        is_unsynced: boolean,
        is_resyncable: boolean,
        unit_price: UnsyncedDataValue<PriceDetails, Decimal>,
        degressive_rate: UnsyncedDataValue<Decimal>,
        unit_price_period: Decimal,
        total_without_discount: Decimal,
        total_discount: Decimal,
        total_without_taxes: Decimal,
        taxes: UnsyncedDataValue<Taxes<PriceDetails>, Taxes<Decimal>>,
    }
);
/* eslint-enable @typescript-eslint/naming-convention */

/* eslint-disable @typescript-eslint/naming-convention */
export type BillingExtra = (
    & Omit<RawExtraBillingData, 'taxes'>
    & {
        is_unsynced: boolean,
        is_resyncable: boolean,
        total_without_taxes: Decimal,
        taxes: UnsyncedDataValue<Taxes<PriceDetails>, Taxes<Decimal>>,
    }
);
/* eslint-enable @typescript-eslint/naming-convention */

//
// - Unsynced data
//

export type UnsyncedDataValue<Base, Current = Base> = {
    base: Base,
    current: Current,
    isUnsynced: boolean,
    isResyncable: boolean,
};
