import '../index.scss';
import clsx from 'clsx';
import generateUniqueId from 'lodash/uniqueId';
import { defineComponent } from '@vue/composition-api';
import config from '@/globals/config';
import { initColumnsDisplay } from '../@utils';
import { Variant } from '../@constants';

import type { ClassValue } from 'clsx';
import type { CreateElement } from 'vue';
import type { PropType } from '@vue/composition-api';
import type { Column, Columns } from './_types';
import type { ColumnsDisplay } from '../@utils';
import type {
    RequestFunction,
    ColumnsVisibility,
    ServerTableOptions,
    ServerTableInstance,
    RowClickEventPayload,
} from 'vue-tables-2-premium';
import type {
    OrderBy,
    RenderFunction,
    RenderedColumn,
} from '../@types';

export type Props<Datum = any, TColumns extends Columns<Datum> = Columns<Datum>> = {
    /**
     * Nom unique du tableau.
     *
     * Si cette prop. est passée, l'état du tableau sera persisté pour que
     * l'utilisateur puisse le récupérer dans le même état la prochaine fois.
     * (on parle ici des colonnes affichées, du tri, etc.)
     */
    name?: string | undefined,

    /**
     * Les colonnes du tableau.
     *
     * Cette prop. doit contenir un tableau d'objets, chaque objet
     * représentant une colonne avec les informations permettant
     * d'afficher son header, de formater son contenu, etc.
     *
     * Voir {@see {@link Column}} pour le format des données des colonnes.
     */
    columns: TColumns,

    /**
     * Le nom de la clé contenant l'identifiant unique de chaque
     * ligne dans le jeu de données.
     *
     * @default 'id'
     */
    uniqueKey?: string,

    /**
     * L'ordre dans lequel le tableau doit être triée initialement.
     *
     * Peut contenir:
     * - Soit un object avec la colonne et le sens dans lequel cette
     *   colonne doit être triée ({@see {@link OrderBy}}).
     * - Soit le nom de la colonne qui sera triée de façon ascendante.
     *
     * Si cette prop. n'est pas passée, le tableau conservera son tri initial.
     */
    defaultOrderBy?: OrderBy<TColumns> | OrderBy<TColumns>['column'],

    /**
     * La fonction permettant de récupérer le jeu de données.
     */
    fetcher: RequestFunction<Datum[]>,

    /**
     * Variante de la présentation du tableau.
     *
     * Valeur acceptées:
     * - `default`: Variante par défaut.
     * - `minimalist`: Présentation minimaliste, sans fond ni séparateurs.
     */
    variant?: Variant,

    /** Permet d'activer ou de désactiver le champ de filtrage du tableau. */
    filterable?: boolean,

    /**
     * Classe(s) qui seront ajoutées aux lignes du tableau.
     *
     * Différents formats sont acceptés:
     * - Les formats acceptés par défaut par Vue pour les classes.
     *   ({@see {@link ClassValue}})
     * - Une fonction a qui le jeu de données de chaque ligne sera passé
     *   et qui devra renvoyer des classes dans les formats acceptés par
     *   Vue (cf. ci-dessus).
     */
    rowClass?: ClassValue | ((row: Datum) => ClassValue),

    /**
     * Le nombre maximum d'enregistrements récupérables par page, pour
     * surcharger la valeur par défaut de la configuration.
     */
    perPage?: number,
};

type InstanceProperties = {
    uniqueId: string | undefined,
};

/**
 * Un tableau dont les données sont récupérées depuis
 * une source de données distante.
 *
 * Si vous avez déjà toutes les données en votre possession à
 * l'initialisation du tableau, utilisez plutôt `<ClientTable />`.
 */
const ServerTable = defineComponent({
    name: 'ServerTable',
    props: {
        name: {
            type: String as PropType<Props['name']>,
            default: undefined,
        },
        columns: {
            type: Array as PropType<Props['columns']>,
            required: true,
        },
        uniqueKey: {
            type: String as PropType<Required<Props>['uniqueKey']>,
            default: 'id',
        },
        fetcher: {
            type: Function as PropType<Props['fetcher']>,
            required: true,
        },
        variant: {
            type: String as PropType<Required<Props>['variant']>,
            default: Variant.DEFAULT,
            validator: (value: unknown) => (
                typeof value === 'string' &&
                Object.values(Variant).includes(value as any)
            ),
        },
        filterable: {
            type: Boolean as PropType<Required<Props>['filterable']>,
            default: true,
        },
        defaultOrderBy: {
            type: [Object, String] as PropType<Props['defaultOrderBy']>,
            default: undefined,
        },
        rowClass: {
            type: [
                String,
                Number,
                Array,
                Boolean,
                Object,
                Function,
            ] as PropType<Props['rowClass']>,
            default: undefined,
        },
        perPage: {
            type: Number as PropType<Props['perPage']>,
            default: undefined,
        },
    },
    emits: ['rowClick'],
    setup: (): InstanceProperties => ({
        uniqueId: undefined,
    }),
    computed: {
        columnsKeys(): Array<Column['key']> {
            return this.columns.map(({ key }: Column) => key);
        },

        columnsRenders(): Record<Column['key'], RenderFunction> {
            return this.columns.reduce(
                (acc: Record<Column['key'], RenderFunction>, column: Column) => {
                    const rawRenderColumn = column.render;
                    if (undefined === rawRenderColumn) {
                        return acc;
                    }

                    return {
                        ...acc,
                        [column.key]: (h: CreateElement, row: any, index: number): RenderedColumn => {
                            const renderedColumn = rawRenderColumn(h, row, index);

                            return column.key === 'actions'
                                ? <div class="Table__cell__actions">{renderedColumn}</div>
                                : renderedColumn;
                        },
                    };
                },
                {},
            );
        },

        columnsHeadings(): Record<Column['key'], string> {
            return this.columns.reduce(
                (acc: Record<Column['key'], string>, { key, title }: Column) => (
                    { ...acc, [key]: title }
                ),
                {},
            );
        },

        columnsClasses(): Record<Column['key'], string> {
            return this.columns.reduce(
                (acc: Record<Column['key'], string>, column: Column) => {
                    const columnClass = ['Table__cell', {
                        'Table__cell--actions': column.key === 'actions',
                    }];
                    return { ...acc, [column.key]: `${clsx(columnClass, column.class)} ` };
                },
                {},
            );
        },

        columnsSortable(): Array<Column['key']> {
            return this.columns
                .filter(({ sortable }: Column) => sortable)
                .map(({ key }: Column) => key);
        },

        columnsDisplay(): ColumnsVisibility {
            const columnsDisplay = this.columns.reduce(
                (acc: ColumnsDisplay, column: Column) => {
                    const visible = !(column.hidden ?? false);
                    return { ...acc, [column.key]: visible };
                },
                {},
            );
            return initColumnsDisplay(this.name, columnsDisplay);
        },

        shouldPersistState(): boolean {
            return this.name !== undefined;
        },

        withColumnsSelectorInferred(): boolean {
            const { shouldPersistState } = this;
            return shouldPersistState;
        },

        options(): ServerTableOptions {
            const {
                fetcher,
                uniqueKey,
                rowClass,
                filterable,
                defaultOrderBy,
                columnsHeadings,
                columnsClasses,
                columnsDisplay,
                columnsSortable,
                columnsRenders,
                shouldPersistState,
                withColumnsSelectorInferred: withColumnsSelector,
                perPage = config.defaultPaginationLimit,
            } = this;

            const options: ServerTableOptions = {
                uniqueKey,
                columnsDropdown: withColumnsSelector,
                preserveState: shouldPersistState,
                saveState: shouldPersistState,
                sortable: columnsSortable,
                headings: columnsHeadings,
                templates: columnsRenders,
                filterByColumn: false,
                filterable,
                columnsDisplay,
                columnsClasses,
                requestFunction: fetcher,
                perPage: perPage ?? config.defaultPaginationLimit,
                rowClassCallback: (row: any): ClassValue => (
                    clsx('Table__row', typeof rowClass === 'function' ? rowClass(row) : rowClass)
                ),
            };

            if (defaultOrderBy !== undefined) {
                options.orderBy = typeof defaultOrderBy === 'string'
                    ? { column: defaultOrderBy, ascending: true }
                    : {
                        column: defaultOrderBy.column,
                        ascending: defaultOrderBy.ascending ?? true,
                    };
            }

            return options;
        },
    },
    created() {
        const { $options } = this;

        this.uniqueId = generateUniqueId(`${$options.name!}-`);
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleRowClick({ row, event: e }: RowClickEventPayload) {
            if (e.type === 'dblclick') {
                return;
            }

            let currentElement: HTMLElement | null = e.target as HTMLElement;
            while (currentElement && currentElement !== document.body) {
                const { nodeName } = currentElement;
                if (['A', 'BUTTON'].includes(nodeName)) {
                    return;
                }
                currentElement = currentElement.parentElement;
            }

            this.$emit('rowClick', row);
        },

        // ------------------------------------------------------
        // -
        // -    API Publique
        // -
        // ------------------------------------------------------

        /**
         * Permet de changer la page courante du tableau (dans le cas ou celui-ci est paginé).
         *
         * @param number - Le numéro de la page à afficher.
         */
        setPage(number: number): void {
            const $table = this.$refs.table as ServerTableInstance | undefined;
            $table?.setPage(number);
        },

        /**
         * Permet d'actualiser les données du tableau via une requête serveur.
         */
        refresh(): void {
            const $table = this.$refs.table as ServerTableInstance | undefined;
            $table?.refresh();
        },
    },
    render() {
        const {
            name,
            uniqueId,
            variant,
            filterable,
            columnsKeys,
            options,
            handleRowClick,
            withColumnsSelectorInferred: withColumnsSelector,
        } = this;

        const className = ['Table', `Table--${variant}`, {
            'Table--static': !filterable && !withColumnsSelector,
        }];

        return (
            <v-server-table
                ref="table"
                class={className}
                key={name ?? uniqueId}
                name={name ?? uniqueId}
                columns={columnsKeys}
                options={options}
                onRow-click={handleRowClick}
            />
        );
    },
});

export { Variant };
export type { Columns, Column };
export default ServerTable;
