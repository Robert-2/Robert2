import './index.scss';
import axios from 'axios';
import moment from 'moment';
import HttpCode from 'status-code-enum';
import { ApiErrorCode } from '@/stores/api/@codes';
import Fragment from '@/components/Fragment';
import Loading from '@/themes/default/components/Loading';
import CriticalError, { ERROR } from '@/themes/default/components/CriticalError';
import Page from '@/themes/default/components/Page';
import apiEvents from '@/stores/api/events';
import { confirm } from '@/utils/alert';
import Header from './components/Header';
import Footer from './components/Footer';
import NotStarted from './components/NotStarted';
import Inventory, { DisplayGroup } from './components/Inventory';

// @vue/component
export default {
    name: 'EventReturn',
    data() {
        return {
            id: parseInt(this.$route.params.id, 10),
            event: null,
            inventory: [],
            isLoading: false,
            isFetched: false,
            isSaving: false,
            displayGroup: DisplayGroup.CATEGORIES,
            criticalError: null,
            validationErrors: null,
            now: Date.now(),
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
            if (!this.event) {
                return false;
            }
            const startDate = moment(this.event.start_date);
            return startDate.isSameOrBefore(this.now, 'day');
        },

        hasEnded() {
            if (!this.event) {
                return false;
            }
            const endDate = moment(this.event.end_date);
            return endDate.isSameOrBefore(this.now, 'day');
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

        // - Actualise le timestamp courant toutes les minutes.
        this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60_000);
    },
    beforeUnmount() {
        if (this.nowTimer) {
            clearInterval(this.nowTimer);
        }
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChangeInventory(id, quantities) {
            const index = this.inventory.findIndex(({ id: _id }) => id === _id);
            if (index < 0) {
                return;
            }
            this.$set(this.inventory, index, { id, ...quantities });
        },

        handleChangeDisplayGroup(group) {
            this.displayGroup = group;
        },

        async handleSave() {
            await this.save();
        },

        async handleTerminate() {
            const { $t: __ } = this;

            const hasBroken = this.inventory.some(({ broken }) => broken > 0);
            const isConfirmed = await confirm({
                title: __('page.event-return.confirm-terminate-title'),
                confirmButtonText: __('terminate-inventory'),
                text: hasBroken
                    ? __('page.event-return.confirm-terminate-text-with-broken')
                    : __('page.event-return.confirm-terminate-text'),

            });
            if (!isConfirmed) {
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
                if (!axios.isAxiosError(error)) {
                    // eslint-disable-next-line no-console
                    console.error(`Error ocurred while retrieving event #${this.id} data`, error);
                    this.criticalError = ERROR.UNKNOWN;
                } else {
                    const { status = HttpCode.ServerErrorInternal } = error.response ?? {};
                    this.criticalError = status === HttpCode.ClientErrorNotFound
                        ? ERROR.NOT_FOUND
                        : ERROR.UNKNOWN;
                }
            }
        },

        async save(finish = false) {
            if (this.isSaving) {
                return;
            }
            this.isSaving = true;
            const { $t: __, inventory } = this;

            const doRequest = () => (
                finish
                    ? apiEvents.finishReturnInventory(this.id, inventory)
                    : apiEvents.updateReturnInventory(this.id, inventory)
            );

            try {
                const _event = await doRequest();
                this.setEvent(_event);

                this.validationErrors = null;
                this.$toasted.success(__('page.event-return.saved'));
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                if (code === ApiErrorCode.VALIDATION_FAILED) {
                    // TODO: Valider que c'est bien au format `InventoryMaterialError[]` avec Zod ?
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
            this.inventory = event.materials.map(
                ({ id, pivot }) => ({
                    id,
                    actual: pivot.quantity_returned || 0,
                    broken: pivot.quantity_returned_broken || 0,
                }),
            );
        },
    },
    render() {
        const {
            event,
            inventory,
            pageTitle,
            isFetched,
            criticalError,
            validationErrors,
            hasStarted,
            isSaving,
            hasEnded,
            isDone,
            displayGroup,
            handleChangeDisplayGroup,
            handleChangeInventory,
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
                    <Header
                        event={event}
                        hasStarted={hasStarted}
                        onDisplayGroupChange={handleChangeDisplayGroup}
                    />
                    {!hasStarted && <NotStarted />}
                    {hasStarted && (
                        <Fragment>
                            <Inventory
                                inventory={inventory}
                                materials={event.materials}
                                displayGroup={displayGroup}
                                errors={validationErrors}
                                isLocked={isDone}
                                onChange={handleChangeInventory}
                            />
                            <Footer
                                isDone={isDone}
                                isSaving={isSaving}
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
