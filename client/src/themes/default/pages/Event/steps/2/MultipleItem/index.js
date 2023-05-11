import './index.scss';
import VueSelect from 'vue-select';
import debounce from 'lodash/debounce';
import formatOptions from '@/utils/formatOptions';
import { DEBOUNCE_WAIT } from '@/globals/constants';
import Button from '@/themes/default/components/Button';

// - Longueur minimale du texte lors d'une recherche.
const MIN_SEARCH_CHARACTERS = 2;

// @vue/component
export default {
    name: 'MultipleItem',
    props: {
        fetchEntity: { type: String, required: true },
        label: { type: String, required: true },
        createItemPath: { type: String, required: true },
        getItemLabel: { type: Function, required: true },
        selectedItems: { type: Array, default: () => [] },
    },
    data() {
        const { $t: __ } = this;

        const defaultItem = { value: null, label: __('please-choose') };

        return {
            data: [],
            selected: [...this.selectedItems],
            askNewItem: false,
            newItem: defaultItem,
            defaultItem,
        };
    },
    computed: {
        options() {
            return formatOptions(
                this.data.filter(({ id }) => !this.selectedIds.includes(id)),
                this.getItemLabel.bind(this),
            );
        },
        selectedIds() {
            return this.selected.map((item) => item.id);
        },
        hasItems() {
            return this.selected.length > 0 || this.askNewItem;
        },
    },
    created() {
        this.debouncedSearch = debounce(this.search.bind(this), DEBOUNCE_WAIT);
    },
    beforeDestroy() {
        this.debouncedSearch.cancel();
    },
    methods: {
        handleSearch(searchTerm, loading) {
            if (searchTerm.length < MIN_SEARCH_CHARACTERS) {
                return;
            }
            loading(true);
            this.debouncedSearch(loading, searchTerm);
        },

        search(loading, search) {
            this.$http.get(this.fetchEntity, { params: { search, limit: 10 } })
                .then(({ data }) => { this.data = data.data; })
                .catch(console.error) // eslint-disable-line no-console
                .finally(() => { loading(false); });
        },

        startAddItem() {
            this.askNewItem = true;
        },

        insertNewItem() {
            if (!this.newItem || !this.newItem.value) {
                this.newItem = this.defaultItem;
                return;
            }

            const selectedItem = this.data.find(({ id }) => id === this.newItem.value);
            if (undefined === selectedItem) {
                this.newItem = this.defaultItem;
                return;
            }

            this.selected.push(selectedItem);
            this.$emit('itemsUpdated', this.selectedIds);

            this.askNewItem = false;
            this.newItem = this.defaultItem;
        },

        cancelNewItem(e) {
            e.preventDefault();

            this.askNewItem = false;
            this.newItem = this.defaultItem;
        },

        removeItem(id) {
            this.selected = this.selected.filter(
                (selectedItem) => selectedItem.id !== id,
            );
            this.$emit('itemsUpdated', this.selectedIds);
        },
    },
    render() {
        const {
            $t: __,
            label,
            hasItems,
            options,
            selected,
            askNewItem,
            insertNewItem,
            startAddItem,
            cancelNewItem,
            removeItem,
            getItemLabel,
            createItemPath,
            handleSearch,
        } = this;

        const classNames = ['MultipleItem', {
            'MultipleItem--empty': !hasItems,
        }];

        return (
            <div class={classNames}>
                {selected.map((selectedItem, index) => (
                    <div key={selectedItem.id || `unknown-${index}`} class="MultipleItem__item FormField">
                        <label class="FormField__label">{label} {index + 1}</label>
                        <div class="MultipleItem__value-field">
                            {!selectedItem && (
                                <span class="MultipleItem__value-field--error">
                                    <i class="fas fa-exclamation-triangle" />&nbsp;
                                    {__('item-not-found', { item: label })}
                                </span>
                            )}
                            {selectedItem && <span>{getItemLabel(selectedItem)}</span>}
                        </div>
                        <button
                            type="button"
                            class="MultipleItem__item-action-btn button danger"
                            title={__('remove-item', { item: label })}
                            onClick={(e) => {
                                e.preventDefault();
                                removeItem(selectedItem.id);
                            }}
                        >
                            <i class="fas fa-trash-alt" />
                        </button>
                    </div>
                ))}
                {askNewItem && (
                    <div class="MultipleItem__item FormField">
                        <label class="FormField__label">{label} {selected.length + 1}</label>
                        <VueSelect
                            v-model={this.newItem}
                            filterable={false}
                            options={options}
                            onSearch={handleSearch}
                            onInput={insertNewItem}
                            scopedSlots={{
                                'no-options': ({ search }) => {
                                    if (search.length === 0) {
                                        return __('start-typing-to-search');
                                    }

                                    if (search.length > 0 && search.length < MIN_SEARCH_CHARACTERS) {
                                        return __(
                                            'type-at-least-count-chars-to-search',
                                            { count: MIN_SEARCH_CHARACTERS - search.length },
                                            MIN_SEARCH_CHARACTERS - search.length,
                                        );
                                    }

                                    if (search.length >= MIN_SEARCH_CHARACTERS) {
                                        return (
                                            <div>
                                                <p>{__('no-result-found-try-another-search')}</p>
                                                <router-link to={createItemPath} class="button success">
                                                    {__('create-select-item-label', { label })}
                                                </router-link>
                                            </div>
                                        );
                                    }

                                    return null;
                                },
                            }}
                        />
                        <button
                            type="button"
                            class="MultipleItem__item-action-btn button warning"
                            title={__('cancel-add-item', { item: label })}
                            onClick={cancelNewItem}
                        >
                            <i class="fas fa-ban" />
                        </button>
                    </div>
                )}
                <div class="MultipleItem__actions">
                    {!askNewItem && (
                        <Button type="add" onClick={startAddItem}>
                            {__('add-item', { item: label })}
                        </Button>
                    )}
                </div>
            </div>
        );
    },
};
