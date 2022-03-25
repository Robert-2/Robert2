type ColumnsDisplay = Record<string, boolean>;
type VueTableColumnVisibility = 'min_mobileP' | 'max_mobileP';
type VueTableColumnsDisplay = Record<string, VueTableColumnVisibility>;

const STORAGE_KEY_PREFIX = 'vuetables_';

const initFromStorage = (tableName: string, columns: ColumnsDisplay): ColumnsDisplay => {
    const storedTableState = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tableName}`);
    if (!storedTableState) {
        return columns;
    }

    let tableState;
    try {
        tableState = JSON.parse(storedTableState);
    } catch (error) {
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
        Object.entries(columns).map(([column]: [string, boolean]) => (
            [column, userColumnsDisplay.includes(column)]
        )),
    );
};

const initColumnsDisplay = (tableName: string, columns: ColumnsDisplay): VueTableColumnsDisplay => (
    Object.fromEntries(
        Object.entries(initFromStorage(tableName, columns))
            .map(([name, value]: [string, boolean]) => (
                [name, `${value === true ? 'min' : 'max'}_mobileP`]
            )),
    )
);

export default initColumnsDisplay;
