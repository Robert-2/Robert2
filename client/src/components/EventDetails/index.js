import moment from 'moment';
import { Tabs, Tab } from 'vue-slim-tabs';
import Config from '@/config/globalConfig';
import getDiscountRateFromLast from '@/utils/getDiscountRateFromLast';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';
import LocationText from '@/components/LocationText/LocationText.vue';
import PersonsList from '@/components/PersonsList/PersonsList.vue';
import EventMaterials from '@/components/EventMaterials';
import EventMissingMaterials from '@/components/EventMissingMaterials/EventMissingMaterials.vue';
import ReturnInventorySummary from '@/components/ReturnInventorySummary';
import EventEstimates from '@/components/EventEstimates/EventEstimates.vue';
import EventBilling from '@/components/EventBilling/EventBilling.vue';
import EventTotals from '@/components/EventTotals';
import formatTimelineEvent from '@/utils/timeline-event/format';
import Header from './Header';

export default {
  name: 'EventDetails',
  components: {
    Header,
    Tabs,
    Tab,
    Help,
    LocationText,
    PersonsList,
    EventMaterials,
    EventMissingMaterials,
    ReturnInventorySummary,
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
      technicians: [],
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

    hasMaterialsProblems() {
      return (
        (this.event?.hasMissingMaterials && !this.event?.is_return_inventory_done)
        || this.event?.hasNotReturnedMaterials
      );
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

    handleChangeTab() {
      this.error = null;
      this.successMessage = null;
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
        this.updateDiscountRate();

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

      const { value } = await Alert.ConfirmDelete(this.$t, 'estimate');
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
        this.lastEstimate = lastOne ? { ...lastOne, date: moment(lastOne.date) } : null;
        this.updateDiscountRate();

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

        this.event.bills.unshift(data);
        this.lastBill = { ...data, date: moment(data.date) };
        this.updateDiscountRate();

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

    handleDeletedFromHeader() {
      this.error = null;
      this.$emit('close');
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

      if (data.technicians) {
        this.technicians = data.technicians.map(
          (technician) => ({ id: technician.id, name: technician.full_name }),
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

      this.updateDiscountRate();
    },

    updateDiscountRate() {
      this.discountRate = getDiscountRateFromLast(this.lastBill, this.lastEstimate);
    },
  },
};
