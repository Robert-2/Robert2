export type PaginatedData<T> = {
    data: T,
    pagination: {
        perPage: number,
        currentPage: number,
        total: {
            items: number,
            pages: number,
        },
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
