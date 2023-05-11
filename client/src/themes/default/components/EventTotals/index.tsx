import './index.scss';
import { defineComponent } from '@vue/composition-api';
import formatAmount from '@/utils/formatAmount';
import getEventMaterialItemsCount from '@/utils/getEventMaterialItemsCount';
import Fragment from '@/components/Fragment';

import type { PropType } from '@vue/composition-api';
import type { Event } from '@/stores/api/events';

type Props = {
    /** L'événement dont on veut afficher les totaux. */
    event: Event,
};

// @vue/component
const EventTotals = defineComponent({
    name: 'EventTotals',
    props: {
        event: {
            type: Object as PropType<Required<Props>['event']>,
            required: true,
        },
    },
    computed: {
        itemsCount(): number {
            return getEventMaterialItemsCount(this.event.materials);
        },

        useTaxes(): boolean {
            const { is_billable: isBillable } = this.event;
            if (!isBillable) {
                return false;
            }

            const { vat_rate: vatRate } = this.event;
            return vatRate.toNumber() > 0;
        },

        hasDiscount(): boolean {
            const { is_billable: isBillable } = this.event;
            if (!isBillable) {
                return false;
            }

            const { discount_rate: discountRate } = this.event;
            return discountRate.toNumber() > 0;
        },

        discountableDifferentFromTotal(): boolean {
            const { is_billable: isBillable } = this.event;
            if (!isBillable) {
                return false;
            }

            const {
                daily_total_discountable: dailyTotalDiscountable,
                daily_total_without_taxes: dailyTotalWithoutTaxes,
            } = this.event;

            return dailyTotalDiscountable.toNumber() !== dailyTotalWithoutTaxes.toNumber();
        },
    },
    created() {
        this.$store.dispatch('categories/fetch');
    },
    render() {
        const { $t: __, event, itemsCount, useTaxes, hasDiscount, discountableDifferentFromTotal } = this;
        const {
            is_billable: isBillable,
            duration,
            total_replacement: totalReplacement,
            currency,
        } = event;

        if (itemsCount === 0) {
            return null;
        }

        const renderInfos = (): JSX.Element => (
            <div class="EventTotals__infos">
                <div class="EventTotals__items-count">
                    {__('total')} {__('items-count', { count: itemsCount }, itemsCount)}
                </div>
                <div class="EventTotals__duration">
                    {__('duration-days', { duration }, duration)}
                </div>
                <div class="EventTotals__total-replacement">
                    {__('total-replacement')} {formatAmount(totalReplacement, currency)}
                </div>
            </div>
        );

        if (!isBillable) {
            return (
                <div class="EventTotals">
                    {renderInfos()}
                </div>
            );
        }

        const {
            degressive_rate: degressiveRate,
            vat_rate: vatRate,
            discount_rate: discountRate,
            daily_total_without_discount: dailyTotalWithoutDiscount,
            daily_total_discountable: dailyTotalDiscountable,
            daily_total_discount: dailyTotalDiscount,
            daily_total_without_taxes: dailyTotalWithoutTaxes,
            total_without_taxes: totalWithoutTaxes,
            total_taxes: totalTaxes,
            total_with_taxes: totalWithTaxes,
        } = event;

        return (
            <div class="EventTotals">
                {renderInfos()}
                <div class="EventTotals__billing">
                    <div class="EventTotals__line">
                        <div class="EventTotals__line__title">
                            {__('daily-total')}
                        </div>
                        <div class="EventTotals__line__price">
                            {formatAmount(dailyTotalWithoutDiscount, currency)}
                        </div>
                    </div>
                    <div class="EventTotals__line">
                        <div class="EventTotals__line__title">
                            {__('days-count', { duration }, duration)}, {__('ratio')}
                        </div>
                        <div class="EventTotals__line__price">
                            &times; {degressiveRate.toString()}
                        </div>
                    </div>
                    <div class="EventTotals__line EventTotals__line--grand-total">
                        <div class="EventTotals__line__title">
                            {useTaxes ? __('total-without-taxes') : __('total')}
                        </div>
                        <div class="EventTotals__line__price">
                            {formatAmount(totalWithoutTaxes, currency)}
                        </div>
                    </div>
                    {hasDiscount && (
                        <Fragment>
                            {discountableDifferentFromTotal && (
                                <div class="EventTotals__line">
                                    <div class="EventTotals__line__title">
                                        {__('daily-total-discountable')}
                                    </div>
                                    <div class="EventTotals__line__price">
                                        {formatAmount(dailyTotalDiscountable, currency)}
                                    </div>
                                </div>
                            )}
                            <div class="EventTotals__line">
                                <div class="EventTotals__line__title">
                                    {__('discount-rate', { rate: discountRate })}
                                </div>
                                <div class="EventTotals__line__price">
                                    - {formatAmount(dailyTotalDiscount, currency)}
                                </div>
                            </div>
                            <div class="EventTotals__line EventTotals__line--grand-total">
                                <div class="EventTotals__line__title">
                                    {useTaxes ? __('daily-total-without-tax-after-discount') : __('daily-total-after-discount')}
                                </div>
                                <div class="EventTotals__line__price">
                                    {formatAmount(dailyTotalWithoutTaxes, currency)}
                                </div>
                            </div>
                        </Fragment>
                    )}
                    {useTaxes && (
                        <Fragment>
                            <div class="EventTotals__line">
                                <div class="EventTotals__line__title">
                                    {__('total-taxes')} {vatRate.toNumber()}%
                                </div>
                                <div class="EventTotals__line__price">
                                    {formatAmount(totalTaxes, currency)}
                                </div>
                            </div>
                            <div class="EventTotals__line EventTotals__line--grand-total">
                                <div class="EventTotals__line__title">
                                    {__('total-with-taxes')}
                                </div>
                                <div class="EventTotals__line__price">
                                    {formatAmount(totalWithTaxes, currency)}
                                </div>
                            </div>
                        </Fragment>
                    )}
                </div>
            </div>
        );
    },
});

export default EventTotals;
