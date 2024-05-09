import './index.scss';
import upperFirst from 'lodash/upperFirst';
import { defineComponent } from '@vue/composition-api';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { EventSummary } from '@/stores/api/events';

type Props = {
    /** L'événement à afficher. */
    event: EventSummary,
};

/** Un résultat de recherche d'événement. */
const SearchEventResultItem = defineComponent({
    name: 'SearchEventResultItem',
    props: {
        event: {
            type: Object as PropType<Required<Props>['event']>,
            required: true,
        },
    },
    emits: ['select'],
    methods: {
        handleSelect() {
            const { id } = this.event;
            this.$emit('select', id);
        },
    },
    render() {
        const { $t: __, event, handleSelect } = this;

        return (
            <li class="SearchEventResultItem">
                <span class="SearchEventResultItem__title">
                    {event.title} {event.location && <em>({event.location})</em>}
                </span>
                <span class="SearchEventResultItem__dates">
                    {upperFirst(event.operation_period.toReadable(__))}
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
