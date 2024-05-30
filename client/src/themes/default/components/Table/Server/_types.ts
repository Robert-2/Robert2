import type { Merge } from 'type-fest';
import type { Column as CoreColumn } from '../@types';

export type Column<Datum = any> = Merge<CoreColumn<Datum>, {
    /** Le tri doit-il être activé sur cette colonne ? */
    sortable?: boolean,
}>;

export type Columns<Data> = Array<Column<Data>>;
