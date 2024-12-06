import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';
import Item from './Item';

// @vue/component
const EventDetailsTechnicians = defineComponent({
    name: 'EventDetailsTechnicians',
    props: {
        eventTechnicians: { type: Array, required: true },
        warningEmptyText: { type: String, default: null },
    },
    computed: {
        uniqueTechnicians() {
            return this.eventTechnicians.filter((eventTechnician, index, self) => (
                eventTechnician.technician && self.findIndex(
                    ({ technician }) => (technician && technician.id === eventTechnician.technician.id),
                ) === index
            ));
        },
    },
    render() {
        const { $t: __, uniqueTechnicians, warningEmptyText } = this;

        return (
            <div class="EventDetailsTechnicians">
                {uniqueTechnicians.length === 0 && warningEmptyText && (
                    <div class="EventDetailsTechnicians__nobody">
                        <Icon name="exclamation-circle" /> {warningEmptyText}
                    </div>
                )}
                {uniqueTechnicians.length > 0 && (
                    <div class="EventDetailsTechnicians__list">
                        <span class="EventDetailsTechnicians__list__label">
                            <Icon name="people-carry" class="EventDetailsTechnicians__list__label__icon" />
                            {__('with')}
                        </span>
                        <span class="EventDetailsTechnicians__list__items">
                            {uniqueTechnicians.map(({ id, technician }) => (
                                <span class="EventDetailsTechnicians__list__item">
                                    <Item key={id} technician={technician} />
                                </span>
                            ))}
                        </span>
                    </div>
                )}
            </div>
        );
    },
});

export default EventDetailsTechnicians;
