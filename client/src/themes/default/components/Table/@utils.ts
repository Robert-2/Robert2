import type { ColumnsVisibility } from 'vue-tables-2-premium';

export type ColumnsDisplay = Record<string, boolean>;

const STORAGE_KEY_PREFIX = 'vuetables_';

const initFromStorage = (tableName: string, columns: ColumnsDisplay): ColumnsDisplay => {
    const storedTableState = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tableName}`);
    if (!storedTableState) {
        return columns;
    }

    let tableState;
    try {
        tableState = JSON.parse(storedTableState);
    } catch {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${tableName}`);
        return columns;
    }

    if (!tableState) {
        return columns;
    }

    const { userColumnsDisplay } = tableState;
    if (!userColumnsDisplay) {
        return columns;
    }

    return Object.fromEntries(
        Object.keys(columns).map((column: string) => (
            [column, userColumnsDisplay.includes(column)]
        )),
    );
};

export const initColumnsDisplay = (tableName: string | undefined, columns: ColumnsDisplay): ColumnsVisibility => (
    Object.fromEntries(
        Object
            .entries((
                tableName !== undefined
                    ? initFromStorage(tableName, columns)
                    : columns
            ))
            .map(([name, visible]: [string, boolean]) => (
                [name, `${visible ? 'min' : 'max'}_mobileP`]
            )),
    )
);
