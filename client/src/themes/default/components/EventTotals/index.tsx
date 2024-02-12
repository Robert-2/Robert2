import './index.scss';
import { defineComponent } from '@vue/composition-api';
import formatAmount from '@/utils/formatAmount';
import Fragment from '@/components/Fragment';

import type { PropType } from '@vue/composition-api';
import type { Event, EventMaterial } from '@/stores/api/events';

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
            const { materials } = this.event;

            return materials.reduce(
                (total: number, material: EventMaterial) => (
                    total + material.pivot.quantity
                ),
                0,
            );
        },

        useTaxes(): boolean {
            const { is_billable: isBillable } = this.event;
            if (!isBillable) {
                return false;
            }

            const { vat_rate: vatRate } = this.event;
            return !vatRate.isZero();
        },

        hasDiscount(): boolean {
            const { is_billable: isBillable } = this.event;
            if (!isBillable) {
                return false;
            }

            const { discount_rate: discountRate } = this.event;
            return !discountRate.isZero();
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
    },
    created() {
        this.$store.dispatch('categories/fetch');
    },
    render() {
        const { $t: __, event, itemsCount, useTaxes, hasDiscount, isNotFullyDiscountable } = this;
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
                    {__('duration-days', { duration: duration.days }, duration.days)}
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
            daily_total: dailyTotal,
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
                    <div class="EventTotals__line">
                        <div class="EventTotals__line__title">
                            {useTaxes ? __('daily-total-without-tax') : __('daily-total')}
                        </div>
                        <div class="EventTotals__line__price">
                            {formatAmount(dailyTotal, currency)}
                        </div>
                    </div>
                    <div class="EventTotals__line">
                        <div class="EventTotals__line__title">
                            {__('days-count', { duration: duration.days }, duration.days)}, {__('ratio')}
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
                            {formatAmount(totalWithoutDiscount, currency)}
                        </div>
                    </div>
                    {hasDiscount && (
                        <Fragment>
                            {isNotFullyDiscountable && (
                                <div class="EventTotals__line">
                                    <div class="EventTotals__line__title">
                                        {__('total-discountable')}
                                    </div>
                                    <div class="EventTotals__line__price">
                                        {formatAmount(totalDiscountable, currency)}
                                    </div>
                                </div>
                            )}
                            <div class="EventTotals__line">
                                <div class="EventTotals__line__title">
                                    {__('discount-rate', { rate: discountRate })}
                                </div>
                                <div class="EventTotals__line__price">
                                    - {formatAmount(totalDiscount, currency)}
                                </div>
                            </div>
                            <div class="EventTotals__line EventTotals__line--grand-total">
                                <div class="EventTotals__line__title">
                                    {__('total-after-discount')}
                                </div>
                                <div class="EventTotals__line__price">
                                    {formatAmount(totalWithoutTaxes, currency)}
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
                    {(!hasDiscount && isNotFullyDiscountable) && (
                        <div class="EventTotals__line EventTotals__line--secondary">
                            <div class="EventTotals__line__title">
                                {__('total-discountable')}
                            </div>
                            <div class="EventTotals__line__price">
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
