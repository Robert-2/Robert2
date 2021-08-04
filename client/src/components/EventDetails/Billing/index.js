import './index.scss';
import Help from '@/components/Help/Help.vue';
import EventBilling from '@/components/EventBilling/EventBilling.vue';

export default {
  name: 'EventDetailsBilling',
  props: {
    event: { type: Object, required: true },
    lastBill: Object,
    lastEstimate: Object,
  },
  data() {
    return {
      isCreating: false,
      isLoading: false,
      successMessage: null,
      error: null,
    };
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
    async handleCreateBill(discountRate) {
      if (this.isLoading || this.isCreating) {
        return;
      }

      try {
        this.error = null;
        this.successMessage = null;
        this.isCreating = true;

        const { id } = this.event;
        const { data } = await this.$http.post(`events/${id}/bill`, { discountRate });

        this.$emit('createBill', data);
        this.successMessage = this.$t('bill-created');
      } catch (error) {
        this.error = error;
      } finally {
        this.isCreating = false;
      }
    },

    async setEventIsBillable() {
      if (this.isLoading || this.isCreating) {
        return;
      }

      try {
        this.error = null;
        this.successMessage = null;
        this.isLoading = true;

        const { id } = this.event;
        const putData = { is_billable: true };
        const { data } = await this.$http.put(`events/${id}`, putData);

        this.$emit('updateEvent', data);
        this.successMessage = this.$t('event-is-now-billable');
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },
  },
  render() {
    const {
      $t: __,
      event,
      successMessage,
      error,
      hasMaterials,
      lastBill,
      isCreating,
      lastEstimate,
      handleCreateBill,
      userCanEditBill,
      setEventIsBillable,
    } = this;

    return (
      <div class="EventDetailsBilling">
        <Help message={{ type: 'success', text: successMessage }} error={error} />
        {hasMaterials && event.is_billable && (
          <EventBilling
            beneficiaries={event.beneficiaries}
            lastBill={lastBill}
            lastEstimate={lastEstimate}
            allBills={event.bills}
            materials={event.materials}
            start={event.startDate}
            end={event.endDate}
            loading={isCreating}
            onCreateBill={handleCreateBill}
          />
        )}
        {!event.is_billable && (
          <div class="EventDetailsBilling__not-billable">
            <p>
              <i class="fas fa-ban" /> {__('event-not-billable')}
            </p>
            {!event.is_confirmed && userCanEditBill && (
              <p>
                <button onClick={setEventIsBillable} class="success">
                  {__('enable-billable-event')}
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
};
