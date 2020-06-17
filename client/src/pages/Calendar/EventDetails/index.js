import moment from 'moment';
import { Tabs, Tab } from 'vue-slim-tabs';
import Config from '@/config/globalConfig';
import Help from '@/components/Help/Help.vue';
import EventMaterials from '@/components/EventMaterials/EventMaterials.vue';
import EventMissingMaterials from '@/components/EventMissingMaterials/EventMissingMaterials.vue';
import EventBilling from '@/components/EventBilling/EventBilling.vue';
import EventTotals from '@/components/EventTotals/EventTotals.vue';
import utils from '../utils';
import Header from './Header/Header.vue';

export default {
  name: 'CalendarEventDetails',
  components: {
    Header,
    Tabs,
    Tab,
    Help,
    EventMaterials,
    EventMissingMaterials,
    EventBilling,
    EventTotals,
  },
  props: ['eventId'],
  data() {
    return {
      help: '',
      error: null,
      isLoading: false,
      event: null,
      beneficiaries: [],
      discountRate: 0,
      assignees: [],
      showBilling: Config.billingMode !== 'none',
      lastBill: null,
      billLoading: false,
    };
  },
  created() {
    this.getEvent();
  },
  computed: {
    hasMaterials() {
      return this.event.materials.length > 0;
    },
  },
  methods: {
    getEvent() {
      const { eventId } = this.$props;
      const url = `${this.$route.meta.resource}/${eventId}`;
      this.error = null;
      this.isLoading = true;
      this.$http.get(url)
        .then(({ data }) => {
          this.setData(data);
          this.isLoading = false;
        })
        .catch(this.handleError);
    },

    handleChangeDiscountRate(discountRate) {
      this.discountRate = discountRate;
    },

    handleCreateBill(discountRate) {
      this.error = null;
      this.billLoading = true;
      const { eventId } = this.$props;
      const url = `${this.$route.meta.resource}/${eventId}/bill`;
      this.$http.post(url, { discountRate })
        .then(({ data }) => {
          this.lastBill = { ...data, date: moment(data.date) };
        })
        .catch(this.handleError)
        .finally(() => {
          this.billLoading = false;
        });
    },

    setEventIsBillable() {
      this.error = null;
      this.isLoading = true;
      const { eventId } = this.$props;
      const putData = { is_billable: true };
      this.$http.put(`${this.$route.meta.resource}/${eventId}`, putData)
        .then(({ data }) => {
          this.setData(data);
          this.isLoading = false;
        })
        .catch(this.handleError);
    },

    handleSaved(newData) {
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
        ...utils.formatEvent(data),
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

      if (data.bills.length > 0) {
        const [lastBill] = data.bills;
        this.lastBill = { ...lastBill, date: moment(lastBill.date) };
        this.discountRate = lastBill ? lastBill.discount_rate : 0;
      }
    },
  },
};
