declare module 'vue-tables-2' {
    import type { VNode } from 'vue';
    import type { PaginationParams } from '@/stores/api/@types.d';

    //
    // - Common types
    //

    type BaseTableOptions = {
        headings?: Record<string, string>,
        initialPage?: number,
        perPage?: number,
        orderBy?: { column: string, ascending: boolean },
        sortable?: string[],
        multiSorting?: Record<string, Array<{ column: string, matchDir: boolean }>>,
        filterByColumn?: boolean,
        columnsDropdown?: boolean,
        preserveState?: boolean,
        columnsDisplay?: Record<string, string>, // - Voir https://matanya.gitbook.io/vue-tables-2/columns-visibility
        columnsClasses?: Record<string, string>,
    };

    interface BaseTableInstance {
        name: string;
        columns: string[];
        data: Array<Record<string, unknown>>;
        filtersCount: number;
        openChildRows: number[];
        selectedRows: number[] | undefined;
        setPage(page: number): void;
        setLimit(recordsPerPage: number): void;
        setOrder(column: string, isAscending: boolean): void;
        setFilter(query: string | Record<string, string>): void;
        resetQuery(): void;
        refresh(): void;
        toggleChildRow(id: number): void;
        getOpenChildRows(limitToRows: number[] | null): VNode[];
        setCustomFilters(params: Record<string, unknown>): void;
        resetCustomFilters(): void;
        setLoadingState(): void;
        $refs: {
            table: BaseTableInstance,
        };
    }

    export type TableRow<T> = {
        row: T,
        column: string,
        index: number,
    };

    //
    // - Client component specific types
    //

    export type ClientCustomFilter<TData> = {
        name: string,
        callback(item: TData, identifier: number | string | boolean): boolean,
    };

    export type CustomSortFunction<TData> = (ascending: boolean) => (a: TData, b: TData) => number;

    export type ClientTableOptions<TData, TFilter> = BaseTableOptions & {
        initFilters: TFilter,
        customSorting?: Record<string, CustomSortFunction<TData>>,
        customFilters?: ClientCustomFilter[],
    };

    export interface ClientTableInstance extends BaseTableInstance {
        filteredData: Array<Record<string, unknown>>;
        allFilteredData: Array<Record<string, unknown>>;
    }

    //
    // - Server component specific types
    //

    export type RequestFunction<TData> = (pagination: PaginationParams) => Promise<{ data: TData } | undefined>;

    export type ServerTableOptions<TData> = BaseTableOptions & {
        customFilters?: string[],
        requestFunction?: RequestFunction<TData>,
    };

    export interface ServerTableInstance extends BaseTableInstance {
        setRequestParams(params: Record<string, unknown>): void;
        getData(): any;
        getQueryParams(): Record<string, unknown>;
    }
}
