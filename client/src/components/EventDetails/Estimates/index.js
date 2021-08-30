import Alert from '@/components/Alert';
import Help from '@/components/Help';
import EventEstimates from '@/components/EventEstimates';
import EventNotBillable from '@/components/EventNotBillable';

// @vue/component
export default {
    name: 'EventDetailsEstimates',
    props: {
        event: { type: Object, required: true },
    },
    data: () => ({
        isCreating: false,
        deletingId: null,
        isLoading: false,
        successMessage: null,
        error: null,
    }),
    computed: {
        hasMaterials() {
            return this.event?.materials?.length > 0;
        },

        userCanEditEstimate() {
            return this.$store.getters['auth/is'](['admin', 'member']);
        },
    },
    methods: {
        async handleCreateEstimate(discountRate) {
            if (this.isLoading || this.isCreating || this.deletingId) {
                return;
            }

            try {
                this.error = null;
                this.successMessage = null;
                this.isCreating = true;

                const { id } = this.event;
                const { data } = await this.$http.post(`events/${id}/estimate`, { discountRate });

                this.$emit('createEstimate', data);
                this.successMessage = this.$t('estimate-created');
            } catch (error) {
                this.error = error;
            } finally {
                this.isCreating = false;
            }
        },

        async handleDeleteEstimate(id) {
            if (this.isLoading || this.deletingId || this.isCreating) {
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

                this.$emit('deleteEstimate', data.id);
                this.successMessage = this.$t('estimate-deleted');
            } catch (error) {
                this.error = error;
            } finally {
                this.deletingId = null;
            }
        },
    },
    render() {
        const {
            event,
            successMessage,
            error,
            hasMaterials,
            isCreating,
            deletingId,
            handleCreateEstimate,
            handleDeleteEstimate,
        } = this;

        return (
            <div class="EventDetailsEstimates">
                <Help message={{ type: 'success', text: successMessage }} error={error} />
                {hasMaterials && event.is_billable && (
                    <EventEstimates
                        event={event}
                        loading={isCreating}
                        deletingId={deletingId}
                        onCreateEstimate={handleCreateEstimate}
                        onDeleteEstimate={handleDeleteEstimate}
                    />
                )}
                {!event.is_billable && (
                    <EventNotBillable
                        eventId={event.id}
                        isEventConfirmed={event.is_confirmed}
                        onBillingEnabled={(data) => {
                            this.$emit('billingEnabled', data);
                        }}
                    />
                )}
            </div>
        );
    },
};
