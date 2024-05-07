import './index.scss';
import { defineComponent } from '@vue/composition-api';
import VueSelect from 'vue-select';
import debounce from 'lodash/debounce';
import apiBeneficiaries from '@/stores/api/beneficiaries';
import formatOptions from '@/utils/formatOptions';
import { DEBOUNCE_WAIT_DURATION } from '@/globals/constants';
import Button from '@/themes/default/components/Button';
import Fragment from '@/components/Fragment';
import IconMessage from '@/themes/default/components/IconMessage';
import FormField from '@/themes/default/components/FormField';

import type { DebouncedMethod } from 'lodash';
import type { PropType } from '@vue/composition-api';
import type { Option, Options } from '@/utils/formatOptions';
import type { Beneficiary } from '@/stores/api/beneficiaries';

// - Longueur minimale du texte lors d'une recherche.
const MIN_SEARCH_CHARACTERS = 2;

type Props = {
    /**
     * Les bénéficiaires sélectionnés à l'affichage du champ.
     *
     * Note: Cette prop. ne permet PAS de contrôler le champ mais
     *       uniquement de fournir une liste de départ.
     */
    defaultValues?: Beneficiary[],
};

type InstanceProperties = {
    debouncedSearch: (
        | DebouncedMethod<typeof BeneficiariesSelect, 'search'>
        | undefined
    ),
};

type Data = {
    values: Beneficiary[],
    showNewItemForm: boolean,
    beneficiaries: Beneficiary[],
};

const getItemLabel = (beneficiary: Beneficiary): string => {
    const { full_name: fullName, reference, company } = beneficiary;

    let label = fullName;
    if (reference && reference.length > 0) {
        label += ` (${reference})`;
    }
    if (company && company.legal_name.length > 0) {
        label += ` − ${company.legal_name}`;
    }

    return label;
};

/** Champ de formulaire de sélection d'un ou plusieurs bénéficiaires */
const BeneficiariesSelect = defineComponent({
    name: 'BeneficiariesSelect',
    props: {
        defaultValues: {
            type: Array as PropType<Required<Props>['defaultValues']>,
            default: () => [],
        },
    },
    emits: ['change'],
    setup: (): InstanceProperties => ({
        debouncedSearch: undefined,
    }),
    data(): Data {
        return {
            values: [...this.defaultValues],
            beneficiaries: [],
            showNewItemForm: false,
        };
    },
    computed: {
        valuesIds(): Array<Beneficiary['id']> {
            return this.values.map((beneficiary: Beneficiary) => beneficiary.id);
        },

        options(): Options<Beneficiary> {
            return formatOptions(
                this.beneficiaries.filter(({ id }: Beneficiary) => (
                    !this.valuesIds.includes(id)
                )),
                (beneficiary: Beneficiary) => getItemLabel(beneficiary),
            );
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

        handleAddItem() {
            this.showNewItemForm = true;
        },

        handleCancelAddItem() {
            this.showNewItemForm = false;
        },

        handleRemoveItem(e: MouseEvent, id: Beneficiary['id']) {
            e.preventDefault();

            this.values = this.values.filter((value: Beneficiary) => value.id !== id);
            this.$emit('change', this.valuesIds);
        },

        handleSelectNewValue(newValue: Option<Beneficiary> | null) {
            const selectedValue = newValue !== null
                ? this.beneficiaries.find(
                    ({ id }: Beneficiary) => id === newValue.value,
                )
                : undefined;

            if (selectedValue === undefined) {
                return;
            }

            this.values.push(selectedValue);
            this.$emit('change', this.valuesIds);
            this.showNewItemForm = false;
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async search(search: string, setLoading: (isLoading: boolean) => void) {
            try {
                const { data } = await apiBeneficiaries.all({ search, limit: 20 });
                this.beneficiaries = data;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Error while searching a beneficiary (term: "${search}").`, error);
            } finally {
                setLoading(false);
            }
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `page.event-edit.steps.beneficiaries.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            values,
            options,
            showNewItemForm,
            handleSearch,
            handleAddItem,
            handleRemoveItem,
            handleSelectNewValue,
            handleCancelAddItem,
        } = this;

        const classNames = ['BeneficiariesSelect', {
            'BeneficiariesSelect--empty': values.length === 0 && !showNewItemForm,
        }];

        return (
            <div class={classNames}>
                {values.map((value: Beneficiary, index: number) => (
                    <FormField
                        key={value.id || `unknown-${index}`}
                        label={__('numbered-label', { number: index + 1 })}
                        type="custom"
                    >
                        <div class="BeneficiariesSelect__item">
                            <div class="BeneficiariesSelect__item__value">
                                {!value && (
                                    <IconMessage
                                        name="exclamation-triangle"
                                        class="BeneficiariesSelect__item__value__error"
                                        message={__('beneficiary-not-found')}
                                    />
                                )}
                                {value && <span>{getItemLabel(value)}</span>}
                            </div>
                            <Button
                                type="trash"
                                class="BeneficiariesSelect__item__action"
                                aria-label={__('remove-beneficiary')}
                                onClick={(e: MouseEvent) => { handleRemoveItem(e, value.id); }}
                            />
                        </div>
                    </FormField>
                ))}
                {showNewItemForm && (
                    <FormField
                        label={__('numbered-label', { number: values.length + 1 })}
                        type="custom"
                    >
                        <div class="BeneficiariesSelect__item">
                            <VueSelect
                                value={null}
                                filterable={false}
                                options={options}
                                onSearch={handleSearch}
                                onInput={handleSelectNewValue}
                                class="BeneficiariesSelect__item__field"
                                placeholder={__('global.please-choose')}
                                scopedSlots={{
                                    'no-options': ({ search }: { search: string }) => {
                                        if (search.length === 0) {
                                            return __('global.start-typing-to-search');
                                        }

                                        if (search.length > 0 && search.length < MIN_SEARCH_CHARACTERS) {
                                            return __(
                                                'global.type-at-least-count-chars-to-search',
                                                { count: MIN_SEARCH_CHARACTERS - search.length },
                                                MIN_SEARCH_CHARACTERS - search.length,
                                            );
                                        }

                                        return (
                                            <Fragment>
                                                <p>{__('global.no-result-found-try-another-search')}</p>
                                                <Button type="add" to={{ name: 'add-beneficiary' }}>
                                                    {__('create-a-beneficiary')}
                                                </Button>
                                            </Fragment>
                                        );
                                    },
                                }}
                            />
                            <Button
                                icon="ban"
                                type="danger"
                                class="BeneficiariesSelect__item__action"
                                aria-label={__('cancel-add-beneficiary')}
                                onClick={handleCancelAddItem}
                            />
                        </div>
                    </FormField>
                )}
                <div class="BeneficiariesSelect__actions">
                    {!showNewItemForm && (
                        <Button type="add" onClick={handleAddItem}>
                            {__('add-beneficiary')}
                        </Button>
                    )}
                </div>
            </div>
        );
    },
});

export default BeneficiariesSelect;
