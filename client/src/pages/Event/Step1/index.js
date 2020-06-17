import moment from 'moment';
import Config from '@/config/globalConfig';
import { DATE_DB_FORMAT } from '@/config/constants';
import FormField from '@/components/FormField/FormField.vue';
import EventStore from '../EventStore';

export default {
  name: 'EventStep1',
  components: { FormField },
  props: {
    event: Object,
  },
  data() {
    return {
      startDatepickerOptions: {
        format: 'd MMMM yyyy',
        disabled: {
          from: null,
          to: null,
        },
      },
      endDatepickerOptions: {
        format: 'd MMMM yyyy',
        disabled: {
          from: null,
          to: null,
        },
      },
      initialStartDate: null,
      duration: 0,
      showIsBillable: Config.billingMode === 'partial',
      errors: {
        title: null,
        start_date: null,
        end_date: null,
        location: null,
        description: null,
      },
    };
  },
  mounted() {
    if (!this.event.id && this.$route.query.startDate) {
      const newDate = moment(this.$route.query.startDate).toDate();
      this.refreshDateFieldLimit({ field: 'start_date', newDate });
    }
    this.refreshDatesLimits();
  },
  watch: {
    event: 'refreshDatesLimits',
  },
  methods: {
    refreshDatesLimits() {
      const { start_date: startDate } = this.event;
      if (startDate) {
        this.initialStartDate = moment(startDate);
        this.endDatepickerOptions.disabled.to = moment(startDate).toDate();
      }
      this.calcDuration();
    },

    handleStartDateChange({ field, newDate }) {
      const oldStart = this.initialStartDate;
      const { end_date: endDate } = this.event;

      if (field === 'start_date' && endDate) {
        const newStart = moment(newDate);
        if (oldStart) {
          const offset = newStart.diff(oldStart, 'days');
          if (offset) {
            const end = moment(endDate);
            this.event.end_date = end.add(offset, 'days').toDate();
          }
        }

        this.initialStartDate = newStart;
      }

      this.refreshDateFieldLimit({ field, newDate });
    },

    refreshDateFieldLimit({ field, newDate }) {
      if (field === 'start_date') {
        this.endDatepickerOptions.disabled.to = newDate;
      }

      this.calcDuration();
      this.checkIsSavedEvent();
    },

    calcDuration() {
      const { start_date: startDate, end_date: endDate } = this.event;
      if (startDate && endDate) {
        this.duration = moment(endDate).diff(startDate, 'days') + 1;
      }
    },

    checkIsSavedEvent() {
      EventStore.dispatch('checkIsSaved', this.event);
    },

    saveAndBack(e) {
      e.preventDefault();
      this.save({ gotoStep: false });
    },

    saveAndNext(e) {
      e.preventDefault();
      this.save({ gotoStep: 2 });
    },

    displayError(error) {
      this.$emit('error', error);

      const { code, details } = error.response?.data?.error || { code: 0, details: {} };
      if (code === 400) {
        this.errors = { ...details };
      }
    },

    save(options) {
      this.$emit('loading');
      const { id } = this.event;
      const { resource } = this.$route.meta;

      let request = this.$http.post;
      let route = resource;
      if (id) {
        request = this.$http.put;
        route = `${resource}/${id}`;
      }

      // - We use "Object Rest Spread" operator here,
      // - to omit unnecessary data before sending to API
      const {
        user,
        beneficiaries,
        assignees,
        materials,
        ...saveData
      } = this.event;

      const postData = {
        ...saveData,
        start_date: moment(this.event.start_date).startOf('day').format(DATE_DB_FORMAT),
        end_date: moment(this.event.end_date).endOf('day').format(DATE_DB_FORMAT),
      };
      request(route, postData)
        .then(({ data }) => {
          const { gotoStep } = options;
          if (!gotoStep) {
            this.$router.push('/');
            return;
          }
          EventStore.commit('setIsSaved', true);
          this.$emit('updateEvent', data);
          this.$emit('gotoStep', gotoStep);
        })
        .catch(this.displayError);
    },
  },
};
