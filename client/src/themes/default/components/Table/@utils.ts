export type ColumnsDisplay = Record<string, boolean>;

const STORAGE_KEY_PREFIX = 'vuetables_';

const getStoredState = (tableName: string): Record<string, any> | null => {
    const storedTableState = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tableName}`);
    if (!storedTableState) {
        return null;
    }

    let tableState;
    try {
        tableState = JSON.parse(storedTableState);
    } catch {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${tableName}`);
        return null;
    }

    return tableState ?? null;
};

export const getLegacySavedSearch = (tableName: string): string | null => {
    const tableState = getStoredState(tableName);
    return tableState?.query || null;
};

const getSavedColumnsDisplay = (tableName: string, columns: ColumnsDisplay): ColumnsDisplay => {
    const tableState = getStoredState(tableName);
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

export const initColumnsDisplay = (tableName: string | undefined, columns: ColumnsDisplay): string[] => (
    Object
        .entries((
            tableName !== undefined
                ? getSavedColumnsDisplay(tableName, columns)
                : columns
        ))
        .filter(([, visible]: [string, boolean]) => visible)
        .map(([name]: [string, boolean]) => name)
);
