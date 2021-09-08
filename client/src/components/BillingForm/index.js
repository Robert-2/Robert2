import './index.scss';
import Config from '@/globals/config';
import FormField from '@/components/FormField';

// @vue/component
export default {
    name: 'BillingForm',
    props: {
        discountRate: { type: Number, required: true },
        discountTarget: { type: Number, required: true },
        maxRate: { type: Number, default: 100 },
        maxAmount: { type: Number, default: undefined },
        isRegeneration: { type: Boolean, default: false },
        loading: { type: Boolean, default: false },
        beneficiary: { type: Object, default: undefined },
        saveLabel: {
            type: String,
            default() {
                const { $t: __ } = this;
                return __('save');
            },
        },
    },
    data() {
        return {
            currency: Config.currency.symbol,
        };
    },
    computed: {
        isDiscountable() {
            return this.maxRate > 0;
        },
    },
    methods: {
        handleChangeRate(value, event) {
            // - Controlled input...
            event.target.value = this.discountRate;

            value = Number.parseFloat(value);

            if ((!value && value !== 0) || Number.isNaN(value) || !Number.isFinite(value)) {
                return;
            }

            if (value < 0) {
                value = 0;
            }

            if (value > this.maxRate) {
                value = this.maxRate;
            }

            this.$emit('change', { field: 'rate', value });
        },

        handleChangeAmount(value, event) {
            // - Controlled input...
            event.target.value = this.discountTarget;

            value = Number.parseFloat(value);

            if ((!value && value !== 0) || Number.isNaN(value) || !Number.isFinite(value)) {
                return;
            }

            if (value < 0) {
                value = 0;
            }

            if (this.maxAmount != null && value > this.maxAmount) {
                value = this.maxAmount;
            }

            this.$emit('change', { field: 'amount', value });
        },

        handleSubmit(e) {
            e.preventDefault();
            this.$emit('submit');
        },

        handleCancel() {
            this.$emit('cancel');
        },
    },
    render() {
        const {
            $t: __,
            loading,
            currency,
            saveLabel,
            beneficiary,
            maxRate,
            maxAmount,
            isDiscountable,
            discountRate,
            discountTarget,
            isRegeneration,
            handleSubmit,
            handleCancel,
            handleChangeRate,
            handleChangeAmount,
        } = this;

        const classNames = [
            'Form',
            'BillingForm',
            { 'BillingForm--not-discountable': !isDiscountable },
        ];

        return (
            <form class={classNames} onSubmit={handleSubmit}>
                {!isDiscountable && (
                    <p class="BillingForm__no-discount">{__('no-discount-applicable')}</p>
                )}
                {isDiscountable && (
                    <div class="Form__fieldset">
                        <h4 class="Form__fieldset__title">{__('discount')}</h4>
                        <FormField
                            type="number"
                            label="wanted-rate"
                            class="BillingForm__discount-input"
                            name="discountRate"
                            disabled={loading}
                            value={discountRate}
                            step={0.0001}
                            min={0.0}
                            max={maxRate}
                            addon="%"
                            onInput={handleChangeRate}
                        />
                        {maxRate < 100 && (
                            <p class="BillingForm__discount-max-help">
                                {__('max-discount-rate-help', { rate: maxRate })}
                            </p>
                        )}
                        <FormField
                            type="number"
                            label="wanted-amount"
                            class="BillingForm__discount-target-input"
                            name="discountTarget"
                            disabled={loading}
                            value={discountTarget}
                            step={0.01}
                            min={0}
                            max={maxAmount}
                            addon={currency}
                            onInput={handleChangeAmount}
                        />
                    </div>
                )}
                {!!beneficiary && (
                    <div class="BillingForm__beneficiary">
                        <div class="BillingForm__beneficiary__label">
                            {__('beneficiary')}
                        </div>
                        <div class="BillingForm__beneficiary__name">
                            <router-link to={`/beneficiaries/${beneficiary.id}`} title={__('action-edit')}>
                                {beneficiary.full_name}
                            </router-link>
                        </div>
                    </div>
                )}
                <div class="BillingForm__save">
                    <button class="success" type="submit" disabled={loading}>
                        <i class={['fas', loading ? 'fa-circle-notch fa-spin' : 'fa-plus']} />{' '}
                        {saveLabel}
                    </button>
                    {isRegeneration && (
                        <button onClick={handleCancel} type="button" disabled={loading}>
                            {__('cancel')}
                        </button>
                    )}
                </div>
            </form>
        );
    },
};
