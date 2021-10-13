/* eslint-disable babel/camelcase */

//
// - types
//

export type Event = {
    id: number,
    title: string,
    start_date: string,
    end_date: string,
    location: string,
    reference: string,
    description: string,
    is_billable: boolean,
    is_confirmed: boolean,
    is_return_inventory_done: boolean,
    is_archived: boolean,
    has_missing_materials: boolean,
    has_not_returned_materials: boolean,
    beneficiaries: Array<Record<string, unknown>>,
    technicians: Array<Record<string, unknown>>,
    materials: Array<Record<string, unknown>>,
    estimates: Array<Record<string, unknown>>,
    bills: Array<Record<string, unknown>>,
    user_id: number,
    user: Record<string, unknown>,
    created_at: string,
    deleted_at: string,
    updated_at: string,
};

/* eslint-enable babel/camelcase */
