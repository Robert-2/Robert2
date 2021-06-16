import './index.scss';
import moment from 'moment';
import { DATE_DB_FORMAT } from '@/config/constants';
import FormField from '@/components/FormField';
import LocationText from '@/components/LocationText/LocationText.vue';
import PersonsList from '@/components/PersonsList/PersonsList.vue';
import getMaterialItemsCount from '@/utils/getMaterialItemsCount';

export default {
  name: 'DuplicateEvent',
  props: {
    event: Object,
  },
  data() {
    return {
      dates: {
        startDate: null,
        endDate: null,
      },
      startDatepickerOptions: {
        format: 'd MMMM yyyy',
        disabled: { from: null, to: new Date() },
      },
      endDatepickerOptions: {
        format: 'd MMMM yyyy',
        disabled: { from: null, to: null },
      },
      error: null,
      validationErrors: null,
      isSaving: false,
    };
  },
  computed: {
    duration() {
      const { startDate, endDate } = this.dates;
      if (!startDate || !endDate) {
        return null;
      }
      return moment(endDate).diff(startDate, 'days') + 1;
    },

    itemsCount() {
      return getMaterialItemsCount(this.event.materials);
    },
  },
  methods: {
    refreshDatesLimits() {
      const { startDate } = this.dates;
      if (!startDate) {
        return;
      }

      this.endDatepickerOptions.disabled.to = moment(startDate).toDate();
    },

    handleStartDateChange({ newDate }) {
      const { endDate } = this.dates;

      if (endDate) {
        const start = moment(newDate);
        const end = moment(endDate);
        if (end.isBefore(start)) {
          this.dates.endDate = start.toDate();
        }
      }

      this.refreshDatesLimits();
    },

    async handleSubmit() {
      if (this.isSaving) {
        return;
      }

      this.isSaving = true;
      this.error = false;
      this.validationErrors = false;

      const currentUser = this.$store.state.auth.user;

      const newEventData = {
        user_id: currentUser.id,
        start_date: moment(this.dates.startDate).startOf('day').format(DATE_DB_FORMAT),
        end_date: moment(this.dates.endDate).endOf('day').format(DATE_DB_FORMAT),
      };

      try {
        const url = `events/${this.event.id}/duplicate`;
        const { data } = await this.$http.post(url, newEventData);

        console.log(data);

        this.$emit('close');
      } catch (error) {
        this.error = error;

        const { code, details } = error.response?.data?.error || { code: 0, details: {} };
        if (code === 400) {
          this.validationErrors = { ...details };
        }
      } finally {
        this.isSaving = false;
      }
    },

    handleClose() {
      this.$emit('close');
    },
  },
  render() {
    const {
      $t: __,
      dates,
      duration,
      itemsCount,
      error,
      validationErrors,
      startDatepickerOptions,
      endDatepickerOptions,
      refreshDatesLimits,
      handleStartDateChange,
      handleSubmit,
      handleClose,
    } = this;

    const {
      title,
      location,
      beneficiaries,
      assignees,
    } = this.event;

    return (
      <div class="DuplicateEvent">
        <div class="DuplicateEvent__header">
          <h2 class="DuplicateEvent__header__title">
            {this.$t('duplicate-the-event', { title })}
          </h2>
          <button class="DuplicateEvent__header__btn-close" onClick={handleClose}>
            <i class="fas fa-times" />
          </button>
        </div>
        <div class="DuplicateEvent__main">
          <h4 class="DuplicateEvent__main__help">
            {this.$t('dates-of-duplicated-event')}
          </h4>
          <div class="DuplicateEvent__main__dates">
            <div class="DuplicateEvent__main__dates__fields">
              <FormField
                v-model={dates.startDate}
                name="start_date"
                label="start-date"
                type="date"
                required
                errors={validationErrors?.start_date}
                datepickerOptions={startDatepickerOptions}
                onChange={handleStartDateChange}
              />
              <FormField
                v-model={dates.endDate}
                name="end_date"
                label="end-date"
                type="date"
                required
                errors={validationErrors?.end_date}
                datepickerOptions={endDatepickerOptions}
                onChange={refreshDatesLimits}
              />
            </div>
            <div class="DuplicateEvent__main__dates__duration">
              {duration && (
                <span>
                  <i class="fas fa-clock" />{' '}
                  {__('duration-days', { duration }, duration)}
                </span>
              )}
            </div>
          </div>
          <div class="DuplicateEvent__main__infos">
              {location && <LocationText location={location} />}
              <PersonsList
                type="beneficiaries"
                persons={beneficiaries.map(({ id, full_name: name }) => ({ id, name }))}
                warningEmptyText={__('page-events.warning-no-beneficiary')}
              />
              <PersonsList
                type="technicians"
                persons={assignees.map(({ id, full_name: name }) => ({ id, name }))}
              />
              <div class="DuplicateEvent__main__infos__items-count">
                <i class="fas fa-box" />{' '}
                {__('items-count', { count: itemsCount }, itemsCount)}
              </div>
          </div>
          {error && (
            <p class="DuplicateEvent__main__error">
              <i class="fas fa-exclamation-triangle" /> {error.message}
            </p>
          )}
        </div>
        <hr />
        <div class="DuplicateEvent__footer">
          <button onClick={handleSubmit} class="success">
            <i class="fas fa-check" /> {__('duplicate-event')}
          </button>
          <button onClick={handleClose}>
            <i class="fas fa-times" /> {__('close')}
          </button>
        </div>
      </div>
    );
  },
};
