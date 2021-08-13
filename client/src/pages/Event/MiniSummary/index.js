import moment from 'moment';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import getEventOneDayTotal from '@/utils/getEventOneDayTotal';
import getEventGrandTotal from '@/utils/getEventGrandTotal';
import EventStore from '../EventStore';

export default {
    name: 'EventMiniSummary',
    computed: {
        title() { return EventStore.state.title; },
        dates() { return EventStore.state.dates; },
        location() { return EventStore.state.location; },
        materials() { return EventStore.state.materials; },
        isConfirmed() { return EventStore.state.isConfirmed; },
        isSaved() { return EventStore.state.isSaved; },

        showPrices() {
            return Config.billingMode !== 'none' && EventStore.state.isBillable;
        },

        fromToDates() {
            const { start, end } = this.dates;
            return {
                from: start ? moment(start).format('L') : '',
                to: end ? moment(end).format('L') : '',
            };
        },

        duration() {
            const { start, end } = this.dates;
            return start && end ? moment(end).diff(start, 'days') + 1 : 0;
        },

        ratio() {
            return Config.degressiveRate(this.duration);
        },

        grandTotal() {
            const total = getEventOneDayTotal(this.materials);
            const grandTotal = getEventGrandTotal(total, this.duration);
            return formatAmount(grandTotal);
        },
    },
    methods: {
        formatAmount(amount) {
            return formatAmount(amount);
        },
    },
};
