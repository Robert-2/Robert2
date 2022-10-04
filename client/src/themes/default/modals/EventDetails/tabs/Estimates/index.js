import Help from '@/themes/default/components/Help';
import EventEstimates from '@/themes/default/components/EventEstimates';
import NotBillable from '../@shared/NotBillable';
import { Group } from '@/stores/api/groups';
import apiEstimates from '@/stores/api/estimates';
import { confirm } from '@/utils/alert';

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
            return this.$store.getters['auth/is']([Group.ADMIN, Group.MEMBER]);
        },
    },
    methods: {
        async handleCreateEstimate(discountRate) {
            if (this.isLoading || this.isCreating || this.deletingId) {
                return;
            }
            this.isCreating = true;

            this.error = null;
            this.successMessage = null;
            const { $t: __, event: { id } } = this;

            try {
                const { data } = await this.$http.post(`events/${id}/estimate`, { discountRate });

                this.$emit('createEstimate', data);
                this.successMessage = __('estimate-created');
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

            const { $t: __ } = this;
            const { value: isConfirmed } = await confirm({
                type: 'warning',
                text: __('confirm-delete-estimate'),
                confirmButtonText: __('yes-delete'),
            });
            if (!isConfirmed) {
                return;
            }

            this.error = null;
            this.successMessage = null;
            this.deletingId = id;

            try {
                await apiEstimates.remove(id);

                this.$emit('deleteEstimate', id);
                this.successMessage = __('estimate-deleted');
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
                    <NotBillable
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
