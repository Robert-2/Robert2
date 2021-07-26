import moment from 'moment';
import { Tabs, Tab } from 'vue-slim-tabs';
import Config from '@/config/globalConfig';
import getDiscountRateFromLast from '@/utils/getDiscountRateFromLast';
import formatEventTechniciansList from '@/utils/formatEventTechniciansList';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';
import EventMaterials from '@/components/EventMaterials';
import EventMissingMaterials from '@/components/EventMissingMaterials/EventMissingMaterials.vue';
import EventBilling from '@/components/EventBilling/EventBilling.vue';
import EventEstimates from '@/components/EventEstimates/EventEstimates.vue';
import EventTotals from '@/components/EventTotals';

export default {
  name: 'EventOverview',
  components: {
    Tabs,
    Tab,
    Help,
    EventMaterials,
    EventMissingMaterials,
    EventBilling,
    EventEstimates,
    EventTotals,
  },
  props: { event: Object },
  data() {
    const [lastBill] = this.event.bills;
    const [lastEstimate] = this.event.estimates;

    return {
      showBilling: Config.billingMode !== 'none',
      lastBill: lastBill ? { ...lastBill, date: moment(lastBill.date) } : null,
      lastEstimate: lastEstimate ? { ...lastEstimate, date: moment(lastEstimate.date) } : null,
      isCreating: false,
      deletingId: null,
      successMessage: null,
      error: null,
      discountRate: getDiscountRateFromLast(lastBill, lastEstimate),
    };
  },
  computed: {
    startDate() {
      return moment(this.event.start_date);
    },

    endDate() {
      return moment(this.event.end_date);
    },

    technicians() {
      return formatEventTechniciansList(this.event.technicians);
    },

    hasMaterials() {
      return this.event.materials.length > 0;
    },

    fromToDates() {
      return {
        from: this.startDate.format('L'),
        to: this.endDate.format('L'),
      };
    },

    duration() {
      const { start_date: start, end_date: end } = this.event;
      return (start && end) ? moment(end).diff(start, 'days') + 1 : 0;
    },
  },
  methods: {
    handleChangeDiscountRate(discountRate) {
      this.discountRate = discountRate;
    },

    handleChangeBillingTab() {
      this.successMessage = null;
      this.updateDiscountRate();
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
        this.error = error;
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
        this.error = error;
      } finally {
        this.deletingId = null;
      }
    },

    async handleCreateBill(discountRate) {
      if (this.isCreating || this.deletingId) {
        return;
      }

      try {
        this.error = null;
        this.successMessage = null;
        this.isCreating = true;

        const { id } = this.event;
        const { data } = await this.$http.post(`events/${id}/bill`, { discountRate });

        this.event.bills.unshift(data);
        this.lastBill = { ...data, date: moment(data.date) };
        this.updateDiscountRate();

        this.successMessage = this.$t('bill-created');
      } catch (error) {
        this.error = error;
      } finally {
        this.isCreating = false;
      }
    },

    updateDiscountRate() {
      this.discountRate = getDiscountRateFromLast(this.lastBill, this.lastEstimate);
    },
  },
};
