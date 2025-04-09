import type { ClassValue } from 'clsx';
import type { CreateElement } from 'vue';

export type RenderFunction<T = any> = (h: CreateElement, row: T, index: number) => JSX.Node;

export type Column<Data = any> = {
    /**
     * L'identifiant unique de la colonne.
     *
     * Quand la colonne correspond à une clé du tableau de données,
     * cet clé devrait contenir le nom de cette même clé.
     */
    key: string,

    /**
     * Le titre de la colonne tel qu'affiché dans
     * le header du tableau.
     */
    title?: string,

    /**
     * Permet de customiser le nom utilisé pour la colonne,
     * notamment dans le sélecteur des colonnes.
     */
    label?: string,

    /**
     * Une fonction permettant de customiser le rendu de la colonne.
     *
     * Si non spécifiée, la clé `key` sera utilisée pour récupérer la
     * valeur liée pour chaque élément du jeu de données et celui-ci
     * sera affiché tel quel.
     */
    render?: RenderFunction<Data>,

    /** Une ou plusieurs classes à ajouter à la colonne. */
    class?: ClassValue,

    /**
     * La colonne peut-elle être cachée par l'utilisateur ?
     *
     * Si non spécifié, la valeur par défaut est généralement `true`.
     * Sauf pour les colonnes avec les clés `name` et `actions`, ou c'est `false` par défaut.
     */
    hideable?: boolean,

    /**
     * La colonne doit-elle être cachée par défaut ?
     *
     * Attention, une colonne marquée comme `hideable` à `false` (explicitement ou en
     * fonction de sa valeur par défaut) ne respectera pas la valeur de cette clé.
     *
     * À noter que cette valeur ne sera prise en compte que si l'utilisateur n'a pas
     * manifesté un choix explicite relatif à cette colonne, sans quoi c'est son avis
     * qui sera pris en compte (avis qui pourra être persisté si le tableau à un nom
     * (prop. `name`)).
     *
     * @default false
     */
    defaultHidden?: boolean,
};

export type Columns<Data = any> = Array<Column<Data>>;

export type OrderBy<T extends Columns = Columns> = {
    /** La clé de la colonne qui sera utilisée pour le tri. */
    column: T[number]['key'],

    /**
     * La colonne doit-elle être triée de façon ascendante (= `true`)
     * ou descendante (= `false`).
     */
    ascending?: boolean,
};
