import './index.scss';
import VueSelect from 'vue-select';
import { debounce } from 'debounce';
import { DEBOUNCE_WAIT } from '@/config/constants';

// @vue/component
export default {
    name: 'SelectSearch',
    props: {
        value: [String, Number],
        label: String,
        selectedItemLabel: String,
        formatOptions: { type: Function, required: true },
        fetchEntity: { type: String, required: true },
        fetchParams: Object,
    },
    data() {
        let currentValue = null;
        if (this.value) {
            currentValue = { value: this.value, label: this.selectedItemLabel || '??' };
        }

        return {
            options: [],
            currentValue,
            error: null,
            minSearchCharacters: 2,
        };
    },
    methods: {
        handleSearch(searchTerm, loading) {
            if (searchTerm.length < this.minSearchCharacters) {
                return;
            }
            this.search(loading, searchTerm);
        },

        // - On a besoin du 'this', donc obligé d'utiliser une fonction non fléchée
        // eslint-disable-next-line func-names
        search: debounce(async function (loading, search) {
            this.error = null;
            loading(true);

            const { fetchParams = {}, $http, fetchEntity, formatOptions } = this;

            try {
                const params = { ...fetchParams, search, limit: 10 };
                const response = await $http.get(fetchEntity, { params });
                const { data } = response;
                this.options = formatOptions(data.data);
            } catch (error) {
                this.error = error.message;
            } finally {
                loading(false);
            }
        }, DEBOUNCE_WAIT),

        handleChange(newItem) {
            const { value } = newItem || { value: null };
            this.$emit('input', value);
        },
    },
    render() {
        const { $t: __, label, options, handleSearch, handleChange, error } = this;

        return (
            <div class="SelectSearch">
                {label && <label class="SelectSearch__label">{__(label)}</label>}
                <VueSelect
                    v-model={this.currentValue}
                    filterable={false}
                    options={options}
                    onSearch={handleSearch}
                    placeholder={__('start-typing-to-search')}
                    onInput={handleChange}
                >
                    <p slot="no-options">{__('no-result-found-try-another-search')}</p>
                </VueSelect>
                {error && <div class="SelectSearch__error">{error}</div>}
            </div>
        );
    },
};
