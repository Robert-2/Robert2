import './EventReturn.scss';
import moment from 'moment';
import { confirm } from '@/utils/alert';
import formatAmount from '@/utils/formatAmount';
import EventReturnHeader from './Header';
import MaterialsList from './MaterialsList';

const EventReturnPage = {
    name: 'EventReturn',
    components: { EventReturnHeader, MaterialsList },
    data() {
        return {
            help: 'page-event-return.help',
            error: null,
            validationErrors: null,
            isLoading: false,
            isSaving: false,
            isTerminating: false,
            displayGroup: 'categories',
            event: {
                id: this.$route.params.id || null,
                materials: [],
                beneficiaries: [],
            },
            endDate: null,
            quantities: [],
        };
    },
    computed: {
        isPast() {
            return this.endDate ? this.endDate.isSameOrBefore(new Date(), 'day') : false;
        },

        isDone() {
            return !!this.event.is_return_inventory_done;
        },
    },
    mounted() {
        this.getEventData();
    },
    methods: {
        formatAmount(amount) {
            return formatAmount(amount);
        },

        async getEventData() {
            const { id } = this.event;
            if (!id) {
                return;
            }

            this.isLoading = true;

            try {
                const { data } = await this.$http.get(`events/${id}`);
                this.setEventData(data);
            } catch (error) {
                this.event.id = null;
                this.displayError(error);
            }
        },

        setEventData(data) {
            this.help = 'page-event-return.help';
            this.error = null;
            this.validationErrors = null;
            this.isLoading = false;
            this.isSaving = false;
            this.isTerminating = false;

            this.event = data;
            this.endDate = moment(data.end_date);

            this.initQuantities();

            this.$store.commit('setPageSubTitle', data.title);
        },

        initQuantities() {
            const { materials } = this.event;

            this.quantities = materials.map(({ id, pivot }) => ({
                id,
                awaited_quantity: pivot.quantity || 0,
                actual: pivot.quantity_returned || 0,
                broken: pivot.quantity_broken || 0,
            }));
        },

        handleChange(id, quantities) {
            const index = this.quantities.findIndex(({ id: _id }) => id === _id);
            if (index < 0) {
                return;
            }
            const prevQuantity = this.quantities[index];
            this.$set(this.quantities, index, { ...prevQuantity, ...quantities });
        },

        setDisplayGroup(group) {
            this.displayGroup = group;
        },

        async save() {
            const { id } = this.event;
            if (!id) {
                return;
            }

            this.isSaving = true;
            this.validationErrors = null;

            try {
                const { data } = await this.$http.put(`events/${id}/return`, this.quantities);
                this.setEventData(data);
            } catch (error) {
                this.displayError(error);
            }
        },

        async terminate() {
            const { id } = this.event;
            if (!id) {
                return;
            }

            const hasBroken = this.quantities.some(({ broken }) => broken > 0);

            const response = await confirm({
                title: this.$t('page-event-return.confirm-terminate-title'),
                text: hasBroken
                    ? this.$t('page-event-return.confirm-terminate-text-with-broken')
                    : this.$t('page-event-return.confirm-terminate-text'),
                confirmButtonText: this.$t('terminate-inventory'),
            });

            if (!response.isConfirmed) {
                return;
            }

            this.isSaving = true;
            this.isTerminating = true;
            this.validationErrors = null;

            try {
                const { data } = await this.$http.put(`events/${id}/terminate`, this.quantities);
                this.setEventData(data);
            } catch (error) {
                this.displayError(error);
            }
        },

        displayError(error) {
            this.isLoading = false;
            this.isSaving = false;
            this.isTerminating = false;

            if (error.response.status === 400) {
                this.error = new Error(this.$t('inventory-validation-error'));
                this.validationErrors = error.response.data.error.details;
                return;
            }

            this.error = error;
        },
    },
};

export default EventReturnPage;
