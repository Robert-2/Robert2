import './index.scss';
import { defineComponent } from '@vue/composition-api';
import formatAmount from '@/utils/formatAmount';

import type { PropType } from '@vue/composition-api';
import type { EventDetails, EventMaterial } from '@/stores/api/events';

type Props = {
    /** L'événement dont on veut afficher les totaux. */
    event: EventDetails,
};

/** Totaux d'un événement.  */
const EventTotals = defineComponent({
    name: 'EventTotals',
    props: {
        event: {
            type: Object as PropType<Required<Props>['event']>,
            required: true,
        },
    },
    computed: {
        duration(): number {
            const { operation_period: operationPeriod } = this.event;
            return operationPeriod.asDays();
        },

        useTaxes(): boolean {
            const { is_billable: isBillable } = this.event;
            if (!isBillable) {
                return false;
            }

            const { vat_rate: vatRate } = this.event;
            return vatRate.greaterThan(0);
        },

        hasDiscount(): boolean {
            const { is_billable: isBillable } = this.event;
            if (!isBillable) {
                return false;
            }

            const { discount_rate: discountRate } = this.event;
            return discountRate.greaterThan(0);
        },

        isNotFullyDiscountable(): boolean {
            const { is_billable: isBillable } = this.event;
            if (!isBillable) {
                return false;
            }

            const {
                total_without_discount: totalWithoutDiscount,
                total_discountable: totalDiscountable,
            } = this.event;

            return !totalDiscountable.eq(totalWithoutDiscount);
        },

        itemsCount(): number {
            const { materials } = this.event;

            return materials.reduce(
                (total: number, material: EventMaterial) => (
                    total + material.pivot.quantity
                ),
                0,
            );
        },
    },
    created() {
        this.$store.dispatch('categories/fetch');
    },
    render() {
        const {
            $t: __,
            event,
            itemsCount,
            duration,
            useTaxes,
            hasDiscount,
            isNotFullyDiscountable,
        } = this;
        const {
            is_billable: isBillable,
            total_replacement: totalReplacement,
            currency,
        } = event;

        if (itemsCount === 0) {
            return null;
        }

        const renderInfos = (): JSX.Element => (
            <div class="EventTotals__infos">
                <div class="EventTotals__infos__item">
                    {__('items-count-total', { count: itemsCount }, itemsCount)}
                </div>
                <div class="EventTotals__infos__item">
                    {__('duration-days', { duration }, duration)}
                </div>
                <div class="EventTotals__infos__item">
                    {__('total-replacement', { total: formatAmount(totalReplacement, currency) })}
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
            vat_rate: vatRate,
            daily_total: dailyTotal,
            degressive_rate: degressiveRate,
            total_without_discount: totalWithoutDiscount,
            discount_rate: discountRate,
            total_discountable: totalDiscountable,
            total_discount: totalDiscount,
            total_without_taxes: totalWithoutTaxes,
            total_taxes: totalTaxes,
            total_with_taxes: totalWithTaxes,
        } = event;

        return (
            <div class="EventTotals">
                {renderInfos()}
                <div class="EventTotals__billing">
                    <div class="EventTotals__billing__group">
                        <div class="EventTotals__billing__line">
                            <div class="EventTotals__billing__line__title">
                                {useTaxes ? __('daily-total-without-tax') : __('daily-total')}
                            </div>
                            <div class="EventTotals__billing__line__price">
                                {formatAmount(dailyTotal, currency)}
                            </div>
                        </div>
                        <div class="EventTotals__billing__line">
                            <div class="EventTotals__billing__line__title">
                                {__('days-count', { duration }, duration)}, {__('ratio')}
                            </div>
                            <div class="EventTotals__billing__line__price">
                                &times; {degressiveRate.toString()}
                            </div>
                        </div>
                        <div class="EventTotals__billing__line EventTotals__billing__line--grand-total">
                            <div class="EventTotals__billing__line__title">
                                {useTaxes ? __('total-without-taxes') : __('total')}
                            </div>
                            <div class="EventTotals__billing__line__price">
                                {formatAmount(totalWithoutDiscount, currency)}
                            </div>
                        </div>
                    </div>
                    {hasDiscount && (
                        <div class="EventTotals__billing__group">
                            {isNotFullyDiscountable && (
                                <div class="EventTotals__billing__line">
                                    <div class="EventTotals__billing__line__title">
                                        {__('total-discountable')}
                                    </div>
                                    <div class="EventTotals__billing__line__price">
                                        {formatAmount(totalDiscountable, currency)}
                                    </div>
                                </div>
                            )}
                            <div class="EventTotals__billing__line">
                                <div class="EventTotals__billing__line__title">
                                    {__('discount-rate', { rate: discountRate.toString() })}
                                </div>
                                <div class="EventTotals__billing__line__price">
                                    - {formatAmount(totalDiscount, currency)}
                                </div>
                            </div>
                            <div class="EventTotals__billing__line EventTotals__billing__line--grand-total">
                                <div class="EventTotals__billing__line__title">
                                    {__('total-after-discount')}
                                </div>
                                <div class="EventTotals__billing__line__price">
                                    {formatAmount(totalWithoutTaxes, currency)}
                                </div>
                            </div>
                        </div>
                    )}
                    {useTaxes && (
                        <div class="EventTotals__billing__group">
                            <div class="EventTotals__billing__line">
                                <div class="EventTotals__billing__line__title">
                                    {__('total-taxes')} {vatRate.toNumber()}%
                                </div>
                                <div class="EventTotals__billing__line__price">
                                    {formatAmount(totalTaxes, currency)}
                                </div>
                            </div>
                            <div class="EventTotals__billing__line EventTotals__billing__line--grand-total">
                                <div class="EventTotals__billing__line__title">
                                    {__('total-with-taxes')}
                                </div>
                                <div class="EventTotals__billing__line__price">
                                    {formatAmount(totalWithTaxes, currency)}
                                </div>
                            </div>
                        </div>
                    )}
                    {(!hasDiscount && isNotFullyDiscountable) && (
                        <div class="EventTotals__billing__line EventTotals__billing__line--secondary">
                            <div class="EventTotals__billing__line__title">
                                {__('total-discountable')}
                            </div>
                            <div class="EventTotals__billing__line__price">
                                {formatAmount(totalDiscountable, currency)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    },
});

export default EventTotals;
