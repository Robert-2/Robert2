import './index.scss';
import moment from 'moment';
import getBookingIcon from '@/utils/getBookingIcon';
import Icon from '@/themes/default/components/Icon';
import Button from '@/themes/default/components/Button';
import Actions from './Actions';

// @vue/component
export default {
    name: 'EventDetailsHeader',
    props: {
        event: { type: Object, required: true },
    },
    data: () => ({
        now: Date.now(),
    }),
    computed: {
        icon() {
            return getBookingIcon(this.event, this.now);
        },

        isOngoing() {
            const { start_date: startDate, end_date: endDate } = this.event;
            return moment(this.now).isBetween(startDate, endDate, 'day', '[]');
        },
    },
    mounted() {
        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60_000);
    },
    beforeDestroy() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleClose() {
            this.$emit('close');
        },
    },
    render() {
        const { $t: __, icon, event, isOngoing, handleClose } = this;

        return (
            <header class="EventDetailsHeader">
                <div class="EventDetailsHeader__status">
                    <Icon name={icon} />
                </div>
                <div class="EventDetailsHeader__details">
                    <h1 class="EventDetailsHeader__details__title">{event.title}</h1>
                    <div class="EventDetailsHeader__details__location-dates">
                        {__('from-date-to-date', {
                            from: moment(event.start_date).format('L'),
                            to: moment(event.end_date).format('L'),
                        })}
                        {isOngoing && (
                            <span class="EventDetailsHeader__details__in-progress">
                                ({__('in-progress')})
                            </span>
                        )}
                    </div>
                </div>
                <Actions
                    event={event}
                    onSaved={(data) => { this.$emit('saved', data); }}
                    onDeleted={(id) => { this.$emit('deleted', id); }}
                    onDuplicated={(newEvent) => { this.$emit('duplicated', newEvent); }}
                />
                <Button
                    type="close"
                    class="EventDetailsHeader__close-button"
                    onClick={handleClose}
                />
            </header>
        );
    },
};
