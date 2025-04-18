import './index.scss';
import isEqual from 'lodash/isEqual';
import { confirm } from '@/utils/alert';
import stringIncludes from '@/utils/stringIncludes';
import mergeDifference from '@/utils/mergeDifference';
import { defineComponent } from '@vue/composition-api';
import apiAttributes, { AttributeType } from '@/stores/api/attributes';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import ClientTable from '@/themes/default/components/Table/Client';
import Dropdown from '@/themes/default/components/Dropdown';
import Loading from '@/themes/default/components/Loading';
import Button from '@/themes/default/components/Button';
import FiltersPanel, { FiltersSchema } from './components/Filters';
import {
    persistFilters,
    getPersistedFilters,
    clearPersistedFilters,
} from '@/utils/filtersPersister';

import type { Filters } from './components/Filters';
import type { ComponentRef, CreateElement } from 'vue';
import type { Category } from '@/stores/api/categories';
import type { AttributeDetails as Attribute } from '@/stores/api/attributes';
import type { Columns } from '@/themes/default/components/Table/Client';
import type { Session } from '@/stores/api/session';

type Data = {
    filters: Filters,
    isDeleting: boolean,
    isFetched: boolean,
    hasCriticalError: boolean,
    attributes: Attribute[],
};

/** La clé utilisé pour la persistence des filtres de la page. */
const FILTERS_PERSISTENCE_KEY = 'Attributes--filters';

/** Page de listing des attributs de matériel. */
const Attributes = defineComponent({
    name: 'Attributes',
    data(): Data {
        const filters: Filters = {
            search: [],
        };

        // - Filtres sauvegardés.
        const session = this.$store.state.auth.user as Session;
        if (!session.disable_search_persistence) {
            const savedFilters = getPersistedFilters(FILTERS_PERSISTENCE_KEY, FiltersSchema);
            Object.assign(filters, savedFilters ?? {});
        } else {
            clearPersistedFilters(FILTERS_PERSISTENCE_KEY);
        }

        return {
            isDeleting: false,
            isFetched: false,
            hasCriticalError: false,
            attributes: [],
            filters,
        };
    },
    computed: {
        shouldPersistSearch(): boolean {
            const session = this.$store.state.auth.user as Session;
            return !session.disable_search_persistence;
        },

        filteredAttributes(): Attribute[] {
            const { filters, attributes } = this;

            // - Recherche textuelle.
            const search = filters.search.filter(
                (term: string) => term.trim().length > 1,
            );
            if (search.length === 0) {
                return attributes;
            }

            return this.attributes.filter((attribute: Attribute): boolean => (
                search.some((term: string) => stringIncludes(attribute.name, term))
            ));
        },

        columns(): Columns<Attribute> {
            const { $t: __, handleDeleteItemClick } = this;

            return [
                {
                    key: 'name',
                    title: __('page.attributes.name'),
                    sortable: true,
                    class: [
                        'Attributes__table__cell',
                        'Attributes__table__cell--name',
                    ],
                    render: (h: CreateElement, { name }: Attribute) => (
                        <div class="Attributes__item__name">
                            {name}
                        </div>
                    ),
                },
                {
                    key: 'type',
                    title: __('page.attributes.type'),
                    sortable: true,
                    class: [
                        'Attributes__table__cell',
                        'Attributes__table__cell--type',
                    ],
                    render: (h: CreateElement, { type }: Attribute) => (
                        __(`page.attributes.type-${type}`)
                    ),
                },
                {
                    key: 'unit',
                    title: __('page.attributes.unit'),
                    class: [
                        'Attributes__table__cell',
                        'Attributes__table__cell--unit',
                    ],
                    render: (h: CreateElement, attribute: Attribute) => (
                        attribute.type === AttributeType.INTEGER || attribute.type === AttributeType.FLOAT
                            ? attribute.unit
                            : null
                    ),
                },
                {
                    key: 'is-totalisable',
                    title: __('page.attributes.is-totalisable'),
                    class: [
                        'Attributes__table__cell',
                        'Attributes__table__cell--is-totalisable',
                    ],
                    render: (h: CreateElement, attribute: Attribute) => (
                        attribute.type === AttributeType.INTEGER || attribute.type === AttributeType.FLOAT
                            ? (attribute.is_totalisable ? __('yes') : __('no'))
                            : __('no')
                    ),
                },
                {
                    key: 'max-length',
                    title: __('page.attributes.max-length'),
                    class: [
                        'Attributes__table__cell',
                        'Attributes__table__cell--max-length',
                    ],
                    render: (h: CreateElement, attribute: Attribute) => {
                        if (attribute.type !== AttributeType.STRING) {
                            return null;
                        }

                        return ![undefined, null].includes(attribute.max_length as any)
                            ? __(
                                'count-chars',
                                { count: attribute.max_length!.toString() },
                                attribute.max_length!,
                            )
                            : __('page.attributes.no-limit');
                    },
                },
                {
                    key: 'categories',
                    title: __('page.attributes.limited-to-categories'),
                    class: [
                        'Attributes__table__cell',
                        'Attributes__table__cell--categories',
                    ],
                    render: (h: CreateElement, { categories }: Attribute) => (
                        <div
                            class={['Attributes__item__categories', {
                                'Attributes__item__categories--empty': categories.length === 0,
                            }]}
                        >
                            {(
                                categories.length > 0
                                    ? categories.map(({ name: _name }: Category) => _name).join(', ')
                                    : __('page.attributes.all-categories-not-limited')
                            )}
                        </div>
                    ),
                },
                {
                    key: 'actions',
                    class: [
                        'Attributes__table__cell',
                        'Attributes__table__cell--actions',
                    ],
                    render: (h: CreateElement, { id }: Attribute) => (
                        <Dropdown>
                            <Button
                                type="edit"
                                to={{ name: 'edit-attribute', params: { id } }}
                            >
                                {__('action-edit')}
                            </Button>
                            <Button
                                type="trash"
                                onClick={(e: MouseEvent) => {
                                    handleDeleteItemClick(e, id);
                                }}
                            >
                                {__('action-delete')}
                            </Button>
                        </Dropdown>
                    ),
                },
            ];
        },
    },
    watch: {
        filters: {
            handler() {
                // @ts-expect-error -- `this` fait bien référence au component.
                if (this.shouldPersistSearch) {
                    // @ts-expect-error -- `this` fait bien référence au component.
                    persistFilters(FILTERS_PERSISTENCE_KEY, this.filters);
                }
            },
            deep: true,
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleDeleteItemClick(e: MouseEvent, id: Attribute['id']) {
            e.stopPropagation();

            if (this.isDeleting) {
                return;
            }

            const { $t: __ } = this;

            // eslint-disable-next-line no-restricted-syntax
            for (const index of [1, 2]) {
                // eslint-disable-next-line no-await-in-loop
                const isConfirmed = await confirm({
                    type: 'danger',
                    text: __(`page.attributes.confirm-permanently-delete.${index}`),
                    confirmButtonText: __('yes-permanently-delete'),
                });
                if (!isConfirmed) {
                    return;
                }
            }

            this.isDeleting = true;
            try {
                await apiAttributes.remove(id);

                const index = this.attributes.findIndex(
                    ({ id: _id }: Attribute) => _id === id,
                );
                if (index === -1) {
                    this.fetchData();
                    return;
                }

                this.attributes.splice(index, 1);
                this.$toasted.success(__('page.materials.deleted'));
            } catch {
                this.$toasted.error(__('errors.unexpected-while-deleting'));
            } finally {
                this.isDeleting = false;
            }
        },

        handleConfigureColumns() {
            const $table = this.$refs.table as ComponentRef<typeof ClientTable>;
            $table?.showColumnsSelector();
        },

        handleFiltersChange(newFilters: Filters) {
            // - Recherche textuelle.
            const newSearch = mergeDifference(this.filters.search, newFilters.search);
            if (!isEqual(this.filters.search, newSearch)) {
                this.filters.search = newSearch;
            }
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            try {
                this.attributes = await apiAttributes.all();
                this.isFetched = true;
            } catch {
                this.hasCriticalError = true;
            }
        },
    },
    render() {
        const {
            $t: __,
            filters,
            columns,
            $options,
            isFetched,
            isDeleting,
            filteredAttributes,
            hasCriticalError,
            handleFiltersChange,
            handleConfigureColumns,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <Page name="attributes" title={__('page.attributes.title')} centered>
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                name="attributes"
                loading={isDeleting}
                title={__('page.attributes.title')}
                actions={[
                    <Button type="add" to={{ name: 'add-attribute' }} collapsible>
                        {__('page.attributes.add-btn')}
                    </Button>,
                    <Dropdown>
                        <Button icon="table" onClick={handleConfigureColumns}>
                            {__('configure-columns')}
                        </Button>
                    </Dropdown>,
                ]}
                scopedSlots={{
                    headerContent: (): JSX.Node => (
                        <FiltersPanel
                            values={filters}
                            onChange={handleFiltersChange}
                        />
                    ),
                }}
            >
                <div class="Attributes">
                    <ClientTable
                        ref="table"
                        name={$options.name}
                        class="Attributes__table"
                        columns={columns}
                        data={filteredAttributes}
                        defaultOrderBy="name"
                    />
                </div>
            </Page>
        );
    },
});

export default Attributes;
