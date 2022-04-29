import './index.scss';
import moment from 'moment';
import queryClient from '@/globals/queryClient';
import { DATE_DB_FORMAT, DATE_QUERY_FORMAT } from '@/globals/constants';
import Alert from '@/components/Alert';
import Help from '@/components/Help';
import EventDetails from '@/components/EventDetails';
import Timeline from '@/components/Timeline';
import CalendarHeader from './Header';
import CalendarCaption from './Caption';
import formatEvent from './_utils';

const ONE_DAY = 1000 * 3600 * 24;

// @vue/component
export default {
    name: 'Calendar',
    data() {
        const isVisitor = this.$store.getters['auth/is']('visitor');
        const parkFilter = this.$route.query.park;

        // - Intervalle affiché dans le calendrier.
        let start = moment(localStorage.getItem('calendarStart'), 'YYYY-MM-DD HH:mm:ss');
        let end = moment(localStorage.getItem('calendarEnd'), 'YYYY-MM-DD HH:mm:ss');
        if (!start.isValid() || !end.isValid()) {
            start = moment().subtract(2, 'days').startOf('day');
            end = moment().add(5, 'days').endOf('day');
        }

        return {
            error: null,
            isLoading: false,
            isOverItem: false,
            fetchStart: moment(start).subtract(8, 'days').startOf('day'),
            fetchEnd: moment(end).add(1, 'months').endOf('month'),
            isModalOpened: false,
            filterMissingMaterial: false,
            parkId: parkFilter ? Number.parseInt(parkFilter, 10) : null,
            events: [],
            timelineOptions: {
                start,
                end,
                selectable: !isVisitor,
                zoomMin: ONE_DAY * 7,
                zoomMax: ONE_DAY * 6 * 30,
            },
        };
    },
    computed: {
        help() {
            if (this.isOverItem) {
                return 'page-calendar.help-timeline-event-operations';
            }
            return 'page-calendar.help';
        },

        formattedEvents() {
            const { $t: __, $store: { state: { settings } } } = this;
            const { showLocation = true, showBorrower = false } = settings.calendar.event;
            return this.events.map((event) => formatEvent(event, __, { showBorrower, showLocation }));
        },

        filteredEvents() {
            let events = [...this.formattedEvents];

            if (this.parkId) {
                events = events.filter(({ parks: eventParks }) => (
                    eventParks?.includes(this.parkId)
                ));
            }

            if (this.filterMissingMaterial) {
                events = events.filter(({ hasMissingMaterials }) => !!hasMissingMaterials);
            }

            return events;
        },
    },
    mounted() {
        this.getEventsData();
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

        handleDoubleClick(e) {
            // - On évite le double-call à cause d'un bug qui trigger l'event en double.
            // - @see visjs bug here: https://github.com/visjs/vis-timeline/issues/301)
            if (this.isModalOpened) {
                return;
            }

            const eventId = e.item;
            if (eventId) {
                this.openEventModal(eventId);
                this.isModalOpened = true;
                return;
            }

            const atDate = moment(e.time).startOf('day').format(DATE_QUERY_FORMAT);
            this.$router.push({
                path: '/events/new',
                query: { atDate },
            });
        },

        handleRangeChanged(newPeriod) {
            const dates = Object.fromEntries(['start', 'end'].map(
                (type) => [type, moment(newPeriod[type])],
            ));

            localStorage.setItem('calendarStart', dates.start.format('YYYY-MM-DD HH:mm:ss'));
            localStorage.setItem('calendarEnd', dates.end.format('YYYY-MM-DD HH:mm:ss'));
            this.$refs.Header.changePeriod(dates);

            let needFetch = false;
            if (this.fetchStart.isAfter(dates.start)) {
                this.fetchStart = moment(dates.start).subtract(8, 'days').startOf('day');
                needFetch = true;
            }

            if (this.fetchEnd.isBefore(dates.end)) {
                this.fetchEnd = moment(dates.end).add(1, 'months').endOf('month');
                needFetch = true;
            }

            if (needFetch) {
                this.getEventsData();
            }
        },

        handleSetCenterDate(date) {
            this.$refs.Timeline.moveTo(date);
        },

        handleFilterMissingMaterial(filterMissingMaterial) {
            this.filterMissingMaterial = filterMissingMaterial;
        },

        handleFilterByPark(parkId) {
            this.parkId = parkId === '' ? null : Number.parseInt(parkId, 10);
        },

        //
        // - Événements sur les items.
        //

        handleItemOver() {
            this.isOverItem = true;
        },

        handleItemOut() {
            this.isOverItem = false;
        },

        handleItemMoved(item, callback) {
            const isVisitor = this.$store.getters['auth/is']('visitor');
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

            this.error = null;
            this.isLoading = true;
            this.$http.put(`${this.$route.meta.resource}/${item.id}`, data)
                .then(() => {
                    this.isLoading = false;
                    this.help = { type: 'success', text: 'page-calendar.event-saved' };
                    queryClient.invalidateQueries('materials-while-event');
                    callback(item);
                    this.getEventsData();
                })
                .catch((error) => {
                    callback(null); // - Needed to cancel the move in timeline
                    this.showError(error);
                });
        },

        handleItemRemove(item, callback) {
            const isVisitor = this.$store.getters['auth/is']('visitor');
            if (isVisitor || item.isConfirmed) {
                return;
            }

            Alert.ConfirmDelete(this.$t, 'calendar').then((result) => {
                if (!result.value) {
                    callback(null); // - Needed to cancel the deletion in timeline
                    return;
                }

                this.error = null;
                this.isLoading = true;
                this.$http.delete(`${this.$route.meta.resource}/${item.id}`).then(() => {
                    queryClient.invalidateQueries('materials-while-event');
                    callback(item);
                });
            });
        },

        handleItemRemoved() {
            if (!this.isLoading) {
                return;
            }

            this.isLoading = false;
            this.help = { type: 'success', text: 'page-calendar.event-deleted' };
            this.error = null;
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        getEventsData() {
            this.error = null;
            this.isLoading = true;
            this.isModalOpened = false;

            const params = {
                start: this.fetchStart.format('YYYY-MM-DD HH:mm:ss'),
                end: this.fetchEnd.format('YYYY-MM-DD HH:mm:ss'),
            };
            this.$http.get(this.$route.meta.resource, { params })
                .then(({ data }) => {
                    this.events = data.data;
                    this.isLoading = false;
                })
                .catch((error) => {
                    this.showError(error);
                });
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
            this.setCenterDate(moment(startDate).toDate());
        },

        openEventModal(eventId) {
            const { handleUpdateEvent, handleDuplicateEvent } = this;

            this.$modal.show(
                EventDetails,
                {
                    eventId,
                    onUpdateEvent: handleUpdateEvent,
                    onDuplicateEvent: handleDuplicateEvent,
                },
                undefined,
                {
                    'before-close': () => {
                        this.getEventsData();
                    },
                },
            );
        },

        showError(error) {
            this.error = error;
            this.isLoading = false;
        },
    },
    render() {
        const {
            isLoading,
            help,
            error,
            filteredEvents,
            timelineOptions,
            handleRefresh,
            handleDoubleClick,
            handleRangeChanged,
            handleFilterByPark,
            handleSetCenterDate,
            handleFilterMissingMaterial,
            handleItemOver,
            handleItemOut,
            handleItemMoved,
            handleItemRemove,
            handleItemRemoved,
        } = this;

        return (
            <div class="content">
                <div class="content__header">
                    <CalendarHeader
                        ref="Header"
                        isLoading={isLoading}
                        onRefresh={handleRefresh}
                        onSetCenterDate={handleSetCenterDate}
                        onFilterMissingMaterials={handleFilterMissingMaterial}
                        onFilterByPark={handleFilterByPark}
                    />
                </div>
                <div ref="Container" class="content__main-view Calendar">
                    <i class="fas fa-circle-notch fa-3x fa-spin Calendar__loading" />
                    <Timeline
                        ref="Timeline"
                        class="Calendar__timeline"
                        items={filteredEvents}
                        options={timelineOptions}
                        onItemOver={handleItemOver}
                        onItemOut={handleItemOut}
                        onItemMoved={handleItemMoved}
                        onItemRemove={handleItemRemove}
                        onItemRemoved={handleItemRemoved}
                        onDoubleClick={handleDoubleClick}
                        onRangeChanged={handleRangeChanged}
                    />
                    <div class="Calendar__footer">
                        <Help message={help} error={error} />
                        <CalendarCaption />
                    </div>
                </div>
            </div>
        );
    },
};
