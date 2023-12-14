declare module 'vue-tables-2-premium' {
    import type { CreateElement, VNode, VNodeClass } from 'vue';
    import type { PaginationParams } from '@/stores/api/@types';

    //
    // - Common types
    //

    type ColumnVisibility =
        | `${'min' | 'not' | 'max'}_mobile`
        | `${'min' | 'not' | 'max'}_mobileP`
        | `${'min' | 'not' | 'max'}_mobileL`
        | `${'min' | 'not' | 'max'}_tablet`
        | `${'min' | 'not' | 'max'}_tabletP`
        | `${'min' | 'not' | 'max'}_tabletL`
        | `${'min' | 'not' | 'max'}_desktop`
        | `${'min' | 'not' | 'max'}_desktopLarge`
        | `${'min' | 'not' | 'max'}_desktopHuge`;

    type ColumnsVisibility = Record<string, ColumnVisibility>;

    type TemplateRenderFunction<Data = any> = (
        (h: CreateElement, row: Data, index: number) => JSX.Element | string | null
    );

    type RowClickEventPayload<Data = any> = { row: Data, event: PointerEvent, index: number };

    type BaseTableOptions<Data> = {
        headings?: Record<string, string>,
        initialPage?: number,
        perPage?: number,
        orderBy?: { column: string, ascending: boolean },
        sortable?: string[],
        multiSorting?: Record<string, Array<{ column: string, matchDir: boolean }>>,
        filterByColumn?: boolean,
        columnsDropdown?: boolean,
        preserveState?: boolean,
        saveState?: boolean,
        columnsDisplay?: ColumnsVisibility,
        columnsClasses?: Record<string, string>,
        templates?: Record<string, TemplateRenderFunction<Data>>,
        rowClassCallback(row: Data): VNodeClass,
    };

    interface BaseTableInstance<Data> {
        name: string;
        columns: string[];
        data: Data[];
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
            table: BaseTableInstance<Data>,
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

    export type ClientCustomFilter<Data> = {
        name: string,
        callback(item: Data, identifier: number | string | boolean): boolean,
    };

    export type CustomSortFunction<Data> = (ascending: boolean) => (a: Data, b: Data) => number;

    export type ClientTableOptions<Data = any, Filters = any> = BaseTableOptions<Data> & {
        initFilters: Filters,
        customSorting?: Record<string, CustomSortFunction<Data>>,
        customFilters?: Array<ClientCustomFilter<Data>>,
    };

    export interface ClientTableInstance<Data = any> extends BaseTableInstance<Data> {
        filteredData: Data[];
        allFilteredData: Data[];
    }

    //
    // - Server component specific types
    //

    export type RequestFunction<Data = any> = (pagination: PaginationParams) => (
        Promise<{ data: Data } | undefined>
    );

    export type ServerTableOptions<Data = any> = BaseTableOptions<Data> & {
        customFilters?: string[],
        requestFunction?: RequestFunction<Data>,
    };

    export interface ServerTableInstance<Data = any> extends BaseTableInstance<Data> {
        setRequestParams(params: Record<string, unknown>): void;
        geData(): Data[];
        getQueryParams(): Record<string, unknown>;
    }
}
