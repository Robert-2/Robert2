import './index.scss';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import { defineComponent } from '@vue/composition-api';
import config, { BillingMode } from '@/globals/config';
import apiAttributes, { AttributeEntity, AttributeType } from '@/stores/api/attributes';
import formatOptions from '@/utils/formatOptions';
import parseInteger from '@/utils/parseInteger';
import Fieldset from '@/themes/default/components/Fieldset';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';
import Decimal from 'decimal.js';

import type { ComponentRef } from 'vue';
import type { PropType } from '@vue/composition-api';
import type { Settings } from '@/stores/api/settings';
import type { Options } from '@/utils/formatOptions';
import type { Category, CategoryDetails } from '@/stores/api/categories';
import type { ParkSummary } from '@/stores/api/parks';
import type { Tax } from '@/stores/api/taxes';
import type { SubCategory } from '@/stores/api/subcategories';
import type { DegressiveRate } from '@/stores/api/degressive-rates';
import type {
    Attribute,
    AttributeDetails,
    AttributeWithValue,
} from '@/stores/api/attributes';
import type {
    MaterialDetails as Material,
    MaterialEdit as MaterialEditCore,
} from '@/stores/api/materials';

type Props = {
    /** Les données déjà sauvegardées du matériel (s'il existait déjà). */
    savedData?: Material | null,

    /** Permet d'indiquer que la sauvegarde est en cours. */
    isSaving?: boolean,

    /** Liste des erreurs de validation éventuelles. */
    errors?: Record<string, string>,
};

type MaterialEdit = (
    & Omit<MaterialEditCore, 'attributes'>
    & { attributes: Record<Attribute['id'], AttributeWithValue['value']> }
);

type Data = {
    data: MaterialEdit,
    criticalError: Error | null,
    allAttributes: AttributeDetails[],
};

const getDefaults = (
    savedData: Material | null,
    settings: Settings,
): MaterialEdit => {
    const BASE_DEFAULTS = {
        name: null,
        reference: null,
        description: null,
        park_id: null,
        category_id: null,
        sub_category_id: null,
        rental_price: null,
        degressive_rate_id: settings?.billing.defaultDegressiveRate ?? null,
        tax_id: settings?.billing.defaultTax ?? null,
        replacement_price: null,
        stock_quantity: 1,
        out_of_order_quantity: 0,
        is_hidden_on_bill: false,
        is_discountable: true,
        note: null,
        attributes: [],
    };

    return {
        ...BASE_DEFAULTS,
        ...pick(savedData ?? {}, Object.keys(BASE_DEFAULTS)),
        rental_price: savedData?.rental_price?.toString() ?? null,
        replacement_price: savedData?.replacement_price?.toString() ?? null,
        attributes: Object.fromEntries((savedData?.attributes ?? []).map(
            ({ id, value }: AttributeWithValue) => [id, value],
        )),
    };
};

/** Formulaire d'édition d'un matériel. */
const MaterialEditForm = defineComponent({
    name: 'MaterialEditForm',
    provide: {
        verticalForm: true,
    },
    props: {
        savedData: {
            type: Object as PropType<Required<Props>['savedData']>,
            default: null,
        },
        isSaving: {
            type: Boolean as PropType<Required<Props>['isSaving']>,
            default: false,
        },
        errors: {
            type: Object as PropType<Required<Props>['errors']>,
            default: null,
        },
    },
    emits: ['submit', 'cancel'],
    data(): Data {
        const settings: Settings = this.$store.state.settings;

        return {
            data: getDefaults(this.savedData, settings),
            criticalError: null,
            allAttributes: [],
        };
    },
    computed: {
        showBilling(): boolean {
            return config.billingMode !== BillingMode.NONE;
        },

        showSubCategories(): boolean {
            if (!this.data.category_id && this.data.category_id !== 0) {
                return false;
            }
            return this.subCategoriesOptions.length > 0;
        },

        isNew(): boolean {
            return this.savedData === null;
        },

        showParksSelector(): boolean {
            if (this.parksOptions.length !== 1) {
                return true;
            }

            const { park_id: parkId } = this.data;
            if (!parkId && parkId !== 0) {
                return false;
            }

            const firstParkId = [...this.parksOptions].at(0)!.value;
            return parseInteger(firstParkId)! !== parseInteger(parkId)!;
        },

        selectedCategory(): CategoryDetails | null {
            const { category_id: categoryId } = this.data;
            return categoryId || categoryId === 0
                ? this.$store.getters['categories/category'](categoryId)
                : null;
        },

        subCategoriesOptions(): Options<SubCategory> {
            const { selectedCategory } = this;
            if (!selectedCategory) {
                return [];
            }
            return formatOptions(selectedCategory.sub_categories);
        },

        parksOptions(): Options<ParkSummary> {
            return this.$store.getters['parks/options'];
        },

        categoriesOptions(): Options<Category> {
            return this.$store.getters['categories/options'];
        },

        degressiveRatesOptions(): Options<DegressiveRate> {
            return this.$store.getters['degressiveRates/options'];
        },

        taxesOptions(): Options<Tax> {
            return this.$store.getters['taxes/options'];
        },

        currentRentalPrice(): Decimal | null {
            return this.data.rental_price !== null
                ? new Decimal(this.data.rental_price)
                : null;
        },
    },
    watch: {
        criticalError(error: unknown) {
            if (error === null) {
                return;
            }
            throw error;
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('taxes/fetch');
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('degressiveRates/fetch');

        this.fetchAttributes();

        // - Focus sur le champ nom si création.
        if (this.isNew) {
            this.$nextTick(() => {
                const $inputName = this.$refs.inputName as ComponentRef<typeof FormField>;
                $inputName?.focus();
            });
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e: SubmitEvent) {
            e?.preventDefault();

            const rawData = cloneDeep(this.data);

            if (this.parksOptions.length === 1) {
                const firstParkId = [...this.parksOptions].at(0)?.value;
                if (firstParkId !== null && firstParkId !== undefined) {
                    rawData.park_id = !rawData.park_id && rawData.park_id !== 0
                        ? parseInteger(firstParkId)
                        : rawData.park_id;
                }
            }

            if (config.billingMode === BillingMode.NONE) {
                rawData.rental_price = null;
                rawData.tax_id = null;
            }

            const data: MaterialEditCore = {
                ...rawData,
                attributes: Object.entries(rawData.attributes)
                    .map(([id, value]: [string, AttributeWithValue['value']]) => (
                        { id: parseInt(id, 10), value }
                    )),
            };
            this.$emit('submit', data);
        },

        handleCancel() {
            this.$emit('cancel');
        },

        handleCategoryChange() {
            this.data.sub_category_id = null;

            this.fetchAttributes();
        },

        handleRentalPriceChange(newValue: string | null) {
            const value = newValue !== '' ? (newValue ?? null) : null;
            this.data.rental_price = value;

            const normalizedValue = value !== null ? new Decimal(value) : null;
            if (normalizedValue?.greaterThan(0) ?? false) {
                this.data.is_hidden_on_bill = false;
            }
        },

        handleAttributeChange(id: Attribute['id'], newValue: AttributeWithValue['value']) {
            this.$set(this.data.attributes, id, newValue);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchAttributes() {
            const categoryId: Category['id'] | 'none' = (
                this.data.category_id || this.data.category_id === 0
                    ? this.data.category_id
                    : null
            ) ?? 'none';

            try {
                this.allAttributes = await apiAttributes.all(categoryId, AttributeEntity.MATERIAL);

                // - Supprime les données d'attributs obsolètes dans les données du formulaire.
                Object.keys(this.data.attributes).forEach((id: string) => {
                    const stillExists = this.allAttributes
                        .some((attr: AttributeDetails) => attr.id === parseInt(id, 10));

                    if (!stillExists) {
                        this.$delete(this.data.attributes, id);
                    }
                });
            } catch {
                this.allAttributes = [];
                this.criticalError = new Error('Unable to retrieve the list of special attributes.');
            }
        },

        getAttributeInputType(attributeType: Attribute['type']) {
            switch (attributeType) {
                case AttributeType.INTEGER:
                case AttributeType.FLOAT: {
                    return 'number';
                }
                case AttributeType.BOOLEAN: {
                    return 'switch';
                }
                case AttributeType.DATE: {
                    return 'date';
                }
                case AttributeType.TEXT: {
                    return 'textarea';
                }
                default: {
                    return 'text';
                }
            }
        },

        getAttributeInputStep(attributeType: Attribute['type']) {
            switch (attributeType) {
                case AttributeType.INTEGER: {
                    return 1;
                }
                case AttributeType.FLOAT: {
                    return 0.001;
                }
                default: {
                    return undefined;
                }
            }
        },
    },
    render() {
        const {
            $t: __,
            data,
            errors,
            isSaving,
            criticalError,
            taxesOptions,
            parksOptions,
            categoriesOptions,
            subCategoriesOptions,
            degressiveRatesOptions,
            showParksSelector,
            showSubCategories,
            showBilling,
            allAttributes,
            currentRentalPrice,
            handleSubmit,
            handleCancel,
            handleCategoryChange,
            handleRentalPriceChange,
            handleAttributeChange,
            getAttributeInputType,
            getAttributeInputStep,
        } = this;

        if (criticalError !== null) {
            return null;
        }

        return (
            <form
                class="Form Form--fixed-actions MaterialEditForm"
                onSubmit={handleSubmit}
            >
                <Fieldset>
                    <FormField
                        ref="inputName"
                        label="name"
                        v-model={data.name}
                        error={errors?.name}
                        help={__('page.material-edit.help-name')}
                        required
                    />
                    <FormField
                        label="reference"
                        v-model={data.reference}
                        error={errors?.reference}
                        required
                    />
                    <div
                        class={['MaterialEditForm__category', {
                            'MaterialEditForm__category--with-sub-category': showSubCategories,
                        }]}
                    >
                        <FormField
                            label="category"
                            type="select"
                            class="MaterialEditForm__main-category"
                            options={categoriesOptions}
                            v-model={data.category_id}
                            error={errors?.category_id}
                            onChange={handleCategoryChange}
                        />
                        {showSubCategories && (
                            <FormField
                                label="sub-category"
                                type="select"
                                class="MaterialEditForm__sub-category"
                                options={subCategoriesOptions}
                                v-model={data.sub_category_id}
                                error={errors?.sub_category_id}
                            />
                        )}
                    </div>
                    <FormField
                        label="description"
                        type="textarea"
                        rows={5}
                        v-model={data.description}
                        error={errors?.description}
                    />
                </Fieldset>
                <Fieldset
                    title={__('stock-infos')}
                >
                    <div class="MaterialEditForm__park">
                        {showParksSelector && (
                            <FormField
                                label="park"
                                type="select"
                                class="MaterialEditForm__park-selector"
                                options={parksOptions}
                                v-model={data.park_id}
                                error={errors?.park_id}
                                placeholder
                                required
                            />
                        )}
                    </div>
                    <div class="MaterialEditForm__quantities">
                        <FormField
                            label="stock-quantity"
                            type="number"
                            step={1}
                            class="MaterialEditForm__stock-quantity"
                            v-model={data.stock_quantity}
                            error={errors?.stock_quantity}
                            required
                        />
                        <FormField
                            label="out-of-order-quantity"
                            type="number"
                            step={1}
                            class="MaterialEditForm__out-of-order-quantity"
                            v-model={data.out_of_order_quantity}
                            error={errors?.out_of_order_quantity}
                        />
                    </div>
                </Fieldset>
                {showBilling && (
                    <Fieldset title={__('billing-infos')}>
                        <div class="MaterialEditForm__billing">
                            <FormField
                                label="rental-price"
                                type="number"
                                addon={__('page.material-edit.currency-per-day', {
                                    currency: config.currency.symbol,
                                })}
                                class="MaterialEditForm__price"
                                error={errors?.rental_price}
                                onInput={handleRentalPriceChange}
                                value={data.rental_price}
                                required
                            />
                            <div class="MaterialEditForm__billing__switches">
                                <FormField
                                    label="discountable"
                                    type="switch"
                                    class="MaterialEditForm__billing__switches__item"
                                    v-model={data.is_discountable}
                                    error={errors?.is_discountable}
                                />
                                <FormField
                                    label="hidden-on-invoice"
                                    type="switch"
                                    class="MaterialEditForm__billing__switches__item"
                                    v-model={data.is_hidden_on_bill}
                                    error={errors?.is_hidden_on_bill}
                                    disabled={(
                                        (currentRentalPrice?.greaterThan(0) ?? false)
                                            ? __('price-must-be-zero')
                                            : false
                                    )}
                                />
                            </div>
                            <div class="MaterialEditForm__billing__parameters">
                                <FormField
                                    type="select"
                                    label={__('page.material-edit.fields.tax.label')}
                                    placeholder={__('page.material-edit.fields.tax.placeholder')}
                                    class="MaterialEditForm__billing__parameters__item"
                                    options={taxesOptions}
                                    v-model={data.tax_id}
                                    error={errors?.tax_id}
                                />
                                <FormField
                                    type="select"
                                    label={__('page.material-edit.fields.degressive-rate.label')}
                                    placeholder={__('page.material-edit.fields.degressive-rate.placeholder')}
                                    class="MaterialEditForm__billing__parameters__item"
                                    options={degressiveRatesOptions}
                                    v-model={data.degressive_rate_id}
                                    error={errors?.degressive_rate_id}
                                />
                            </div>
                        </div>
                    </Fieldset>
                )}
                <Fieldset
                    title={__('extra-infos')}
                    help={__('page.material-edit.fields-changes-depending-on-category')}
                >
                    <FormField
                        label="replacement-price"
                        type="number"
                        addon={config.currency.symbol}
                        class="MaterialEditForm__price"
                        v-model={data.replacement_price}
                        error={errors?.replacement_price}
                    />
                    {allAttributes.map((attribute: AttributeDetails) => (
                        <FormField
                            key={attribute.id}
                            label={attribute.name}
                            type={getAttributeInputType(attribute.type)}
                            step={getAttributeInputStep(attribute.type)}
                            addon={
                                attribute.type === AttributeType.INTEGER || attribute.type === AttributeType.FLOAT
                                    ? attribute.unit
                                    : undefined
                            }
                            value={data.attributes[attribute.id] ?? null}
                            onInput={(value: AttributeWithValue['value']) => {
                                handleAttributeChange(attribute.id, value);
                            }}
                        />
                    ))}
                    <FormField
                        label="notes"
                        type="textarea"
                        v-model={data.note}
                        error={errors?.note}
                    />
                </Fieldset>
                <section class="Form__actions">
                    <Button htmlType="submit" type="primary" icon="save" loading={isSaving}>
                        {isSaving ? __('saving') : __('save')}
                    </Button>
                    <Button icon="ban" onClick={handleCancel}>
                        {__('cancel')}
                    </Button>
                </section>
            </form>
        );
    },
});

export default MaterialEditForm;
