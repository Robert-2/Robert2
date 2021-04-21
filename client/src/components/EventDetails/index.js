import moment from 'moment';
import { Tabs, Tab } from 'vue-slim-tabs';
import Config from '@/config/globalConfig';
import getDiscountRateFromLast from '@/utils/getDiscountRateFromLast';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';
import EventMaterials from '@/components/EventMaterials/EventMaterials.vue';
import EventMissingMaterials from '@/components/EventMissingMaterials/EventMissingMaterials.vue';
import EventEstimates from '@/components/EventEstimates/EventEstimates.vue';
import EventBilling from '@/components/EventBilling/EventBilling.vue';
import EventTotals from '@/components/EventTotals/EventTotals.vue';
import formatTimelineEvent from '@/utils/timeline-event/format';
import Header from './Header/Header.vue';

export default {
  name: 'EventDetails',
  components: {
    Header,
    Tabs,
    Tab,
    Help,
    EventMaterials,
    EventMissingMaterials,
    EventEstimates,
    EventBilling,
    EventTotals,
  },
  props: {
    eventId: { type: Number, required: true },
  },
  data() {
    return {
      event: null,
      beneficiaries: [],
      discountRate: 0,
      assignees: [],
      showBilling: Config.billingMode !== 'none',
      lastBill: null,
      lastEstimate: null,
      successMessage: null,
      error: null,
      isLoading: false,
      isCreating: false,
      deletingId: null,
    };
  },
  created() {
    this.getEvent();
  },
  computed: {
    hasMaterials() {
      return this.event?.materials?.length > 0;
    },
    userCanEditBill() {
      return this.$store.getters['auth/is'](['admin', 'member']);
    },
  },
  methods: {
    async getEvent() {
      try {
        this.error = null;
        this.successMessage = null;
        this.isLoading = true;

        const { eventId } = this.$props;
        const url = `events/${eventId}`;

        const { data } = await this.$http.get(url);
        this.setData(data);
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },

    handleChangeDiscountRate(discountRate) {
      this.discountRate = discountRate;
    },

    handleChangeTab() {
      this.successMessage = null;

      if (!this.event) {
        return;
      }

      const [lastBill] = this.event.bills;
      const [lastEstimate] = this.event.estimates;
      this.discountRate = getDiscountRateFromLast(lastBill, lastEstimate, this.discountRate);
    },

    async handleCreateEstimate(discountRate) {
      if (this.isCreating || this.deletingId) {
        return;
      }

      try {
        this.error = null;
        this.successMessage = null;
        this.isCreating = true;

        const { id } = this.event;
        const { data } = await this.$http.post(`events/${id}/estimate`, { discountRate });

        this.event.estimates.unshift(data);
        this.lastEstimate = { ...data, date: moment(data.date) };
        this.successMessage = this.$t('estimate-created');
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isCreating = false;
      }
    },

    async handleDeleteEstimate(id) {
      if (this.deletingId || this.isCreating) {
        return;
      }

      const { value } = await Alert.ConfirmDelete(this.$t, 'estimate', false);
      if (!value) {
        return;
      }

      try {
        this.error = null;
        this.successMessage = null;
        this.deletingId = id;

        const { data } = await this.$http.delete(`estimates/${id}`);

        const { estimates } = this.event;
        const newEstimatesList = estimates.filter((estimate) => (estimate.id !== data.id));
        this.event.estimates = newEstimatesList;

        const [lastOne] = newEstimatesList;
        this.lastEstimate = lastOne;
        this.successMessage = this.$t('estimate-deleted');
      } catch (error) {
        this.handleError(error);
      } finally {
        this.deletingId = null;
      }
    },

    async handleCreateBill(discountRate) {
      if (this.deletingId || this.isCreating) {
        return;
      }

      try {
        this.error = null;
        this.successMessage = null;
        this.isCreating = true;
        const { eventId } = this.$props;
        const url = `events/${eventId}/bill`;

        const { data } = await this.$http.post(url, { discountRate });
        this.lastBill = { ...data, date: moment(data.date) };
        this.successMessage = this.$t('bill-created');
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isCreating = false;
      }
    },

    async setEventIsBillable() {
      if (this.isLoading || this.deletingId || this.isCreating) {
        return;
      }

      try {
        this.error = null;
        this.successMessage = null;
        this.isLoading = true;
        const { eventId } = this.$props;
        const putData = { is_billable: true };

        const { data } = await this.$http.put(`events/${eventId}`, putData);
        this.setData(data);
        this.successMessage = this.$t('event-is-now-billable');
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },

    handleSavedFromHeader(newData) {
      this.error = null;
      this.setData(newData);
      // Ne fonctionne pas comme espéré, pffff
      this.$emit('event-updated', newData);
    },

    handleError(error) {
      this.error = error;
      this.isLoading = false;
    },

    setData(data) {
      this.event = {
        ...formatTimelineEvent(data),
        ...data,
      };

      if (data.beneficiaries) {
        this.beneficiaries = data.beneficiaries.map(
          (beneficiary) => ({
            id: beneficiary.id,
            name: beneficiary.full_name,
            company_id: beneficiary.company_id ? beneficiary.company_id : null,
            company: beneficiary.company ? beneficiary.company.legal_name : null,
          }),
        );
      }

      if (data.assignees) {
        this.assignees = data.assignees.map(
          (assignee) => ({ id: assignee.id, name: assignee.full_name }),
        );
      }

      const [lastBill] = data.bills;
      const [lastEstimate] = data.estimates;

      if (lastBill) {
        this.lastBill = { ...lastBill, date: moment(lastBill.date) };
      }

      if (lastEstimate) {
        this.lastEstimate = { ...lastEstimate, date: moment(lastEstimate.date) };
      }

      this.discountRate = getDiscountRateFromLast(lastBill, lastEstimate, this.discountRate);
    },
  },
};
