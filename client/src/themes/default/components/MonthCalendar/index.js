import './index.scss';
import clsx from 'clsx';
import moment from 'moment';
import styleObjectToString from 'style-object-to-css-string';
import { CalendarView } from 'vue-simple-calendar';
import Color from '@/utils/color';

// @vue/component
export default {
    name: 'MonthCalendar',
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        withTotal: { type: Boolean },
    },
    data() {
        return {
            currentDate: new Date(),
        };
    },
    computed: {
        currentMonth() {
            return moment(this.currentDate).format('MMMM YYYY');
        },

        formattedItems() {
            return (this.items ?? []).map((rawItem) => {
                const {
                    startDate: rawStartDate,
                    endDate: rawEndDate,
                    style: rawStyle = {},
                    color: rawColor = null,
                    className: rawClassName = [],
                    ...item
                } = rawItem;

                const startDate = moment(rawStartDate);
                const endDate = moment(rawEndDate);
                const style = typeof rawStyle === 'object' ? { ...rawStyle } : {};
                const className = clsx(rawClassName).split(' ');

                if (rawColor !== null && rawColor !== undefined) {
                    const color = new Color(rawColor);

                    if (!('--month-calendar-item-color' in style)) {
                        style['--month-calendar-item-color'] = color.toHexString();
                    }

                    const colorType = color.isDark() ? 'dark' : 'light';
                    className.push(
                        `MonthCalendar__item--with-custom-color`,
                        `MonthCalendar__item--with-${colorType}-color`,
                    );
                }

                className.unshift('MonthCalendar__item');
                return {
                    ...item,
                    startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
                    endDate: endDate.format('YYYY-MM-DD HH:mm:ss'),
                    style: styleObjectToString(style),
                    classes: className,
                };
            });
        },
    },
    methods: {
        handlePrevMonthClick() {
            const newDate = moment(this.currentDate).subtract(1, 'month');
            this.currentDate = newDate.toDate();
        },

        handleNextMonthClick() {
            const newDate = moment(this.currentDate).add(1, 'month');
            this.currentDate = newDate.toDate();
        },

        handleClickItem(item) {
            this.$emit('clickItem', item.originalItem);
        },
    },
    render() {
        const {
            $t: __,
            currentDate,
            currentMonth,
            formattedItems,
            handlePrevMonthClick,
            handleNextMonthClick,
            handleClickItem,
            withTotal,
        } = this;

        return (
            <div class="MonthCalendar">
                <header class="MonthCalendar__header">
                    <button
                        type="button"
                        class="button info"
                        v-tooltip={__('previous-month')}
                        onClick={handlePrevMonthClick}
                    >
                        <i class="fas fa-arrow-left" />
                    </button>
                    <span class="MonthCalendar__header__current-month">{currentMonth}</span>
                    <button
                        type="button"
                        class="button info"
                        v-tooltip={__('next-month')}
                        onClick={handleNextMonthClick}
                    >
                        <i class="fas fa-arrow-right" />
                    </button>
                    {withTotal && (
                        <h4 class="MonthCalendar__header__total">
                            {__('events-count-total', { count: formattedItems.length }, formattedItems.length)}
                        </h4>
                    )}
                </header>
                <CalendarView
                    class="MonthCalendar__body"
                    showDate={currentDate}
                    startingDayOfWeek={1}
                    items={formattedItems}
                    itemContentHeight="53px"
                    itemBorderHeight="0px"
                    // Note: Le camelCase (`onClickItem`) ne fonctionne pas.
                    onClick-item={handleClickItem}
                />
            </div>
        );
    },
};
