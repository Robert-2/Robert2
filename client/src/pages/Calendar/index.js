import moment from 'moment';
import { DATE_DB_FORMAT, DATE_QUERY_FORMAT } from '@/config/constants';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';
import EventDetails from '@/components/EventDetails';
import Timeline from '@/components/Timeline';
import CalendarHeader from './Header/Header.vue';
import CalendarCaption from './Caption';
import formatEvent from './utils';

const ONE_DAY = 1000 * 3600 * 24;

export default {
    name: 'Calendar',
    components: {
        CalendarHeader,
        Timeline,
        Help,
        CalendarCaption,
    },
    data() {
        let start = moment().subtract(2, 'days').startOf('day');
        let end = moment().add(5, 'days').endOf('day');

        const savedStart = localStorage.getItem('calendarStart');
        const savedEnd = localStorage.getItem('calendarEnd');
        if (savedStart && savedEnd) {
            start = savedStart;
            end = savedEnd;
        }

        const isVisitor = this.$store.getters['auth/is']('visitor');
        const parkFilter = this.$route.query.park;

        return {
            help: 'page-calendar.help',
            error: null,
            isLoading: false,
            fetchStart: moment().subtract(8, 'days').startOf('day'),
            fetchEnd: moment().add(1, 'months').endOf('month'),
            isModalOpened: false,
            hasMissingMaterialFilter: false,
            parkId: parkFilter ? Number.parseInt(parkFilter, 10) : null,
            events: [],
            allEvents: [],
            timelineOptions: {
                start,
                end,
                selectable: !isVisitor,
                zoomMin: ONE_DAY * 7,
                zoomMax: ONE_DAY * 6 * 30,
            },
        };
    },
    mounted() {
        this.getEventsData();
    },
    methods: {
        filterEvents() {
            let events = [...this.allEvents];
            if (this.parkId) {
                events = events.filter(
                    ({ parks: eventParks }) => eventParks?.includes(this.parkId),
                );
            }

            if (this.hasMissingMaterialFilter) {
                events = events.filter(({ hasMissingMaterials }) => !!hasMissingMaterials);
            }

            this.events = events;
        },

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
                    this.events = data.data.map((event) => formatEvent(event, this.$t));

                    this.allEvents = [...this.events];
                    this.filterEvents();

                    this.isLoading = false;
                })
                .catch((error) => {
                    this.showError(error);
                });
        },

        setCenterDate(date) {
            this.$refs.Timeline.moveTo(date);
        },

        onItemOver() {
            this.help = 'page-calendar.help-timeline-event-operations';
        },

        onItemOut() {
            this.help = 'page-calendar.help';
        },

        onItemMoved(item, callback) {
            const isVisitor = this.$store.getters['auth/is']('visitor');
            if (isVisitor) {
                return;
            }

            const url = `${this.$route.meta.resource}/${item.id}`;
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
            this.$http.put(url, data)
                .then(() => {
                    this.isLoading = false;
                    this.help = { type: 'success', text: 'page-calendar.event-saved' };
                    callback(item);
                    this.getEventsData();
                })
                .catch((error) => {
                    callback(null); // - Needed to cancel the move in timeline
                    this.showError(error);
                });
        },

        onItemRemove(item, callback) {
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
                const url = `${this.$route.meta.resource}/${item.id}`;
                this.$http.delete(url).then(() => {
                    callback(item);
                });
            });
        },

        onItemRemoved() {
            if (!this.isLoading) {
                return;
            }

            this.help = { type: 'success', text: 'page-calendar.event-deleted' };
            this.error = null;
            this.isLoading = false;
        },

        onDoubleClick(e) {
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

        onRangeChanged(newPeriod) {
            const dates = Object.fromEntries(['start', 'end'].map(
                (type) => [type, newPeriod[type].getTime()],
            ));

            localStorage.setItem('calendarStart', dates.start);
            localStorage.setItem('calendarEnd', dates.end);
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

        handleUpdateEvent(newEventData) {
            const events = [...this.events];
            const toUpdateIndex = events.findIndex((event) => event.id === newEventData.id);
            if (toUpdateIndex < 0) {
                return;
            }

            events[toUpdateIndex] = formatEvent(newEventData, this.$t);
            this.events = events;
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

        handleFilterMissingMaterial(hasMissingMaterialFilter) {
            this.hasMissingMaterialFilter = hasMissingMaterialFilter;
            this.filterEvents();
        },

        handleFilterByPark(parkId) {
            this.parkId = parkId === '' ? null : Number.parseInt(parkId, 10);
            this.filterEvents();
        },
    },
};
