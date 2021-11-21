/* eslint-disable @typescript-eslint/naming-convention */

import type { Country } from '@/stores/api/countries';

//
// - Types
//

export type Company = {
    id: number,
    legal_name: string,
    phone: string,
    street: string,
    postal_code: string,
    locality: string,
    country_id: number | null,
    country: Country | null,
    note: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
};
