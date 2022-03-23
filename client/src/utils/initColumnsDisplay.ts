type ColumnsDisplay = Record<string, boolean>;
type VueTableColumnVisibility = 'min_mobileP' | 'max_mobileP';
type VueTableColumnsDisplay = Record<string, VueTableColumnVisibility>;

const getForVueTable = (columns: ColumnsDisplay): VueTableColumnsDisplay => {
    const vueTableColumnsDisplay: VueTableColumnsDisplay = {};
    Object.keys(columns).forEach((columnName: string): void => {
        const isVisible = columns[columnName] === true;
        vueTableColumnsDisplay[columnName] = isVisible ? 'min_mobileP' : 'max_mobileP';
    });
    return vueTableColumnsDisplay;
};

const initFromStorage = (tableName: string, columns: ColumnsDisplay): ColumnsDisplay => {
    const storedTableState = localStorage.getItem(`vuetables_${tableName}`);
    if (!storedTableState) {
        return columns;
    }

    const tableState = JSON.parse(storedTableState);
    if (!tableState) {
        return columns;
    }

    const { userColumnsDisplay } = tableState;
    if (!userColumnsDisplay) {
        return columns;
    }

    const columnsDisplay: ColumnsDisplay = {};
    Object.keys(columns).forEach((columnName: string): void => {
        columnsDisplay[columnName] = userColumnsDisplay.includes(columnName);
    });

    return columnsDisplay;
};

const initColumnsDisplay = (tableName: string, columns: ColumnsDisplay): VueTableColumnsDisplay => (
    getForVueTable(initFromStorage(tableName, columns))
);

export default initColumnsDisplay;
