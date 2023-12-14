import moment from 'moment';
import requester from '@/globals/requester';
import { normalize as normalizeEstimate } from '@/stores/api/estimates';
import { normalize as normalizeInvoice } from '@/stores/api/invoices';

import type { MomentInput } from 'moment';
import type { Company } from '@/stores/api/companies';
import type { Country } from '@/stores/api/countries';
import type { User } from '@/stores/api/users';
import type { RawEstimate, Estimate } from '@/stores/api/estimates';
import type { RawInvoice, Invoice } from '@/stores/api/invoices';
import type { BookingSummary } from '@/stores/api/bookings';
import type {
    Direction,
    ListingParams,
    PaginatedData,
    PaginationParams,
} from './@types';

//
// - Types
//

export type BeneficiaryStats = {
    borrowings: number,
};

export type Beneficiary = {
    id: number,
    first_name: string,
    full_name: string,
    last_name: string,
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
    full_address: string | null,
    note: string | null,
    user_id: number | null,
    can_make_reservation: boolean,
    stats: BeneficiaryStats,
};

export type BeneficiaryDetails = Beneficiary & {
    user: User | null,
};

export type BeneficiaryEdit = {
    first_name: string,
    last_name: string,
    reference: string | null,
    email: string | null,
    phone: string | null,
    company_id: number | null,
    street: string | null,
    postal_code: string | null,
    locality: string | null,
    country_id: number | null,
    note: string | null,
};

type GetAllParams = ListingParams & {
    /**
     * Permet de ne récupérer que les bénéficiaires dans la "corbeille".
     *
     * @default false
     */
    deleted?: boolean,
};

type GetBookingsParams = PaginationParams & {
    /**
     * Date à partir de laquelle on veut la liste des bookings.
     * Inclura aussi les bookings qui ont commencés avant mais se terminent après cette date.
     *
     * @default undefined
     */
    after?: MomentInput,

    /**
     * Le sens dans lequel on veut récupérer les bookings :
     * - `Direction.ASC`: Du plus ancien au plus récent.
     * - `Direction.DESC`: Du plus récent au plus ancien.
     *
     * @default Direction.DESC
     */
    direction?: Direction,
};

//
// - Fonctions
//

const all = async (params: GetAllParams): Promise<PaginatedData<Beneficiary[]>> => (
    (await requester.get('/beneficiaries', { params })).data
);

const one = async (id: Beneficiary['id']): Promise<BeneficiaryDetails> => (
    (await requester.get(`/beneficiaries/${id}`)).data
);

const create = async (data: BeneficiaryEdit): Promise<BeneficiaryDetails> => (
    (await requester.post('/beneficiaries', data)).data
);

const update = async (id: Beneficiary['id'], data: BeneficiaryEdit): Promise<BeneficiaryDetails> => (
    (await requester.put(`/beneficiaries/${id}`, data)).data
);

const restore = async (id: Beneficiary['id']): Promise<BeneficiaryDetails> => (
    (await requester.put(`/beneficiaries/restore/${id}`)).data
);

const remove = async (id: Beneficiary['id']): Promise<void> => {
    await requester.delete(`/beneficiaries/${id}`);
};

const bookings = async (
    id: Beneficiary['id'],
    { after, ...otherParams }: GetBookingsParams = {},
): Promise<PaginatedData<BookingSummary[]>> => {
    const params: Record<string, any> = { ...otherParams };
    if (after !== undefined) {
        params.after = moment(after).format();
    }
    return (await requester.get(`/beneficiaries/${id}/bookings`, { params })).data;
};

const estimates = async (id: Beneficiary['id']): Promise<Estimate[]> => {
    const rawEstimates: RawEstimate[] = (await requester.get(`/beneficiaries/${id}/estimates`)).data;
    return rawEstimates.map(normalizeEstimate);
};

const invoices = async (id: Beneficiary['id']): Promise<Invoice[]> => {
    const rawInvoices: RawInvoice[] = (await requester.get(`/beneficiaries/${id}/invoices`)).data;
    return rawInvoices.map(normalizeInvoice);
};

export default {
    all,
    one,
    create,
    update,
    restore,
    remove,
    bookings,
    estimates,
    invoices,
};
