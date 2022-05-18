import './index.scss';
import moment from 'moment';
import { Fragment } from 'vue-fragment';
import Loading from '@/components/Loading';
import CriticalError from '@/components/CriticalError';
import Page from '@/components/Page';
import apiEvents from '@/stores/api/events';
import { confirm } from '@/utils/alert';
import EventReturnHeader from './Header';
import EventReturnNotStarted from './NotStarted';
import MaterialsList from './MaterialsList';
import EventReturnFooter from './Footer';

// @vue/component
export default {
    name: 'EventReturn',
    data() {
        return {
            isLoading: false,
            isFetched: false,
            hasCriticalError: false,
            validationErrors: null,
            isSaving: false,
            isTerminating: false,
            displayGroup: 'categories',
            eventData: {
                id: this.$route.params.id ?? null,
                materials: [],
                beneficiaries: [],
            },
            startDate: null,
            endDate: null,
            quantities: [],
        };
    },
    computed: {
        pageTitle() {
            const { $t: __ } = this;
            const { title } = this.eventData;
            return title
                ? __('page-event-return.title', { name: title })
                : __('page-event-return.title-simple');
        },

        hasStarted() {
            const { startDate } = this;
            return startDate ? startDate.isSameOrBefore(new Date(), 'day') : false;
        },

        hasEnded() {
            const { endDate } = this;
            return endDate ? endDate.isSameOrBefore(new Date(), 'day') : false;
        },

        isDone() {
            const { eventData } = this;
            return !!eventData.is_return_inventory_done;
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChangeQuantities(id, newQuantities) {
            const { quantities } = this;
            const index = quantities.findIndex(({ id: _id }) => id === _id);
            if (index < 0) {
                return;
            }
            const prevQuantities = quantities[index];
            this.$set(quantities, index, { ...prevQuantities, ...newQuantities });
        },

        handleChangeDisplayGroup(group) {
            this.displayGroup = group;
        },

        async handleSave() {
            await this.save();
        },

        async handleTerminate() {
            const hasBroken = this.quantities.some(({ broken }) => broken > 0);
            const confirmation = await confirm({
                title: this.$t('page-event-return.confirm-terminate-title'),
                text: hasBroken
                    ? this.$t('page-event-return.confirm-terminate-text-with-broken')
                    : this.$t('page-event-return.confirm-terminate-text'),
                confirmButtonText: this.$t('terminate-inventory'),
            });

            if (!confirmation.isConfirmed) {
                return;
            }

            await this.save(true);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            const { eventData: { id } } = this;
            if (!id) {
                return;
            }

            this.isLoading = true;

            try {
                const eventData = await apiEvents.one(id);
                this.setEventData(eventData);
                this.isFetched = true;
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }
        },

        async save(terminate = false) {
            const { $t: __, eventData: { id }, quantities } = this;
            if (!id) {
                return;
            }

            this.isSaving = true;

            const doRequest = () => (
                terminate ? apiEvents.terminate(id, quantities) : apiEvents.setReturn(id, quantities)
            );

            try {
                const eventNewData = await doRequest();
                this.setEventData(eventNewData);
                this.validationErrors = null;
                this.$toasted.success(__('page-event-return.saved'));
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.validationErrors = [...details];
                } else {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                }
            } finally {
                this.isSaving = false;
            }
        },

        setEventData(data) {
            this.eventData = data;

            this.startDate = moment(data.start_date);
            this.endDate = moment(data.end_date);

            this.quantities = data.materials.map(
                ({ id, pivot }) => ({
                    id,
                    awaited_quantity: pivot.quantity || 0,
                    actual: pivot.quantity_returned || 0,
                    broken: pivot.quantity_broken || 0,
                }),
            );
        },
    },
    render() {
        const {
            $t: __,
            pageTitle,
            isLoading,
            isFetched,
            eventData,
            hasCriticalError,
            validationErrors,
            hasStarted,
            isSaving,
            isTerminating,
            hasEnded,
            isDone,
            displayGroup,
            quantities,
            handleChangeDisplayGroup,
            handleChangeQuantities,
            handleSave,
            handleTerminate,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <Page name="event-return" title={__('page-event-return.material-return')}>
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                name="event-return"
                title={pageTitle}
                error={validationErrors ? __('errors.validation') : undefined}
                isLoading={isLoading}
            >
                <div class="EventReturn">
                    <EventReturnHeader
                        eventData={eventData}
                        hasStarted={hasStarted}
                        onDisplayGroupChange={handleChangeDisplayGroup}
                    />
                    {!hasStarted && <EventReturnNotStarted />}
                    {hasStarted && (
                        <Fragment>
                            <MaterialsList
                                materials={eventData.materials}
                                displayGroup={displayGroup}
                                quantities={quantities}
                                errors={validationErrors}
                                isLocked={isDone}
                                onChange={handleChangeQuantities}
                            />
                            <EventReturnFooter
                                isDone={isDone}
                                isSaving={isSaving || isTerminating}
                                hasEnded={hasEnded}
                                onSave={handleSave}
                                onTerminate={handleTerminate}
                            />
                        </Fragment>
                    )}
                </div>
            </Page>
        );
    },
};
