/* eslint-disable babel/camelcase */

import type { PersonWithEventPivot } from '@/stores/api/persons';
import type { MaterialWithPivot } from '@/stores/api/materials';
import type { Estimate } from '@/stores/api/estimates';
import type { Bill } from '@/stores/api/bills';
import type { User } from '@/stores/api/users';
import type { Moment } from 'moment';

//
// - Types
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
    beneficiaries: PersonWithEventPivot[],
    technicians: PersonWithEventPivot[],
    materials: MaterialWithPivot[],
    estimates: Estimate[],
    bills: Bill[],
    user_id: number | null,
    user: User | null,
    created_at: string,
    deleted_at: string,
    updated_at: string,
};

export type FormatedEvent = Event & {
    startDate: Moment,
    endDate: Moment,
    isCurrent: boolean,
    isPast: boolean,
    isConfirmed: boolean,
    isInventoryDone: boolean,
    isArchived: boolean,
    hasMissingMaterials: boolean,
    hasNotReturnedMaterials: boolean,
};

/* eslint-enable babel/camelcase */
