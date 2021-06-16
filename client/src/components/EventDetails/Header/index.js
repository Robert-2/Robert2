import './index.scss';
import getMainIcon from '@/utils/timeline-event/getMainIcon';
import Actions from './Actions';

export default {
  name: 'CalendarEventDetailsHeader',
  props: {
    event: { type: Object, required: true },
  },
  computed: {
    mainIcon() {
      const withProblem = this.event.hasMissingMaterials || this.event.hasNotReturnedMaterials;
      return withProblem ? 'exclamation-triangle' : getMainIcon(this.event);
    },

    fromToDates() {
      return {
        from: this.event?.startDate.format('L') || '?',
        to: this.event?.endDate.format('L') || '?',
      };
    },
  },
  render() {
    const {
      $t: __,
      event,
      mainIcon,
      fromToDates,
    } = this;

    return (
      <header class="EventDetailsHeader">
        <div class="EventDetailsHeader__status">
          <i class={`fas fa-${mainIcon}`} />
        </div>
        <div class="EventDetailsHeader__details">
          <h4 class="EventDetailsHeader__details__title">
            {event.title}
          </h4>
          <div class="EventDetailsHeader__details__location-dates">
            {__('from-date-to-date', fromToDates)}
            {event.isCurrent && (
              <span class="EventDetailsHeader__details__in-progress">
                {' '}({__('in-progress')})
              </span>
            )}
          </div>
        </div>
        <Actions
          event={event}
          onSaved={(data) => { this.$emit('saved', data); }}
          onError={(error) => { this.$emit('error', error); }}
        />
        <button class="close" onClick={() => { this.$emit('close'); }}>
          <i class="fas fa-times" />
        </button>
      </header>
    );
  },
};
