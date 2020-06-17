import moment from 'moment';
import Config from '@/config/globalConfig';
import EventMaterials from '@/components/EventMaterials/EventMaterials.vue';
import EventMissingMaterials from '@/components/EventMissingMaterials/EventMissingMaterials.vue';
import EventBilling from '@/components/EventBilling/EventBilling.vue';
import EventTotals from '@/components/EventTotals/EventTotals.vue';

export default {
  name: 'EventOverview',
  components: {
    EventMaterials,
    EventMissingMaterials,
    EventBilling,
    EventTotals,
  },
  props: { event: Object },
  data() {
    const [lastBill] = this.event.bills;
    const discountRate = lastBill ? lastBill.discount_rate : 0;

    return {
      showBilling: Config.billingMode !== 'none',
      lastBill: lastBill ? { ...lastBill, date: moment(lastBill.date) } : null,
      billLoading: false,
      discountRate,
    };
  },
  computed: {
    startDate() {
      return moment(this.event.start_date);
    },

    endDate() {
      return moment(this.event.end_date);
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

    handleCreateBill(discountRate) {
      this.billLoading = true;
      const { id } = this.event;
      this.$http.post(`events/${id}/bill`, { discountRate })
        .then(({ data }) => {
          this.lastBill = { ...data, date: moment(data.date) };
        })
        .catch(this.handleError)
        .finally(() => {
          this.billLoading = false;
        });
    },
  },
};
