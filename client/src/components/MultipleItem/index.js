import './index.scss';
import VueSelect from 'vue-select';
import { debounce } from 'debounce';
import { DEBOUNCE_WAIT } from '@/globals/constants';

// @vue/component
export default {
    name: 'MultipleItem',
    components: { VueSelect },
    props: {
        fetchEntity: String,
        fetchParams: Object,
        label: String,
        field: String,
        selectedItems: Array,
        createItemPath: String,
        formatOptions: Function,
        getItemLabel: Function,
        pivotField: String,
        pivotPlaceholder: String,
    },
    data() {
        const defaultItem = { value: null, label: this.$t('please-choose') };

        let itemsPivots = [];
        if (this.pivotField) {
            itemsPivots = this.selectedItems.map((item) => item.pivot[this.pivotField]);
        }

        return {
            itemsIds: this.selectedItems.map((item) => item.id),
            itemsPivots,
            notSavedSelectedItems: [...this.selectedItems],
            minSearchCharacters: 2,
            askNewItem: false,
            fieldOptions: [],
            newItem: defaultItem,
            defaultItem,
        };
    },
    computed: {
        selectableOptions() {
            return this.fieldOptions.filter((option) => !this.itemsIds.includes(option.value));
        },
        hasItems() {
            return this.itemsIds.length > 0 || this.askNewItem;
        },
    },
    methods: {
        handleSearch(searchTerm, loading) {
            if (searchTerm.length < this.minSearchCharacters) {
                return;
            }
            loading(true);
            this.search(loading, searchTerm);
        },

        // - We're not using arrow function here because we need access to 'this'
        // eslint-disable-next-line func-names
        search: debounce(function (loading, search) {
            const params = { ...this.fetchParams, search, limit: 10 };
            this.$http.get(this.fetchEntity, { params })
                .then(({ data }) => {
                    this.fieldOptions = this.formatOptions(data.data);
                })
                // eslint-disable-next-line no-console
                .catch(console.error)
                .finally(() => {
                    loading(false);
                });
        }, DEBOUNCE_WAIT),

        handlePivotChange(index, value) {
            this.itemsPivots[index] = value;
            this.$emit('pivotsUpdated', this.itemsPivots);
        },

        startAddItem(e) {
            e.preventDefault();
            this.askNewItem = true;
        },

        insertNewItem() {
            if (!this.newItem || !this.newItem.value) {
                return;
            }

            const { value, label } = this.newItem;
            this.itemsIds.push(value);
            this.notSavedSelectedItems.push({ id: value, label });

            this.askNewItem = false;
            this.newItem = this.defaultItem;

            this.$emit('itemsUpdated', this.itemsIds);
        },

        cancelNewItem(e) {
            e.preventDefault();
            this.askNewItem = false;
            this.newItem = this.defaultItem;
        },

        removeItem(id, index) {
            this.itemsIds = this.itemsIds.filter((_id) => _id !== id);
            this.notSavedSelectedItems = this.notSavedSelectedItems.filter(
                (item) => item.id !== id,
            );
            this.$emit('itemsUpdated', this.itemsIds);

            if (this.pivotField && this.itemsPivots.length > 0) {
                this.itemsPivots = this.itemsPivots.filter((_value, _index) => _index !== index);
                this.$emit('pivotsUpdated', this.itemsPivots);
            }
        },
    },
};
