/* eslint-disable @typescript-eslint/naming-convention */

export type PaginatedData<T> = {
    data: T,
    pagination: {
        current_page: number,
        from: number,
        to: number,
        total: number,
        last_page: number,
        per_page: number,
        first_page_url: string,
        prev_page_url: string,
        next_page_url: string,
        last_page_url: string,
        path: string,
    },
};

export type PaginationParams = {
    page: number,
    limit?: number,
    orderBy?: string,
    ascending?: 0 | 1,
    search?: string,
    byColumn?: 0 | 1,
};

export type FormErrorDetail = Record<string, string[]>;

export type WithCount<T> = {
    count: number,
    data: T,
};
