import type { Event } from '@/stores/api/events';
import type { Park } from '@/stores/api/parks';
import type { User } from '@/stores/api/users';
import type { Category } from '@/stores/api/categories';
import type { Beneficiary } from '@/stores/api/beneficiaries';
import type { Subcategory } from '@/stores/api/subcategories';

//
// - Types
//

/* eslint-disable @typescript-eslint/naming-convention */
type BillMaterial = {
    id: number,
    name: string,
    reference: string,
    park_id: Park['id'] | null,
    category_id: Category['id'],
    sub_category_id: Subcategory['id'],
    rental_price: number,
    stock_quantity: number,
    out_of_order_quantity: number,
    replacement_price: number,
    is_hidden_on_bill: boolean,
    is_discountable: boolean,
};

export type Bill = {
    id: number,
    number: string,
    date: string,
    discount_rate: number | null,
    due_amount: number,
    event_id: Event['id'],
    beneficiary_id: Beneficiary['id'],
    materials: BillMaterial[],
    degressive_rate: number,
    vat_rate: number | null,
    replacement_amount: number,
    currency: string,
    user_id: User['id'] | null,
};
/* eslint-enable @typescript-eslint/naming-convention */
