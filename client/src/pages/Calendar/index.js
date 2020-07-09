import moment from 'moment';
import { Timeline } from 'vue-visjs';
import { DATE_DB_FORMAT, DATE_QUERY_FORMAT } from '@/config/constants';
import ModalConfig from '@/config/modalConfig';
import store from '@/store';
import Alert from '@/components/Alert';
import Help from '@/components/Help/Help.vue';
import CalendarHeader from './Header/Header.vue';
import EventDetails from './EventDetails/EventDetails.vue';
import utils from './utils';

const ONE_DAY = 1000 * 3600 * 24;

export default {
  name: 'Calendar',
  components: {
    CalendarHeader,
    Timeline,
    EventDetails,
    Help,
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

    const isVisitor = store.state.user.groupId === 'visitor';

    return {
      help: 'page-calendar.help',
      error: null,
      isLoading: false,
      fetchStart: moment().subtract(8, 'days').startOf('day'),
      fetchEnd: moment().add(1, 'months').endOf('month'),
      isModalOpened: false,
      events: [],
      timelineOptions: {
        selectable: !isVisitor,
        editable: {
          add: false,
          updateTime: true,
          updateGroup: false,
          remove: true,
          overrideItems: false,
        },
        start,
        end,
        locale: store.state.i18n.locale,
        minHeight: 300,
        orientation: 'top',
        zoomMin: ONE_DAY * 7,
        zoomMax: ONE_DAY * 60,
        tooltip: { followMouse: true, overflowMethod: 'flip' },
        moment: (date) => moment(date),
        onMove: (item, callback) => {
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
            })
            .catch((error) => {
              callback(null); // - Needed to cancel the move in timeline
              this.showError(error);
            });
        },
        onRemove: (item, callback) => {
          if (isVisitor) {
            return;
          }

          Alert.ConfirmDelete(this.$t, 'calendar')
            .then((result) => {
              if (!result.value) {
                callback(null); // - Needed to cancel the deletion in timeline
                return;
              }

              this.error = null;
              this.isLoading = true;
              const url = `${this.$route.meta.resource}/${item.id}`;
              this.$http.delete(url).then(() => { callback(item); });
            });
        },
      },
    };
  },
  mounted() {
    this.getEventsData();
  },
  methods: {
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
          this.events = data.data.map(
            (event) => utils.formatTimelineEvent(event, this.$t),
          );
          this.isLoading = false;
        })
        .catch((error) => {
          this.showError(error);
        });
    },

    onRangeChanged(newPeriod) {
      localStorage.setItem('calendarStart', newPeriod.start);
      localStorage.setItem('calendarEnd', newPeriod.end);

      this.$refs.Header.changePeriod(newPeriod);

      let needFetch = false;
      if (this.fetchStart.isAfter(newPeriod.start)) {
        this.fetchStart = moment(newPeriod.start).subtract(8, 'days').startOf('day');
        needFetch = true;
      }

      if (this.fetchEnd.isBefore(newPeriod.end)) {
        this.fetchEnd = moment(newPeriod.end).add(1, 'months').endOf('month');
        needFetch = true;
      }

      if (needFetch) {
        this.getEventsData();
      }
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

    onDoubleClick(e) {
      // - Here we avoid double-call because of double-trigger of event,
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

      const startDate = moment(e.time).startOf('day').format(DATE_QUERY_FORMAT);
      this.$router.push({
        path: '/events/new',
        query: { startDate },
      });
    },

    openEventModal(eventId) {
      this.$modal.show(
        EventDetails,
        { eventId },
        ModalConfig,
        {
          'before-close': () => {
            this.getEventsData();
          },
        },
      );
    },

    onRemoved() {
      this.help = { type: 'success', text: 'page-calendar.event-deleted' };
      this.error = null;
      this.isLoading = false;
    },

    showError(error) {
      this.error = error;
      this.isLoading = false;
    },
  },
};
