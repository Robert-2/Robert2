declare module 'vue-table-2' {
    import type { PaginationParams } from '@/globals/types/pagination';

    export type ServerTableOptions<TData> = {
        headings: Record<string, string>,
        initialPage: number,
        orderBy: { column: string, ascending: boolean },
        sortable?: string[],
        columnsDropdown?: boolean,
        preserveState?: boolean,
        columnsDisplay?: Record<string, 'mobile' | 'desktop'>,
        columnsClasses?: Record<string, string>,
        requestFunction?(pagination: PaginationParams): Promise<{ data: TData } | undefined>,
    };

    export type ServerTableInstance = {
        refresh(): void,
    };

    export type TableRow<T> = {
        row: T,
        column: string,
        index: number,
    };
}
