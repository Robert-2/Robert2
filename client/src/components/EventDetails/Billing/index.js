import Help from '@/components/Help/Help.vue';
import EventBilling from '@/components/EventBilling/EventBilling.vue';
import EventNotBillable from '@/components/EventNotBillable';

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
    },
    render() {
        const {
            event,
            successMessage,
            error,
            hasMaterials,
            lastBill,
            isCreating,
            lastEstimate,
            handleCreateBill,
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
          <EventNotBillable
            eventId={event.id}
            isEventConfirmed={event.is_confirmed}
            onBillingEnabled={(data) => { this.$emit('billingEnabled', data); }}
          />
        )}
      </div>
        );
    },
};
