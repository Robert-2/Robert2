import './index.scss';
import { defineComponent } from '@vue/composition-api';
import VueSelect from 'vue-select';
import debounce from 'lodash/debounce';
import { DEBOUNCE_WAIT_DURATION } from '@/globals/constants';
import formatOptions from '@/utils/formatOptions';
import Button from '@/themes/default/components/Button';
import Fragment from '@/components/Fragment';
import apiCompanies from '@/stores/api/companies';

import type { DebouncedMethod } from 'lodash';
import type { PropType } from '@vue/composition-api';
import type { Company } from '@/stores/api/companies';
import type { Option, Options } from '@/utils/formatOptions';

type Props = {
    /** La société sélectionnée par défaut. */
    defaultCompany?: Company | null,
};

type InstanceProperties = {
    debouncedSearch: (
        | DebouncedMethod<typeof BeneficiaryEditCompanySelect, 'search'>
        | undefined
    ),
};

type Data = {
    companies: Company[],
    value: Company['id'] | null,
};

/** Longueur minimale du texte lors d'une recherche de société. */
const MIN_SEARCH_CHARACTERS = 2;

/** Champ de formulaire de sélection d'une société. */
const BeneficiaryEditCompanySelect = defineComponent({
    name: 'BeneficiaryEditCompanySelect',
    props: {
        defaultCompany: {
            type: Object as PropType<Required<Props>['defaultCompany']>,
            default: null,
        },
    },
    emits: ['change'],
    setup: (): InstanceProperties => ({
        debouncedSearch: undefined,
    }),
    data(): Data {
        const { defaultCompany } = this;

        return {
            value: defaultCompany?.id ?? null,
            companies: defaultCompany ? [defaultCompany] : [],
        };
    },
    computed: {
        selected(): Option<Company> | null {
            const { options, value } = this;

            if (value === null) {
                return null;
            }

            const option = options.find((_option: Option<Company>) => (
                _option.value.toString() === value.toString()
            ));

            return option ?? null;
        },

        options(): Options<Company> {
            const formatLabel = (company: Company): string => (
                company.legal_name
            );
            return formatOptions<Company>(this.companies, formatLabel);
        },
    },
    created() {
        this.debouncedSearch = debounce(
            this.search.bind(this),
            DEBOUNCE_WAIT_DURATION.asMilliseconds(),
        );
    },
    beforeDestroy() {
        this.debouncedSearch?.cancel();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSearch(search: string, setLoading: (isLoading: boolean) => void) {
            if (search.length < MIN_SEARCH_CHARACTERS) {
                return;
            }
            setLoading(true);
            this.debouncedSearch!(search, setLoading);
        },

        handleChange(selection: Option<Company> | null) {
            const { value } = selection ?? { value: null };

            this.value = value;
            this.$emit('change', value);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async search(search: string, setLoading: (isLoading: boolean) => void) {
            try {
                const { data } = await apiCompanies.all({ search, limit: 20 });
                this.companies = data;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Error while searching a company (term: "${search}").`, error);
            } finally {
                setLoading(false);
            }
        },
    },
    render() {
        const {
            $t: __,
            selected,
            options,
            handleSearch,
            handleChange,
        } = this;

        return (
            <div class="BeneficiaryEditCompanySelect">
                <VueSelect
                    value={selected}
                    options={options}
                    filterable={false}
                    multiple={false}
                    onSearch={handleSearch}
                    onInput={handleChange}
                    placeholder={__('page.beneficiary-edit.type-to-search-company')}
                    class="BeneficiaryEditCompanySelect__select"
                    scopedSlots={{
                        'no-options': ({ search }: { search: string }) => {
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

                            return (
                                <Fragment>
                                    <p>{__('no-result-found-try-another-search')}</p>
                                    <Button type="add" to={{ name: 'add-company', query: { name: search } }}>
                                        {__('create-company')}
                                    </Button>
                                </Fragment>
                            );
                        },
                    }}
                />
                {!!selected?.value && (
                    <Button
                        class="BeneficiaryEditCompanySelect__edit-button"
                        icon="edit"
                        type="default"
                        to={{
                            name: 'edit-company',
                            params: { id: selected.value },
                        }}
                    >
                        {__('action-edit')}
                    </Button>
                )}
            </div>
        );
    },
});

export default BeneficiaryEditCompanySelect;
