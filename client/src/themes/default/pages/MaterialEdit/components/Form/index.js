import './index.scss';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import { defineComponent } from '@vue/composition-api';
import config from '@/globals/config';
import apiAttributes from '@/stores/api/attributes';
import formatOptions from '@/utils/formatOptions';
import Fieldset from '@/themes/default/components/Fieldset';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';

const DEFAULT_VALUES = Object.freeze({
    name: '',
    reference: '',
    park_id: '',
    category_id: '',
    rental_price: '',
    stock_quantity: '1',
    description: '',
    sub_category_id: '',
    replacement_price: '',
    out_of_order_quantity: '0',
    note: '',
    is_hidden_on_bill: false,
    is_discountable: true,
    is_reservable: true,
    attributes: [],
});

// @vue/component
const MaterialEditForm = {
    name: 'MaterialEditForm',
    provide: {
        verticalForm: true,
    },
    props: {
        savedData: { type: Object, default: null },
        isSaving: { type: Boolean, default: false },
        errors: { type: Object, default: () => ({}) },
    },
    emits: ['submit', 'cancel'],
    data() {
        const data = {
            ...DEFAULT_VALUES,
            ...pick(this.savedData ?? {}, Object.keys(DEFAULT_VALUES)),
            attributes: (this.savedData?.attributes ?? []).reduce(
                (acc, { id, value }) => ({ ...acc, [id]: value }),
                {},
            ),
            approvers: (this.savedData?.approvers ?? []).map(({ id }) => id),
        };

        return {
            data,
            criticalError: null,
            extraAttributes: [],
        };
    },
    computed: {
        showBilling() {
            return config.billingMode !== 'none';
        },

        showSubCategories() {
            if (!this.data.category_id && this.data.category_id !== 0) {
                return false;
            }
            return this.subCategoriesOptions.length > 0;
        },

        showParksSelector() {
            if (this.parksOptions.length !== 1) {
                return true;
            }

            const { park_id: parkId } = this.data;
            if (!parkId && parkId !== 0) {
                return false;
            }

            const firstParkId = this.parksOptions.at(0).value;
            return firstParkId !== parseInt(parkId, 10);
        },

        selectedCategory() {
            const { category_id: categoryId } = this.data;
            if (!categoryId && categoryId !== 0) {
                return null;
            }

            return this.$store.getters['categories/category'](categoryId);
        },

        subCategoriesOptions() {
            const { selectedCategory } = this;
            if (!selectedCategory) {
                return [];
            }

            return formatOptions(selectedCategory.sub_categories);
        },

        parksOptions() {
            return this.$store.getters['parks/options'];
        },

        categoriesOptions() {
            return this.$store.getters['categories/options'];
        },

        isReservationsEnabled() {
            return this.$store.state.settings.reservation.enabled;
        },
    },
    watch: {
        criticalError(error) {
            if (error === null) {
                return;
            }
            throw error;
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
        this.$store.dispatch('categories/fetch');

        this.fetchAttributes();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e) {
            e.preventDefault();

            const data = cloneDeep(this.data);

            if (this.parksOptions.length === 1) {
                const firstParkId = this.parksOptions.at(0).value;
                data.park_id = !data.park_id && data.park_id !== 0
                    ? firstParkId
                    : data.park_id;
            }

            data.rental_price = config.billingMode !== 'none'
                ? data.rental_price
                : null;

            data.attributes = Object.entries(data.attributes).map(
                ([id, value]) => ({ id: parseInt(id, 10), value }),
            );

            if (!this.isAdmin) {
                delete data.approvers;
            }

            this.$emit('submit', data);
        },

        handleCancel() {
            this.$emit('cancel');
        },

        handleCategoryChange() {
            this.data.sub_category_id = null;

            this.fetchAttributes();
        },

        handleUpdateRentalPrice() {
            if (this.data.rental_price > 0) {
                this.data.is_hidden_on_bill = false;
            }
        },

        handleAttributeChange(id, newValue) {
            this.$set(this.data.attributes, id, newValue);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchAttributes() {
            let { category_id: categoryId } = this.data;
            if (!categoryId && categoryId !== 0) {
                categoryId = 'none';
            }

            try {
                this.extraAttributes = await apiAttributes.all(categoryId);

                // - Supprime les données d'attributs obsolètes dans les données du formulaire.
                Object.keys(this.data.attributes).forEach((id) => {
                    const stillExists = this.extraAttributes
                        .some((attr) => attr.id === parseInt(id, 10));

                    if (!stillExists) {
                        this.$delete(this.data.attributes, id);
                    }
                });
            } catch {
                this.extraAttributes = [];
                this.criticalError = new Error('Impossible de récupérer la liste des attributs.');
            }
        },

        getAttributeInputType(attributeType) {
            switch (attributeType) {
                case 'integer':
                case 'float':
                    return 'number';
                case 'boolean':
                    return 'switch';
                case 'date':
                    return 'date';
                default:
                    return 'text';
            }
        },

        getAttributeInputStep(attributeType) {
            switch (attributeType) {
                case 'integer':
                    return 1;
                case 'float':
                    return 0.001;
                default:
                    return undefined;
            }
        },
    },
    render() {
        const {
            $t: __,
            data,
            errors,
            isSaving,
            isReservationsEnabled,
            criticalError,
            parksOptions,
            categoriesOptions,
            subCategoriesOptions,
            showParksSelector,
            showSubCategories,
            showBilling,
            extraAttributes,
            handleSubmit,
            handleCancel,
            handleCategoryChange,
            handleUpdateRentalPrice,
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
                        label="name"
                        v-model={data.name}
                        errors={errors?.name}
                        help={__('page.material-edit.help-name')}
                        required
                    />
                    <FormField
                        label="reference"
                        v-model={data.reference}
                        errors={errors?.reference}
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
                            errors={errors?.category_id}
                            onChange={handleCategoryChange}
                        />
                        {showSubCategories && (
                            <FormField
                                label="sub-category"
                                type="select"
                                class="MaterialEditForm__sub-category"
                                options={subCategoriesOptions}
                                v-model={data.sub_category_id}
                                errors={errors?.sub_category_id}
                            />
                        )}
                    </div>
                    <FormField
                        label="description"
                        type="textarea"
                        rows={5}
                        v-model={data.description}
                        errors={errors?.description}
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
                                errors={errors?.park_id}
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
                            errors={errors?.stock_quantity}
                            required
                        />
                        <FormField
                            label="out-of-order-quantity"
                            type="number"
                            step={1}
                            class="MaterialEditForm__out-of-order-quantity"
                            v-model={data.out_of_order_quantity}
                            errors={errors?.out_of_order_quantity}
                        />
                    </div>
                </Fieldset>
                {showBilling && (
                    <Fieldset title={__('billing-infos')}>
                        <FormField
                            label="rental-price"
                            type="number"
                            addon={__('page.material-edit.currency-per-day', {
                                currency: config.currency.symbol,
                            })}
                            class="MaterialEditForm__price"
                            v-model={data.rental_price}
                            errors={errors?.rental_price}
                            onInput={handleUpdateRentalPrice}
                            required
                        />
                        <FormField
                            label="discountable"
                            type="switch"
                            v-model={data.is_discountable}
                            errors={errors?.is_discountable}
                        />
                        <FormField
                            label="hidden-on-invoice"
                            type="switch"
                            v-model={data.is_hidden_on_bill}
                            errors={errors?.is_hidden_on_bill}
                            disabled={data.rental_price > 0 ? __('price-must-be-zero') : false}
                        />
                    </Fieldset>
                )}
                {isReservationsEnabled && (
                    <Fieldset title={__('online-reservations')}>
                        <FormField
                            type="switch"
                            label={__('page.material-edit.allow-online-reservations')}
                            v-model={data.is_reservable}
                            errors={errors?.is_reservable}
                        />
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
                        errors={errors?.replacement_price}
                    />
                    {extraAttributes.map(({ id, name, type, unit }) => (
                        <FormField
                            key={id}
                            label={name}
                            type={getAttributeInputType(type)}
                            step={getAttributeInputStep(type)}
                            addon={unit}
                            value={data.attributes[id] ?? null}
                            onInput={(value) => {
                                handleAttributeChange(id, value);
                            }}
                        />
                    ))}
                    <FormField
                        label="notes"
                        type="textarea"
                        v-model={data.note}
                        errors={errors?.note}
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
};

export default defineComponent(MaterialEditForm);
