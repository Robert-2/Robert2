import './index.scss';
import moment from 'moment';
import { TECHNICIAN_EVENT_MIN_DURATION } from '@/config/constants';
import FormField from '@/components/FormField';
import ErrorMessage from '@/components/ErrorMessage';

const EventStep3Modal = {
  name: 'EventStep3Modal',
  props: {
    eventDates: { type: Object, required: true },
    data: {
      required: true,
      validator(value) {
        if (!['object', 'number'].includes(typeof value)) {
          return false;
        }

        // -> Édition : Id du TechnicianEvent passé directement
        if (typeof value === 'number') {
          return true;
        }

        // -> Création : Données de base
        const dataRequirements = {
          eventId: { type: Number, required: true },
          technician: { type: Object, required: true },
          startTime: { type: String },
        };
        return !Object.entries(dataRequirements).some(
          ([field, { type, required = false }]) => (
            !(field in value)
            || (required && value[field] === undefined)
            || (value[field] !== undefined && value[field].constructor !== type)
          ),
        );
      },
    },
  },
  data() {
    const { data } = this.$props;

    const baseData = {
      position: '',
      isSaving: false,
      error: null,
      isNew: false,
      eventId: null,
      technician: null,
      dates: [null, null],
    };

    if (typeof data === 'number') {
      return baseData;
    }

    const startDate = moment(data.startTime).toDate();
    const endDate = moment(data.startTime).add(TECHNICIAN_EVENT_MIN_DURATION).toDate();
    return {
      ...baseData,
      isNew: true,
      eventId: data.eventId,
      technician: data.technician,
      dates: [startDate, endDate],
    };
  },
  computed: {
    name() {
      return this.technician?.full_name || null;
    },

    datePickerOptions() {
      const { start, end } = this.$props.eventDates;

      return {
        withTime: true,
        isRange: true,
        disabled: { notBetween: [start, end] },
      };
    },
  },
  mounted() {
    if (typeof this.$props.data === 'number') {
      this.fetchTechnicianEvent();
    }
  },
  methods: {
    // ------------------------------------------------------
    // -
    // -    Handlers
    // -
    // ------------------------------------------------------

    handleSubmit(e) {
      e.preventDefault();
      this.save();
    },

    handleClose() {
      this.$emit('close');
    },

    // ------------------------------------------------------
    // -
    // -    Methods
    // -
    // ------------------------------------------------------

    fetchTechnicianEvent() {
      console.log('fetch du TechnicianEvent');
    },

    async save() {
      if (this.isSaving) {
        return;
      }

      this.isSaving = true;

      const { position, dates, eventId, technician } = this;
      const postData = {
        start: moment(dates[0]).format(),
        end: moment(dates[1]).format(),
        position,
      };

      try {
        await this.$http.post(`events/${eventId}/technician/${technician.id}`, postData);
        this.$emit('close');
      } catch (error) {
        this.error = error;
      } finally {
        this.isSaving = false;
      }
    },
  },
  render() {
    const { $t: __, name, isSaving, error, datePickerOptions, handleSubmit, handleClose } = this;

    return (
      <div class="EventStep3Modal">
        <header class="EventStep3Modal__header">
          <h1 class="EventStep3Modal__header__title">
            {__('page-events.assign-technician', { name })}
          </h1>
          <button class="close" onClick={handleClose}>
            <i class="fas fa-times" />
          </button>
        </header>
        <div class="EventStep3Modal__body">
          <form class="EventStep3Modal__form" onSubmit={handleSubmit}>
            <FormField
              type="date"
              v-model={this.dates}
              name="dates"
              label={__('page-events.period-assigned')}
              placeholder={__('page-events.start-end-dates-and-time')}
              datepickerOptions={datePickerOptions}
            />
            <FormField
              v-model={this.position}
              name="position"
              label={`${__('position-held')} (${__('optional')})`}
            />
            {error && <ErrorMessage error={error} />}
            <div class="EventStep3Modal__form__actions">
              <button type="submit" class="success" disabled={isSaving}>
                {isSaving ? <i class="fas fa-circle-notch fa-spin" /> : <i class="fas fa-check" />}{' '}
                {isSaving ? __('saving') : __('page-events.assign-this-technician')}
              </button>
              <button type="button" onClick={handleClose}>
                <i class="fas fa-ban" /> {__('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
};

export default EventStep3Modal;
