import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Decimal from 'decimal.js';
import config from '@/globals/config';
import Fragment from '@/components/Fragment';
import FormField from '@/themes/default/components/FormField';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { Beneficiary } from '@/stores/api/beneficiaries';

export type DiscountPayload = {
    field: 'amount' | 'rate',
    value: Decimal,
};

type Props = {
    /**
     * Le taux de remise, en pourcent.
     * Doit être un nombre compris entre 0 et 100.
     */
    discountRate: Decimal,

    /**
     * Le montant total voulu après remise.
     * Doit être un nombre compris entre 0 (ou la valeur de minAmount)
     * et le montant total sans remise (ou la valeur de maxAmount).
     */
    discountTarget: Decimal,

    /**
     * Le taux maximum de la remise, en pourcent.
     *
     * @default 100
     */
    maxRate?: Decimal,

    /**
     * Le montant total minimum applicable, pour limiter la saisie dans le champ.
     * Doit être un nombre compris entre 0 et le montant total sans remise.
     */
    minAmount?: Decimal,

    /**
     * Le montant total maximum applicable, pour limiter la saisie dans le champ.
     * Doit être un nombre compris entre 0 et le montant total sans remise.
     */
    maxAmount?: Decimal,

    /**
     * Le devis (ou la facture) est en cours de création ?
     *
     * @default false
     */
    loading?: boolean,

    /** Le bénéficiaire, si on veut afficher son nom. */
    beneficiary?: Beneficiary,

    /**
     * Le texte à afficher dans le bouton de sauvegarde.
     *
     * @default "Sauvegarder" (traduit)
     */
    saveLabel?: string,
};

/** Formulaire permettant de créer un devis ou une facture. */
const EventDetailsBillingForm = defineComponent({
    name: 'EventDetailsBillingForm',
    props: {
        discountRate: {
            type: Decimal as PropType<Props['discountRate']>,
            required: true,
        },
        discountTarget: {
            type: Decimal as PropType<Props['discountTarget']>,
            required: true,
        },
        maxRate: {
            type: Decimal as PropType<Required<Props>['maxRate']>,
            default: () => new Decimal(100),
        },
        minAmount: {
            type: Decimal as PropType<Props['minAmount']>,
            default: undefined,
        },
        maxAmount: {
            type: Decimal as PropType<Props['maxAmount']>,
            default: undefined,
        },
        loading: {
            type: Boolean as PropType<Required<Props>['loading']>,
            default: false,
        },
        beneficiary: {
            type: Object as PropType<Props['beneficiary']>,
            default: undefined,
        },
        saveLabel: {
            type: String as PropType<Required<Props>['saveLabel']>,
            default() {
                const { $t: __ } = this;
                return __('save');
            },
        },
    },
    emits: ['change', 'submit', 'cancel'],
    computed: {
        isDiscountable(): boolean {
            const { maxRate } = this;
            return maxRate.greaterThan(0);
        },

        currency(): string {
            return config.currency.symbol;
        },
    },
    methods: {
        handleChangeRate(givenValue: string) {
            const rate = new Decimal(givenValue);
            if (rate.isNaN() || !rate.isFinite()) {
                return;
            }

            const value = rate.clampedTo(0, this.maxRate);
            const payload: DiscountPayload = { field: 'rate', value };
            this.$emit('change', payload);
        },

        handleChangeAmount(givenValue: string) {
            const amount = new Decimal(givenValue);
            if (amount.isNaN() || !amount.isFinite()) {
                return;
            }

            const value = amount.clampedTo(0, this.maxAmount ?? Infinity);
            const payload: DiscountPayload = { field: 'amount', value };
            this.$emit('change', payload);
        },

        handleSubmit(e: SubmitEvent) {
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
            minAmount,
            maxAmount,
            isDiscountable,
            discountRate,
            discountTarget,
            handleSubmit,
            handleCancel,
            handleChangeRate,
            handleChangeAmount,
        } = this;

        const classNames = [
            'Form',
            'EventDetailsBillingForm',
            { 'EventDetailsBillingForm--not-discountable': !isDiscountable },
        ];

        return (
            <form class={classNames} onSubmit={handleSubmit} novalidate>
                {!isDiscountable && (
                    <p class="EventDetailsBillingForm__no-discount">{__('no-discount-applicable')}</p>
                )}
                {isDiscountable && (
                    <Fragment>
                        <FormField
                            type="number"
                            label="wanted-discount-rate"
                            class="EventDetailsBillingForm__discount-input"
                            name="discountRate"
                            disabled={loading}
                            value={discountRate.toFixed(4)}
                            step={0.0001}
                            min={0.0}
                            max={maxRate.toNumber()}
                            addon="%"
                            onInput={handleChangeRate}
                            help={(
                                maxRate.lessThan(100)
                                    ? __('max-discount-rate-help', { rate: maxRate.toFixed(4) })
                                    : undefined
                            )}
                        />
                        <FormField
                            type="number"
                            label="wanted-total-amount"
                            class="EventDetailsBillingForm__discount-target-input"
                            name="discountTarget"
                            disabled={loading}
                            value={discountTarget.toFixed(2)}
                            step={0.01}
                            min={minAmount?.toNumber() ?? undefined}
                            max={maxAmount?.toNumber() ?? undefined}
                            addon={currency}
                            onChange={handleChangeAmount}
                        />
                    </Fragment>
                )}
                {!!beneficiary && (
                    <div class="EventDetailsBillingForm__beneficiary">
                        <div class="EventDetailsBillingForm__beneficiary__label">
                            {__('beneficiary')}
                        </div>
                        <div class="EventDetailsBillingForm__beneficiary__name">
                            {beneficiary.full_name}
                        </div>
                    </div>
                )}
                <div class="EventDetailsBillingForm__save">
                    <Button htmlType="submit" type="primary" loading={loading}>
                        {saveLabel}
                    </Button>
                    <Button onClick={handleCancel} disabled={loading}>
                        {__('cancel')}
                    </Button>
                </div>
            </form>
        );
    },
});

export default EventDetailsBillingForm;
