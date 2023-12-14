import clsx from 'clsx';
import generateUniqueId from 'lodash/uniqueId';
import { defineComponent } from '@vue/composition-api';
import { initColumnsDisplay } from '../@utils';

import type { CreateElement, VNodeClass } from 'vue';
import type { PropType } from '@vue/composition-api';
import type { ColumnsDisplay } from '../@utils';
import type {
    Column,
    Columns,
    OrderBy,
    RenderFunction,
    RenderedColumn,
} from '../@types';
import type {
    RequestFunction,
    ColumnsVisibility,
    ServerTableOptions,
    ServerTableInstance,
    RowClickEventPayload,
} from 'vue-tables-2-premium';

export type Props<Data = any> = {
    /**
     * Nom unique du tableau.
     *
     * Si cette prop. est passée, l'état du tableau sera persisté pour que
     * l'utilisateur puisse le récupérer dans le même état la prochaine fois.
     * (on parle ici des colonnes affichées, du tri, etc.)
     */
    name?: string,

    /**
     * Les colonnes du tableau.
     *
     * Cette prop. doit contenir un tableau d'objets, chaque objet
     * représentant une colonne avec les informations permettant
     * d'afficher son header, de formater son contenu, etc.
     *
     * Voir {@see {@link Column}} pour le format des données des colonnes.
     */
    columns: Columns<Data>,

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
    defaultOrderBy?: OrderBy | OrderBy['column'],

    /**
     * La fonction permettant de récupérer le jeu de données.
     */
    fetcher: RequestFunction,

    /**
     * Classe(s) qui seront ajoutées aux lignes du tableau.
     *
     * Différents formats sont acceptés:
     * - Les formats acceptés par défaut par Vue pour les classes.
     *   ({@see {@link VNodeClass}})
     * - Une fonction a qui le jeu de données de chaque ligne sera passé
     *   et qui devra renvoyer des classes dans les formats acceptés par
     *   Vue (cf. ci-dessus).
     */
    rowClass?: VNodeClass | ((row: Data) => VNodeClass),
};

type InstanceProperties = {
    uniqueId: string | undefined,
};

/**
 * Un tableau dont les données sont récupérées depuis
 * une source de données distante.
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
        fetcher: {
            type: Function as PropType<Props['fetcher']>,
            required: true,
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
    },
    emit: ['rowClick'],
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
                        [column.key]: (h: CreateElement, row: any): RenderedColumn => (
                            rawRenderColumn(h, row)
                        ),
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
                    const columnClass = column.class;
                    return undefined !== columnClass
                        ? { ...acc, [column.key]: `${columnClass} ` }
                        : acc;
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

        options(): ServerTableOptions {
            const {
                name,
                fetcher,
                rowClass,
                defaultOrderBy,
                columnsHeadings,
                columnsClasses,
                columnsDisplay,
                columnsSortable,
                columnsRenders,
            } = this;

            const persistState = name !== undefined;
            const options: ServerTableOptions = {
                columnsDropdown: persistState,
                preserveState: persistState,
                saveState: persistState,
                sortable: columnsSortable,
                headings: columnsHeadings,
                templates: columnsRenders,
                columnsDisplay,
                columnsClasses,
                requestFunction: fetcher,
                rowClassCallback: (row: any): VNodeClass => (
                    clsx(typeof rowClass === 'function' ? rowClass(row) : rowClass)
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
            const { nodeName } = (e.target! as HTMLElement);
            if (['A', 'BUTTON'].includes(nodeName)) {
                return;
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
        const { name, uniqueId, columnsKeys, options, handleRowClick } = this;

        return (
            <v-server-table
                ref="table"
                key={name ?? uniqueId}
                name={name ?? uniqueId}
                class="Table"
                columns={columnsKeys}
                options={options}
                onRow-click={handleRowClick}
            />
        );
    },
});

export default ServerTable;
