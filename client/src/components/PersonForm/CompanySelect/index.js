import './index.scss';
import VueSelect from 'vue-select';
import { debounce } from 'debounce';
import { DEBOUNCE_WAIT } from '@/globals/constants';
import formatOptions from '@/utils/formatOptions';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';

// @vue/component
export default {
    name: 'CompanySelect',
    props: {
        defaultCompany: { type: Object, default: null },
    },
    data() {
        const hasDefaultValue = !!this.defaultCompany;
        const defaultItem = {
            value: this.defaultCompany?.id || null,
            label: this.defaultCompany?.legal_name || null,
        };

        return {
            selectedValue: hasDefaultValue ? defaultItem : null,
            companies: hasDefaultValue ? [defaultItem] : [],
            searchError: null,
        };
    },
    methods: {
        // - Ici on n'utilise pas une fonction fléchée, afin de pouvoir accéder à 'this'
        // eslint-disable-next-line func-names
        search: debounce(async function (loading, search) {
            try {
                this.searchError = null;
                const params = { search, limit: 10 };
                const { data } = await this.$http.get('companies', { params });
                this.companies = formatOptions(data.data, (item) => item.legal_name);
            } catch (error) {
                this.searchError = error;
            } finally {
                loading(false);
            }
        }, DEBOUNCE_WAIT),

        handleSearch(searchTerm, loading) {
            if (searchTerm.length < 2) {
                return;
            }
            loading(true);
            this.search(loading, searchTerm);
        },

        handleChange(selection) {
            this.selectedValue = selection;
            const { value } = selection || { value: null };
            this.$emit('change', value);
        },
    },
    render() {
        const {
            $t: __,
            selectedValue,
            companies,
            searchError,
            handleSearch,
            handleChange,
        } = this;

        return (
            <div class="CompanySelect">
                <VueSelect
                    options={companies}
                    value={selectedValue}
                    filterable={false}
                    multiple={false}
                    onSearch={handleSearch}
                    onInput={handleChange}
                    placeholder={__('page-beneficiary.type-to-search-company')}
                    class="CompanySelect__select"
                >
                    <div slot="no-options">
                        <p>{__('no-result-found-try-another-search')}</p>
                        <p>
                            <router-link to="/companies/new">
                                <i class="fas fa-plus" /> {__('page-companies.create-new')}
                            </router-link>
                        </p>
                    </div>
                </VueSelect>
                {selectedValue?.value && (
                    <router-link
                        to={`/companies/${selectedValue?.value}`}
                        class="CompanySelect__edit-btn"
                        custom
                    >
                        {({ navigate }) => (
                            <Button icon="edit" type="default" onClick={navigate}>
                                {__('action-edit')}
                            </Button>
                        )}
                    </router-link>
                )}
                {searchError && <ErrorMessage error={searchError} />}
            </div>
        );
    },
};
