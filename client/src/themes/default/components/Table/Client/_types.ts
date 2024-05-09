import type { Merge } from 'type-fest';
import type { Column as CoreColumn } from '../@types';
import type { ColumnSorter } from 'vue-tables-2-premium';

export type Column<Datum = any> = Merge<CoreColumn<Datum>, {
    /**
     * Fonction personnalisé de tri de la colonne.
     *
     * Cette fonction, à qui la direction de tri souhaité est passé (via `ascending`),
     * doit renvoyer une autre fonction qui s'occupera de comparer deux éléments de
     * la colonne et devra renvoyé si le premier élément (`a`) arrive avant (= `-1`) ou
     * après (= `1`) le deuxième (`b`) (ou s'ils sont égaux (= `0`)).
     *
     * Si non spécifié, le tri consistera en une simple comparaison des valeurs
     * (e.g si ascendant: `a > b ? 1 : -1`) en ayant au préalable mis les chaînes
     * de caractères en minuscules (si ce sont des chaînes qui sont comparés).
     */
    sorter?: ColumnSorter<Datum>,
}>;

export type Columns<Data> = Array<Column<Data>>;
