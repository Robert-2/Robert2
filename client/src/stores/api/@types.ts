//
// - Types liés à la pagination / tri.
//

/** Sens de tri. */
export enum Direction {
    /** Direction ascendante. */
    ASC = 'asc',

    /** Direction descendante. */
    DESC = 'desc',
}

export type SortableParams = {
    /** La colonne avec laquelle on veut trier le jeu de résultats. */
    orderBy?: string,

    /**
     * Le jeu de résultat doit-il être trié de manière ascendante selon la colonne choisie
     * ci-dessus (ou celle par défaut si aucun colonne n'a été explicitement choisie).
     *
     * - Si `1`, le jeu de résultat sera trié de manière ascendante.
     * - Si `0`, il sera trié de manière descendante.
     *
     */
    // TODO: Modifier ça pour quelque chose du genre : `{ direction: Direction }`.
    //       (il faudra adapter le component de tableau qui utilise cette notation obsolète).
    ascending?: 0 | 1,
};

export type PaginationParams = {
    /**
     * La page dont on veut récupérer le résultat.
     *
     * @default 1
     */
    page?: number,

    /** Le nombre de résultats par page que l'on souhaite récupérer. */
    limit?: number,
};

export type ListingParams = (
    & {
        /**
         * Permet de rechercher un terme en particulier.
         *
         * @default undefined
         */
        search?: string,
    }
    & SortableParams
    & PaginationParams
);

//
// - Types liés aux imports.
//

export type CsvDelimiter = ',' | ';' | ':' | `\t`;

export type CsvMapping = Record<string, string | null>;

export type CsvImport<T extends CsvMapping> = {
    mapping: T,
    file: File,
    delimiter: CsvDelimiter,
};

export type CsvColumnError<T extends CsvMapping = CsvMapping> = {
    field: keyof T | string,
    value: string | null,
    error: string,
};

export type CsvImportError<T extends CsvMapping = CsvMapping> = {
    line: number,
    message: string,
    errors: Array<CsvColumnError<T>>,
};

export type CsvImportResults<T extends CsvMapping = CsvMapping> = {
    total: number,
    success: number,
    errors: Array<CsvImportError<T>>,
};

//
// - Enveloppes.
//

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

export type CountedData<T> = {
    data: T,
    count: number,
};
