import './index.scss';
import moment from 'moment';
import queryClient from '@/globals/queryClient';
import { DATE_DB_FORMAT } from '@/globals/constants';
import apiEvents from '@/stores/api/events';
import { confirm } from '@/utils/alert';
import EventDetails from '@/modals/EventDetails';
import Page from '@/components/Page';
import CriticalError from '@/components/CriticalError';
import Timeline from '@/components/Timeline';
import CalendarHeader from './components/Header';
import CalendarCaption from './components/Caption';
import { formatEvent, getDefaultPeriod } from './_utils';

const ONE_DAY = 1000 * 3600 * 24;
const FETCH_DELTA_DAYS = 3;
const MAX_ZOOM_MONTH = 3;

// @vue/component
export default {
    name: 'Calendar',
    data() {
        const parkFilter = this.$route.query.park;
        const { start, end } = getDefaultPeriod();

        return {
            hasCriticalError: false,
            isLoading: false,
            isSaving: false,
            isDeleting: false,
            isOverItem: false,
            fetchStart: moment(start).subtract(FETCH_DELTA_DAYS, 'days').startOf('day'),
            fetchEnd: moment(end).add(FETCH_DELTA_DAYS, 'days').endOf('day'),
            isModalOpened: false,
            filterMissingMaterial: false,
            parkId: parkFilter ? Number.parseInt(parkFilter, 10) : null,
            events: [],
        };
    },
    computed: {
        helpText() {
            const { $t: __, isOverItem } = this;
            return isOverItem
                ? __('page.calendar.help-timeline-event-operations')
                : __('page.calendar.help');
        },

        isVisitor() {
            return this.$store.getters['auth/is']('visitor');
        },

        timelineOptions() {
            const { isVisitor } = this;
            const { start, end } = getDefaultPeriod();

            return {
                start,
                end,
                selectable: !isVisitor,
                zoomMin: ONE_DAY * 7,
                zoomMax: ONE_DAY * 30 * MAX_ZOOM_MONTH,
            };
        },

        formattedEvents() {
            const { $t: __, $store: { state: { settings } }, events } = this;
            const { showLocation = true, showBorrower = false } = settings.calendar.event;
            return events.map((event) => formatEvent(event, __, { showBorrower, showLocation }));
        },

        filteredEvents() {
            const { formattedEvents, parkId, filterMissingMaterial } = this;
            let events = [...formattedEvents];

            if (parkId) {
                events = events.filter(({ parks: eventParks }) => (
                    eventParks === null || eventParks?.includes(this.parkId)
                ));
            }

            if (filterMissingMaterial) {
                events = events.filter(({ hasMissingMaterials }) => !!hasMissingMaterials);
            }

            return events;
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleRefresh() {
            this.getEventsData();
        },

        handleSetCenterDate(date) {
            this.$refs.calendarTimeline.moveTo(date);
        },

        handleFilterMissingMaterial(filterMissingMaterial) {
            this.filterMissingMaterial = filterMissingMaterial;
        },

        handleFilterByPark(parkId) {
            this.parkId = parkId === '' ? null : Number.parseInt(parkId, 10);
        },

        handleRangeChanged(newPeriod) {
            const dates = Object.fromEntries(['start', 'end'].map(
                (type) => [type, moment(newPeriod[type])],
            ));

            localStorage.setItem('calendarStart', dates.start.format('YYYY-MM-DD HH:mm:ss'));
            localStorage.setItem('calendarEnd', dates.end.format('YYYY-MM-DD HH:mm:ss'));
            this.$refs.Header.changePeriod(dates);

            this.fetchStart = moment(dates.start).subtract(FETCH_DELTA_DAYS, 'days').startOf('day');
            this.fetchEnd = moment(dates.end).add(FETCH_DELTA_DAYS, 'days').endOf('day');

            this.getEventsData();
        },

        //
        // - Handlers pour les items.
        //

        handleItemOver() {
            this.isOverItem = true;
        },

        handleItemOut() {
            this.isOverItem = false;
        },

        handleItemDoubleClick(e) {
            const { isModalOpened, handleUpdateEvent, handleDuplicateEvent, getEventsData } = this;

            // - On évite le double-call à cause d'un bug qui trigger l'event en double.
            // - @see visjs bug here: https://github.com/visjs/vis-timeline/issues/301)
            if (isModalOpened) {
                return;
            }

            const eventId = e.item;
            if (eventId) {
                this.$modal.show(
                    EventDetails,
                    {
                        eventId,
                        onUpdateEvent: handleUpdateEvent,
                        onDuplicateEvent: handleDuplicateEvent,
                    },
                    undefined,
                    { 'before-close': () => { getEventsData(); } },
                );
                this.isModalOpened = true;
                return;
            }

            const atDate = moment(e.time).startOf('day').format('YYYY-MM-DD');
            this.$router.push({ name: 'add-event', query: { atDate } });
        },

        async handleItemMoved(item, callback) {
            const { isVisitor } = this;
            if (isVisitor) {
                return;
            }

            const itemEnd = moment(item.end);
            if (itemEnd.hour() === 0) {
                itemEnd.subtract(1, 'day').endOf('day');
            }
            const data = {
                start_date: moment(item.start).format(DATE_DB_FORMAT),
                end_date: itemEnd.format(DATE_DB_FORMAT),
            };

            const { $t: __, getEventsData } = this;
            this.isSaving = true;

            try {
                await apiEvents.update(item.id, data);

                // - Permet de placer l'élément à sa nouvelle place sur la timeline
                callback(item);

                this.$toasted.success(__('page.calendar.event-saved'));
                queryClient.invalidateQueries('materials-while-event');
                getEventsData();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-saving'));

                // - Permet d'annuler le déplacement de l'élément sur la timeline
                callback(null);
            } finally {
                this.isSaving = false;
            }
        },

        async handleItemRemove(item, callback) {
            const { isVisitor } = this;
            if (isVisitor || item.isConfirmed) {
                return;
            }

            const { $t: __, getEventsData } = this;

            const { value: isConfirmed } = await confirm({
                type: 'warning',
                text: __('@event.confirm-delete'),
                confirmButtonText: __('yes-delete'),
            });
            if (!isConfirmed) {
                // - Permet d'annuler la suppression de l'élément sur la timeline
                callback(null);
                return;
            }

            this.isDeleting = true;

            try {
                await apiEvents.remove(item.id);

                // - Permet de supprimer l'élément de la timeline
                callback(item);

                this.$toasted.success(__('page.calendar.event-deleted'));
                queryClient.invalidateQueries('materials-while-event');
                getEventsData();
            } catch {
                this.$toasted.error(__('errors.unexpected-while-saving'));
                callback(null);
            } finally {
                this.isDeleting = false;
            }
        },

        handleUpdateEvent(newEventData) {
            queryClient.invalidateQueries('materials-while-event');
            const toUpdateIndex = this.events.findIndex(
                (event) => event.id === newEventData.id,
            );
            if (toUpdateIndex >= 0) {
                this.$set(this.events, toUpdateIndex, newEventData);
            }
        },

        handleDuplicateEvent(newEvent) {
            const { start_date: startDate } = newEvent;
            const date = moment(startDate).toDate();
            this.$refs.calendarTimeline.moveTo(date);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async getEventsData() {
            this.isLoading = true;
            this.isModalOpened = false;

            const params = {
                start: this.fetchStart.format('YYYY-MM-DD HH:mm:ss'),
                end: this.fetchEnd.format('YYYY-MM-DD HH:mm:ss'),
            };

            try {
                const { data } = await apiEvents.all(params);
                this.events = data;
            } catch (error) {
                const { status } = error.response ?? { status: 0 };
                if (status === 416) {
                    this.$refs.calendarTimeline.zoomIn(1, { animation: false });
                    return;
                }
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            isLoading,
            isSaving,
            isDeleting,
            hasCriticalError,
            helpText,
            filteredEvents,
            timelineOptions,
            handleRefresh,
            handleItemDoubleClick,
            handleRangeChanged,
            handleFilterByPark,
            handleSetCenterDate,
            handleFilterMissingMaterial,
            handleItemOver,
            handleItemOut,
            handleItemMoved,
            handleItemRemove,
        } = this;

        if (hasCriticalError) {
            return (
                <Page name="calendar" title={__('page.calendar.title')}>
                    <CriticalError />
                </Page>
            );
        }

        return (
            <Page name="calendar" title={__('page.calendar.title')}>
                <div class="Calendar">
                    <CalendarHeader
                        ref="Header"
                        isLoading={isLoading || isSaving || isDeleting}
                        onRefresh={handleRefresh}
                        onSetCenterDate={handleSetCenterDate}
                        onFilterMissingMaterials={handleFilterMissingMaterial}
                        onFilterByPark={handleFilterByPark}
                    />
                    <Timeline
                        ref="calendarTimeline"
                        class="Calendar__timeline"
                        items={filteredEvents}
                        options={timelineOptions}
                        onItemOver={handleItemOver}
                        onItemOut={handleItemOut}
                        onItemMoved={handleItemMoved}
                        onItemRemove={handleItemRemove}
                        onDoubleClick={handleItemDoubleClick}
                        onRangeChanged={handleRangeChanged}
                    />
                    <div class="Calendar__footer">
                        <p class="Calendar__footer__help">{helpText}</p>
                        <CalendarCaption />
                    </div>
                </div>
            </Page>
        );
    },
};
