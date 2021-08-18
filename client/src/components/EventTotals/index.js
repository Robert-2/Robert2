import './index.scss';
import moment from 'moment';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import getEventMaterialItemsCount from '@/utils/getEventMaterialItemsCount';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventDiscountRate from '@/utils/getEventDiscountRate';
import getEventReplacementTotal from '@/utils/getEventReplacementTotal';
import decimalRound from '@/utils/decimalRound';

// @vue/component
export default {
    name: 'EventTotals',
    props: {
        event: { type: Object, required: true },
        forcedDiscountRate: { type: Number, default: undefined },
        withRentalPrices: Boolean,
    },
    computed: {
        duration() {
            const start = moment(this.event.start_date);
            const end = moment(this.event.end_date);
            return start && end ? end.diff(start, 'days') + 1 : 1;
        },

        ratio() {
            return Config.degressiveRate(this.duration);
        },

        itemsCount() {
            return getEventMaterialItemsCount(this.event.materials);
        },

        total() {
            return getEventOneDayTotal(this.event.materials);
        },

        grandTotal() {
            return getEventGrandTotal(this.total, this.duration);
        },

        totalDiscountable() {
            return getEventOneDayTotalDiscountable(this.event.materials);
        },

        grandTotalDiscountable() {
            return getEventGrandTotal(this.totalDiscountable, this.duration);
        },

        discountRate() {
            if (this.forcedDiscountRate != null) {
                return this.forcedDiscountRate;
            }
            return getEventDiscountRate(this.event);
        },

        discountAmount() {
            return this.grandTotalDiscountable * (this.discountRate / 100);
        },

        discountTarget() {
            return decimalRound(this.grandTotal - this.discountAmount);
        },

        grandTotalWithDiscount() {
            return this.grandTotal - this.discountAmount;
        },

        replacementTotal() {
            return getEventReplacementTotal(this.event.materials);
        },
    },
    created() {
        this.$store.dispatch('categories/fetch');
    },
    render() {
        const {
            $t: __,
            withRentalPrices,
            itemsCount,
            total,
            duration,
            ratio,
            grandTotal,
            discountRate,
            totalDiscountable,
            grandTotalDiscountable,
            discountAmount,
            grandTotalWithDiscount,
            replacementTotal,
        } = this;

        return (
            <section class="EventTotals">
                {withRentalPrices && (
                    <div class="EventTotals__rental-prices">
                        <div class="EventTotals__base">
                            {__('total')}{' '}
                            <span class="EventTotals__items-count">
                                {__('items-count', { count: itemsCount }, itemsCount)}
                            </span>
                            <span class="EventTotals__daily-total">
                                <i class="fas fa-arrow-right" /> {formatAmount(total)}
                            </span>
                            <span class="EventTotals__duration">
                                <i class="fas fa-times" /> {__('days-count', { duration }, duration)}
                            </span>
                            <span class="EventTotals__ratio">
                                <i class="fas fa-arrow-right" /> {__('ratio')}&nbsp;{ratio}
                            </span>
                        </div>
                        <div class="EventTotals__grand">
                            {__('total-amount')}:&nbsp;{formatAmount(grandTotal)}
                        </div>
                        {discountRate > 0 && totalDiscountable !== total && (
                            <div class="EventTotals__discountable">
                                {__('total-discountable')}:
                                {formatAmount(totalDiscountable)}&nbsp;/&nbsp;{__('day')}
                                <i class="fas fa-arrow-right" /> {formatAmount(grandTotalDiscountable)}
                            </div>
                        )}
                        {discountRate > 0 && (
                            <div class="EventTotals__discount">
                                {__('discount')} {discountRate} %
                                <i class="fas fa-arrow-right" /> - {formatAmount(discountAmount)}
                            </div>
                        )}
                        {discountRate > 0 && (
                            <div class="EventTotals__grand-discount">
                                {__('total-amount-with-discount')}: {formatAmount(grandTotalWithDiscount)}
                            </div>
                        )}
                        {duration > 1 && (
                            <div class="EventTotals__daily">
                                ({formatAmount(grandTotalWithDiscount / duration)}&nbsp;/&nbsp;{__('day')})
                            </div>
                        )}
                    </div>
                )}
                <div class="EventTotals__replacement">
                    {__('replacement-total')}: {formatAmount(replacementTotal)}
                </div>
            </section>
        );
    },
};
