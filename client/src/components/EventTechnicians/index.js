import './index.scss';
import EventTechnicianItem from './Item';

export default {
  name: 'EventTechnicians',
  props: {
    eventTechnicians: Array,
    warningEmptyText: String,
  },
  computed: {
    uniqueTechnicians() {
      return this.eventTechnicians.filter((eventTechnician, index, self) => (
        self.findIndex(
          ({ technician }) => (technician.id === eventTechnician.technician.id),
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
            <i class="fas fa-exclamation-circle" /> {warningEmptyText}
          </div>
        )}
        {uniqueTechnicians.length > 0 && (
          <div class="EventTechnicians__list">
            <span>
              <i class="fas fa-people-carry EventTechnicians__icon" /> {__('with')}
            </span>
            {uniqueTechnicians.map(({ id, technician }) => (
              <EventTechnicianItem key={id} technician={technician} />
            ))}
          </div>
        )}
      </div>
    );
  },
};
