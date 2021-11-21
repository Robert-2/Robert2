/* eslint-disable camelcase */

import type { Country } from '@/stores/api/countries';
import type { Company } from '@/stores/api/companies';

//
// - Types
//

export type Person = {
    id: number,
    first_name: string,
    full_name: string,
    last_name: string,
    nickname: string | null,
    reference: string | null,
    email: string | null,
    phone: string | null,
    company_id: number | null,
    company: Company | null,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: number | null,
    country: Country | null,
    note: string | null,
    user_id: number | null,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
};

export type PersonWithEventPivot = Person & {
    pivot: { event_id: number, person_id: number },
};
