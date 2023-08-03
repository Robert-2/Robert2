import './index.scss';
import EventTechnicianItem from './Item';
import Icon from '@/themes/default/components/Icon';

// @vue/component
export default {
    name: 'EventTechnicians',
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
            <div class="EventTechnicians">
                {uniqueTechnicians.length === 0 && warningEmptyText && (
                    <div class="EventTechnicians__nobody">
                        <Icon name="exclamation-circle" /> {warningEmptyText}
                    </div>
                )}
                {uniqueTechnicians.length > 0 && (
                    <div class="EventTechnicians__list">
                        <span class="EventTechnicians__list__label">
                            <Icon name="people-carry" class="EventTechnicians__list__label__icon" />
                            {__('with')}
                        </span>
                        <span class="EventTechnicians__list__items">
                            {uniqueTechnicians.map(({ id, technician }) => (
                                <span class="EventTechnicians__list__item">
                                    <EventTechnicianItem key={id} technician={technician} />
                                </span>
                            ))}
                        </span>
                    </div>
                )}
            </div>
        );
    },
};
