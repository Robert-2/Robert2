import './index.scss';
import moment from 'moment';
import { CalendarView } from 'vue-simple-calendar';

// @vue/component
export default {
    name: 'MonthCalendar',
    props: {
        events: { type: Array, required: true },
        showDate: { type: Date, default: () => new Date() },
        withTotal: { type: Boolean },
    },
    data() {
        return {
            currentDate: this.showDate,
        };
    },
    computed: {
        currentMonth() {
            return moment(this.currentDate).format('MMMM YYYY');
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
            events,
            currentDate,
            currentMonth,
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
                        class="info"
                        v-tooltip={__('previous-month')}
                        onClick={handlePrevMonthClick}
                    >
                        <i class="fas fa-arrow-left" />
                    </button>
                    <span class="MonthCalendar__header__current-month">{currentMonth}</span>
                    <button
                        type="button"
                        class="info"
                        v-tooltip={__('next-month')}
                        onClick={handleNextMonthClick}
                    >
                        <i class="fas fa-arrow-right" />
                    </button>
                    {withTotal && (
                        <h4 class="MonthCalendar__header__total">
                            {__('events-count-total', { count: events.length }, events.length)}
                        </h4>
                    )}
                </header>
                <CalendarView
                    class="MonthCalendar__body"
                    showDate={currentDate}
                    startingDayOfWeek={1}
                    items={events}
                    itemContentHeight="53px"
                    itemBorderHeight="0px"
                    // Note: Le camelCase (`onClickItem`) ne fonctionne pas.
                    onClick-item={handleClickItem}
                />
            </div>
        );
    },
};
