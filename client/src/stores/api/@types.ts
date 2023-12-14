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

export type WithCount<T> = {
    count: number,
    data: T,
};

// - Types liés aux imports

export type CsvDelimiter = ',' | ';' | ':' | `\t`;

export type CsvImport<Mapping extends Record<string, string | null>> = {
    mapping: Mapping,
    delimiter: CsvDelimiter,
    file: File,
};

export type CsvColumnError<Mapping extends Record<string, string | null>> = {
    field: keyof Mapping,
    value: string,
    error: string,
};

export type CsvImportError<Mapping extends Record<string, string | null>> = {
    line: number,
    message: string,
    errors: Array<CsvColumnError<Mapping>>,
};

export type CsvImportResults<Mapping extends Record<string, string | null>> = {
    total: number,
    success: number,
    errors: Array<CsvImportError<Mapping>>,
};
