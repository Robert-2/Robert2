import type { ClassValue } from 'clsx';
import type { CreateElement } from 'vue';
import type { TemplateRenderFunction } from 'vue-tables-2-premium';

export type RenderedColumn = ReturnType<TemplateRenderFunction>;
export type RenderFunction<T = any> = (h: CreateElement, row: T, index: number) => RenderedColumn;

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
    title: string,

    /**
     * Une fonction permettant de customiser le rendu de la colonne.
     *
     * Si non spécifiée, la clé `key` sera utilisée pour récupérer la
     * valeur liée pour chaque élément du jeu de données et celui-ci
     * sera affiché tel quel.
     */
    render?: RenderFunction<Data>,

    /** Le tri doit-il être activé sur cette colonne ? */
    sortable?: boolean,

    /** Une ou plusieurs classes à ajouter à la colonne. */
    class?: ClassValue,

    /**
     * La colonne doit-elle être cachée par défaut ?
     *
     * NOTE: Si l'utilisateur décide de forcer l'affichage de
     * cette colonne, cette option ne sera pas prise en compte.
     */
    hidden?: boolean,
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
