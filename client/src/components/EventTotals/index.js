import './index.scss';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import getEventMaterialItemsCount from '@/utils/getEventMaterialItemsCount';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventOneDayTotalDiscountable from '@/utils/getEventOneDayTotalDiscountable';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import getEventReplacementTotal from '@/utils/getEventReplacementTotal';
import decimalRound from '@/utils/decimalRound';

// @vue/component
export default {
    name: 'EventTotals',
    props: {
        materials: Array,
        withRentalPrices: Boolean,
        discountRate: Number,
        start: Object,
        end: Object,
    },
    data() {
        return {
            duration: this.end ? this.end.diff(this.start, 'days') + 1 : 1,
            currency: Config.currency.symbol,
        };
    },
    computed: {
        ratio() {
            return Config.degressiveRate(this.duration);
        },

        itemsCount() {
            return getEventMaterialItemsCount(this.materials);
        },

        total() {
            return getEventOneDayTotal(this.materials);
        },

        grandTotal() {
            return getEventGrandTotal(this.total, this.duration);
        },

        totalDiscountable() {
            return getEventOneDayTotalDiscountable(this.materials);
        },

        grandTotalDiscountable() {
            return getEventGrandTotal(this.totalDiscountable, this.duration);
        },

        discountAmount() {
            return this.grandTotalDiscountable * (this.discountRate / 100);
        },

        discountTarget: {
            get() {
                return decimalRound(this.grandTotal - this.discountAmount);
            },
            set(value) {
                const diff = this.grandTotal - value;
                const rate = 100 * (diff / this.grandTotalDiscountable);
                this.discountRate = decimalRound(rate, 4);
            },
        },

        grandTotalWithDiscount() {
            return this.grandTotal - this.discountAmount;
        },

        replacementTotal() {
            return getEventReplacementTotal(this.materials);
        },
    },
    created() {
        this.$store.dispatch('categories/fetch');
    },
    methods: {
        recalcDiscountRate(newVal) {
            this.discountTarget = parseFloat(newVal);
        },
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
