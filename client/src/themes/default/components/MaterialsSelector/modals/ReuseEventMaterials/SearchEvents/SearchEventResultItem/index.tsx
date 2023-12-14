import './index.scss';
import moment from 'moment';
import { defineComponent } from '@vue/composition-api';
import Button from '@/themes/default/components/Button';
import computeFullDurations from '@/utils/computeFullDurations';

import type { PropType } from '@vue/composition-api';
import type { EventSummary } from '@/stores/api/events';

type Props = {
    /** L'événement à afficher. */
    event: EventSummary,
};

// @vue/component
const SearchEventResultItem = defineComponent({
    props: {
        event: {
            type: Object as PropType<Required<Props>['event']>,
            required: true,
        },
    },
    computed: {
        start() {
            const { event } = this;
            return moment(event.start_date);
        },

        end() {
            const { event } = this;
            return moment(event.end_date);
        },

        duration() {
            const { start, end } = this;
            return computeFullDurations(start, end);
        },
    },
    methods: {
        handleSelect() {
            const { id } = this.event;
            this.$emit('select', id);
        },
    },
    render() {
        const { $t: __, event, duration, start, end, handleSelect } = this;

        return (
            <li class="SearchEventResultItem">
                <span class="SearchEventResultItem__title">
                    {event.title} {event.location && <em>({event.location})</em>}
                </span>
                <span class="SearchEventResultItem__dates">
                    {duration.days === 1 && __('on-date', { date: start.format('LL') })}
                    {duration.days > 1 && __(
                        'from-date-to-date',
                        { from: start.format('L'), to: end.format('L') },
                    )}
                </span>
                <Button
                    type="primary"
                    class="SearchEventResultItem__select"
                    onClick={handleSelect}
                >
                    {__('choose')}
                </Button>
            </li>
        );
    },
});

export default SearchEventResultItem;
