import './index.scss';
import moment from 'moment';
import { Tabs, Tab } from 'vue-slim-tabs';
import Config from '@/globals/config';
import getEventDiscountRate from '@/utils/getEventDiscountRate';
import formatEventTechniciansList from '@/utils/formatEventTechniciansList';
import Alert from '@/components/Alert';
import Help from '@/components/Help';
import EventMaterials from '@/components/EventMaterials';
import EventMissingMaterials from '@/components/EventMissingMaterials';
import EventBilling from '@/components/EventBilling';
import EventEstimates from '@/components/EventEstimates';
import EventTotals from '@/components/EventTotals';

// @vue/component
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
    props: {
        event: { type: Object, required: true },
    },
    data: () => ({
        unsavedDiscountRate: null,
        showBilling: Config.billingMode !== 'none',
        isCreating: false,
        deletingId: null,
        successMessage: null,
        error: null,
    }),
    computed: {
        technicians() {
            return formatEventTechniciansList(this.event.technicians);
        },

        hasMaterials() {
            return this.event.materials.length > 0;
        },

        fromToDates() {
            return {
                from: moment(this.event.start_date).format('L'),
                to: moment(this.event.end_date).format('L'),
            };
        },

        duration() {
            const { start_date: start, end_date: end } = this.event;
            return start && end ? moment(end).diff(start, 'days') + 1 : 0;
        },

        hasBill() {
            return this.event.bills.length > 0;
        },

        discountRate() {
            if (this.unsavedDiscountRate !== null) {
                return this.unsavedDiscountRate;
            }
            return getEventDiscountRate(this.event);
        },
    },
    methods: {
        handleChangeDiscountRate(discountRate) {
            this.unsavedDiscountRate = discountRate ?? null;
        },

        handleChangeBillingTab() {
            this.successMessage = null;
            this.unsavedDiscountRate = null;
        },

        async handleCreateEstimate(discountRate) {
            if (this.isCreating || this.deletingId) {
                return;
            }

            try {
                this.error = null;
                this.successMessage = null;
                this.isCreating = true;

                const { id, estimates: prevEstimates } = this.event;
                const { data: newEstimate } = await this.$http.post(`events/${id}/estimate`, { discountRate });
                this.successMessage = this.$t('estimate-created');
                this.unsavedDiscountRate = null;

                const updatedEvent = { ...this.event, estimates: [newEstimate, ...prevEstimates] };
                this.$emit('updateEvent', updatedEvent);
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
                this.successMessage = this.$t('estimate-deleted');

                const updatedEvent = {
                    ...this.event,
                    estimates: this.event.estimates.filter(
                        (estimate) => estimate.id !== data.id,
                    ),
                };
                this.$emit('updateEvent', updatedEvent);
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

                const { id, bills: prevBills } = this.event;
                const { data: newBill } = await this.$http.post(`events/${id}/bill`, { discountRate });
                this.successMessage = this.$t('bill-created');
                this.unsavedDiscountRate = null;

                const updatedEvent = { ...this.event, bills: [newBill, ...prevBills] };
                this.$emit('updateEvent', updatedEvent);
            } catch (error) {
                this.error = error;
            } finally {
                this.isCreating = false;
            }
        },
    },
};
