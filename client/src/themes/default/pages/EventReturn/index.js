import './index.scss';
import moment from 'moment';
import Fragment from '@/themes/default/components/Fragment';
import Loading from '@/themes/default/components/Loading';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Page from '@/themes/default/components/Page';
import apiEvents from '@/stores/api/events';
import { confirm } from '@/utils/alert';
import EventReturnHeader from './components/Header';
import EventReturnNotStarted from './components/NotStarted';
import MaterialsList from './components/MaterialsList';
import EventReturnFooter from './components/Footer';

// @vue/component
export default {
    name: 'EventReturn',
    data() {
        const id = this.$route.params.id
            ? parseInt(this.$route.params.id, 10)
            : null;

        return {
            id,
            event: null,
            isLoading: false,
            isFetched: false,
            isSaving: false,
            isTerminating: false,
            displayGroup: 'categories',
            startDate: null,
            endDate: null,
            quantities: [],
            criticalError: null,
            validationErrors: null,
        };
    },
    computed: {
        pageTitle() {
            const { $t: __, isFetched, event } = this;

            return isFetched
                ? __('page.event-return.title', { name: event.title })
                : __('page.event-return.title-simple');
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
            if (!this.isFetched) {
                return false;
            }
            return !!this.event.is_return_inventory_done;
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
            const { $t: __ } = this;

            const hasBroken = this.quantities.some(({ broken }) => broken > 0);
            const confirmation = await confirm({
                title: __('page.event-return.confirm-terminate-title'),
                confirmButtonText: __('terminate-inventory'),
                text: hasBroken
                    ? __('page.event-return.confirm-terminate-text-with-broken')
                    : __('page.event-return.confirm-terminate-text'),

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
            try {
                const event = await apiEvents.one(this.id);
                this.setEvent(event);
                this.isFetched = true;
            } catch (error) {
                const status = error?.response?.status ?? 500;
                this.criticalError = status === 404 ? ERROR.NOT_FOUND : ERROR.UNKNOWN;
            }
        },

        async save(terminate = false) {
            if (this.isSaving) {
                return;
            }
            this.isSaving = true;
            const { $t: __, quantities } = this;

            const doRequest = () => (
                terminate
                    ? apiEvents.terminate(this.id, quantities)
                    : apiEvents.setReturn(this.id, quantities)
            );

            try {
                const _event = await doRequest();
                this.setEvent(_event);

                this.validationErrors = null;
                this.$toasted.success(__('page.event-return.saved'));
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.validationErrors = [...details];
                    this.$refs.page.scrollToTop();
                } else {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                }
            } finally {
                this.isSaving = false;
            }
        },

        setEvent(event) {
            this.event = event;

            this.startDate = moment(event.start_date);
            this.endDate = moment(event.end_date);

            this.quantities = event.materials.map(
                ({ id, is_unitary: isUnitary, pivot }) => ({
                    id,
                    awaited_quantity: pivot.quantity || 0,
                    actual: pivot.quantity_returned || 0,
                    broken: pivot.quantity_broken || 0,
                    is_unitary: isUnitary,
                    units: pivot.units_with_return.map((unit) => ({
                        id: unit.id,
                        isLost: !unit.is_returned,
                        isBroken: !!unit.is_returned_broken,
                    })),
                }),
            );
        },
    },
    render() {
        const {
            event,
            pageTitle,
            isFetched,
            criticalError,
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

        if (criticalError || !isFetched) {
            return (
                <Page name="event-return" title={pageTitle}>
                    {criticalError ? <CriticalError type={criticalError} /> : <Loading />}
                </Page>
            );
        }

        return (
            <Page
                ref="page"
                name="event-return"
                title={pageTitle}
                hasValidationError={!!validationErrors}
            >
                <div class="EventReturn">
                    <EventReturnHeader
                        event={event}
                        hasStarted={hasStarted}
                        onDisplayGroupChange={handleChangeDisplayGroup}
                    />
                    {!hasStarted && <EventReturnNotStarted />}
                    {hasStarted && (
                        <Fragment>
                            <MaterialsList
                                materials={event.materials}
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
